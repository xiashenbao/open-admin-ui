<template>
  <div>
    <div class="search-con search-con-top">
      <ButtonGroup>
        <Button :disabled="value.menuId?false:true" class="search-btn" type="primary" @click="handleModal()">
          <Icon type="search"/>&nbsp;&nbsp;添加操作
        </Button>
      </ButtonGroup>
    </div>
    <Table :columns="columns" :data="data" :loading="loading">
      <template slot="status" slot-scope="{ row }">
        <Badge v-if="row.status===1" status="success"/>
        <Badge v-else="" status="error" />
        {{row.operationName}}
      </template>
      <template slot="operation" slot-scope="{ row }">
        <a @click="handleModal(row)">编辑</a> &nbsp;
        <a @click="handleModal(row,forms[1])">绑定API</a> &nbsp;
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
           width="800"
           @on-cancel="handleReset">
      <Form ref="form1" v-show="current=='form1'" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="所属菜单">
          <Input disabled v-model="value.menuName"></Input>
        </FormItem>
        <FormItem label="操作标识" prop="operationCode">
          <Input v-model="formItem.operationCode" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="操作名称" prop="operationName">
          <Input v-model="formItem.operationName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="优先级">
          <InputNumber v-model="formItem.priority"></InputNumber>
        </FormItem>
        <FormItem label="状态">
          <RadioGroup v-model="formItem.status">
            <Radio label="0">禁用</Radio>
            <Radio label="1">启用</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.operationDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>

      <Form ref="form2" v-show="current=='form2'" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="接口授权(选填)" prop="authorities">
          <Transfer
            :data="selectApis"
            :list-style="{width: '300px',height: '500px'}"
            :titles="['选择接口', '已选择接口']"
            :render-format="transferRender"
            :target-keys="formItem.apiIds"
            @on-change="handleTransferChange"
            filterable>
          </Transfer>
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
  import {getOperationsByMenu, updateOperation, addOperation, removeOperation,addOperationApi,getOperationApi} from '@/api/operation'
  import {getAllApi} from '@/api/api'

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
        loading: false,
        current: 'form1',
        forms: [
          'form1',
          'form2'
        ],
        modalTitle: '',
        confirmModal: false,
        selectApis:[],
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
          apiIds:[],
          status: 1,
          menuId: '',
          priority: 0,
          operationDesc: ''
        },
        columns: [
          {
            title: '操作名称',
            slot: 'status',
          },
          {
            title: '操作编码',
            key: 'operationCode',
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
      handleModal (data, step) {
        if (data) {
          this.formItem = Object.assign({}, this.formItem, data)
        }
        if (!step) {
          step = this.forms[0]
        }
        if (step === this.forms[0]) {
          this.modalTitle = data ? '编辑操作 - '+this.value.menuName + ' > '  + data.operationName : '添加操作 - '+this.value.menuName
          this.modalVisible = true
        }
        if (step === this.forms[1]) {
          this.modalTitle = data ? '绑定API - '+this.value.menuName + ' > ' + data.operationName : '绑定API'
          this.handleLoadOperationApi(this.formItem.operationId)
        }
        this.current = step
        this.formItem.status=this.formItem.status+''
      },
      handleReset () {
        const newData = {
          operationId: '',
          operationCode: '',
          operationName: '',
          apiIds:[],
          status: 1,
          menuId: '',
          priority: 0,
          operationDesc: ''
        }
        this.formItem = newData
        //重置验证
        this.forms.map(form => {
          this.$refs[form].resetFields()
        })
        this.current = this.forms[0]
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        if (this.current === this.forms[0]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
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
        }
        if (this.current === this.forms[1]) {
          this.$refs[this.current].validate((valid) => {
            if (valid) {
              this.saving = true
              addOperationApi({operationId:this.formItem.operationId,apiIds:this.formItem.apiIds}).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('绑定成功')
                }
              }).finally(() =>{
                this.saving = false
              })
            }
          })
        }

      },
      handleSearch () {
        if (!this.value) {
          return
        }
        this.formItem.menuId = this.value.menuId;
        this.loading = true
        getOperationsByMenu(this.formItem.menuId).then(res => {
          this.data = res.data
        }).finally(() => {
          this.loading = false
        })
      },
      handleRemove (data) {
        removeOperation(data.operationId).then(res => {
          this.handleSearch()
          if (res.code === 0) {
            this.pageInfo.page = 1
            this.$Message.success('删除成功')
          }
        })
      },
      handleLoadOperationApi (operationId) {
        if(!operationId){return}
        const that = this
        const p1 = getAllApi()
        const p2 = getOperationApi(operationId)
        Promise.all([p1, p2]).then(function (values) {
          let res1 = values[0]
          let res2 = values[1]
          if (res1.code === 0) {
            res1.data.map(item => {
              item.key =  item.apiId
            })
            that.selectApis = res1.data;
          }
          if (res2.code === 0) {
              const  result = []
              res2.data.map(item =>{
                result.push(item.apiId);
              })
              that.formItem.apiIds = result;
          }
          that.modalVisible = true
        })
      },
    transferRender (item) {
      return `<span  title="${item.apiDesc}">${item.path} - ${item.apiName}`
    },
    handleTransferChange (newTargetKeys, direction, moveKeys) {
      if (newTargetKeys.indexOf('1') != -1) {
        this.formItem.apiIds = ['1']
      } else {
        this.formItem.apiIds = newTargetKeys
      }
    },
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
