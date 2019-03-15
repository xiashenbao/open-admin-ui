<template>
  <div>
    <div class="search-con search-con-top">
      <ButtonGroup>
        <Button :disabled="value.menuId?false:true" class="search-btn" type="primary" @click="handleModal()">
          <Icon type="search"/>&nbsp;&nbsp;新建操作
        </Button>
      </ButtonGroup>
    </div>
    <Table :columns="columns" :data="data">
      <template slot="status" slot-scope="{ row }">
        <Badge v-if="row.status===1" status="success" text="启用"/>
        <Badge v-else="" status="error" text="禁用"/>
      </template>
      <template slot="operation" slot-scope="{ row }">
        <a @click="handleModal(row)">编辑</a> &nbsp;
        <Poptip
          confirm
          title="确定删除吗?"
          @on-ok="handleRemove(row)">
          <a>删除</a>
        </Poptip>
      </template>
    </Table>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-cancel="handleReset">
      <Form ref="operationForm" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="所属菜单">
          <Input disabled v-model="value.menuName"></Input>
        </FormItem>
        <FormItem label="操作标识" prop="operationCode">
          <Input v-model="formItem.operationCode" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="操作名称" prop="operationName">
          <Input v-model="formItem.operationName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="绑定API" prop="apiId">
          <Input v-model="formItem.apiId" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="优先级">
          <InputNumber v-model="formItem.priority"></InputNumber>
        </FormItem>
        <FormItem label="状态">
          <i-switch v-model="formItem.statusSwatch" size="large">
            <span slot="open">启用</span>
            <span slot="close">禁用</span>
          </i-switch>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.operationDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="default" @click="handleReset">取消</Button>&nbsp;
        <Button type="primary" @click="handleSubmit" :loading="saving">保存</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getOperationsByMenu, updateOperation, addOperation, removeOperation} from '@/api/operation'

  export default {
    name: 'MenuOperation',
    props: {
      value: Object
    },
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[_a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('操作标识不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、下划线'))
        }  else {
          callback()
        }
      }
      return {
        modalVisible: false,
        saving: false,
        modalTitle: '',
        confirmModal: false,
        formItemRules: {
          operationCode: [
            {required: true,validator: validateEn, message: '操作编码不能为空', trigger: 'blur'}
          ],
          operationName: [
            {required: true, message: '操作名称不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          operationId: '',
          operationCode: '',
          operationName: '',
          apiId: '',
          status: 1,
          statusSwatch: true,
          menuId: '',
          priority: 0,
          operationDesc: ''
        },
        columns: [
          {
            title: '操作名称',
            key: 'operationName'
          },
          {
            title: '操作标识',
            key: 'operationCode'
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status'
          },
          {
            title: '描述',
            key: 'operationDesc'
          },
          {
            title: '操作',
            slot: 'operation',
            width: 150
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data) {
        if (data) {
          this.modalTitle = '编辑操作 - '+data.operationName
          this.formItem = Object.assign({}, this.formItem, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加操作'
        }
        this.formItem.menuId = this.value.menuId
        this.modalVisible = true
      },
      handleReset () {
        const newData = {
          operationId: '',
          operationCode: '',
          operationName: '',
          apiId: '',
          status: 1,
          statusSwatch: true,
          menuId: '',
          priority: 0,
          operationDesc: ''
        }
        this.formItem = newData
        //重置验证
        this.$refs['operationForm'].resetFields()
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        this.$refs['operationForm'].validate((valid) => {
          if (valid) {
            this.saving = true
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.operationId) {
              updateOperation(this.formItem).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
              }).finally(() =>{
                this.saving = false
              })
            } else {
              addOperation(this.formItem).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
              }).finally(() =>{
                this.saving = false
              })
            }
          }
        })
      },
      handleSearch () {
        if (!this.value.menuId) {
          this.data = []
          return
        }
        getOperationsByMenu(this.value.menuId).then(res => {
          this.data = res.data
        })
      },
      handleRemove (data) {
        removeOperation({operationId: data.operationId}).then(res => {
          this.handleSearch()
          if (res.code === 0) {
            this.pageInfo.page = 1
            this.$Message.success('删除成功')
          }
        })
      }
    },
    watch: {
      value (val) {
        this.handleSearch()
      }
    },
    mounted: function () {
    }
  }
</script>
