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
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="error" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
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
      <Form ref="actionForm" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="所属菜单" >
          <Input disabled v-model="value.menuName" ></Input>
        </FormItem>
        <FormItem label="操作标识" prop="actionCode">
          <Input  v-model="formItem.actionCode" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="操作名称" prop="actionName">
          <Input  v-model="formItem.actionName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="请求地址" prop="path">
          <Input  v-model="formItem.path" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="优先级">
          <InputNumber v-model="formItem.priority"></InputNumber>
        </FormItem>
        <FormItem label="状态">
          <i-switch v-model="formItem.statusSwatch" size="large">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.actionDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button type="default" @click="handleReset">取消</Button>&nbsp;
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getActions, updateAction, addAction, removeAction} from '@/api/action'

  export default {
    name: 'MenuAction',
    props: {
      value: Object
    },
    data () {
      return {
        modalVisible: false,
        modalTitle: '',
        confirmModal: false,
        formItemRules: {
          actionCode: [
            {required: true, message: '操作标识不能为空', trigger: 'blur'}
          ],
          actionName: [
            {required: true, message: '操作名称不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          actionId: '',
          actionCode: '',
          actionName: '',
          path: '',
          status: 1,
          statusSwatch: true,
          menuId: '',
          priority: 0,
          actionDesc: ''
        },
        columns: [
          {
            title: '操作名称',
            key: 'actionName'
          },
          {
            title: '操作标识',
            key: 'actionCode'
          },
          {
            title: '请求地址',
            key: 'path'
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status'
          },
          {
            title: '描述',
            key: 'actionDesc'
          },
          {
            title: '操作',
            slot: 'action',
            width: 150
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data) {
        if (data) {
          this.modalTitle = '编辑操作'
          this.formItem = Object.assign({}, this.formItem, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加操作'
        }
        this.formItem.menuId= this.value.menuId
        this.modalVisible = true
      },
      handleReset () {
        const newData = {
          actionId: '',
          actionCode: '',
          actionName: '',
          path: '',
          status: 1,
          statusSwatch: true,
          menuId: '',
          priority: 0,
          actionDesc: ''
        }
        this.formItem = newData
        //重置验证
        this.$refs['actionForm'].resetFields()
        this.modalVisible = false
      },
      handleSubmit () {
        this.$refs['actionForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.actionId) {
              updateAction(this.formItem).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
              })
            } else {
              addAction(this.formItem).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
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
        getActions(this.value.menuId).then(res => {
          this.data = res.data.list
        })
      },
      handleRemove (data) {
        removeAction({actionId: data.actionId}).then(res => {
          this.handleSearch()
          if (res.code === 0) {
            this.pageInfo.page=1
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
