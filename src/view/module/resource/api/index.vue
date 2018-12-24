<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <Button class="search-btn" type="primary" @click="showModal()">
          <Icon type="search"/>&nbsp;&nbsp;添加
        </Button>
      </div>
      <Alert show-icon>资源服务器启动后,自动扫描@RestController下的方法,并自动添加或更新(名称、编码、路径、备注)</Alert>
      <tree-table expand-key="apiName"  :expand-type="false" :is-fold="false" :selectable="false" :columns="columns"
                  :data="data">
        <template slot="action" slot-scope="scope">
          <a v-if="scope.row.serviceId!='0'"  @click="showModal(scope)">编辑</a> &nbsp;&nbsp;
          <Poptip
            v-if="scope.row.serviceId!='0'"
            confirm
            title="确定删除吗"
            @on-ok="handleRemoveApi(scope)">
            <a>删除</a>
          </Poptip>
        </template>
        <template  slot="status" slot-scope="scope">
          <Tag v-if="scope.row.status===1 && scope.row.serviceId!='0'" color="blue">有效</Tag>
          <Tag v-else-if="scope.row.status!==1 && scope.row.serviceId!='0'" color="default">无效</Tag>
        </template>
      </tree-table>
    </Card>
    <template>
      <Modal v-model="modalVisible"
             :title="modalTitle"
             width="780"
             @on-ok="handleSubmit"
             @on-cancel="handleCancel">
        <Form ref="apiForm" :model="formItem" :rules="formItemRules" :label-width="80">
          <FormItem label="上级Api" prop="apiCode">
            <Input v-model="formItem.parentId" placeholder="Enter something..."></Input>
          </FormItem>
          <FormItem label="Api编码" prop="apiCode">
            <Input v-model="formItem.apiCode" placeholder="Enter something..."></Input>
          </FormItem>
          <FormItem label="Api名称" prop="apiName">
            <Input v-model="formItem.apiName" placeholder="Enter something..."></Input>
          </FormItem>
          <FormItem label="请求地址" prop="path">
            <Input v-model="formItem.path" placeholder="Enter something...">
              <Select v-model="formItem.prefix" slot="prepend" style="width: 80px">
                <Option value="/">/</Option>
                <Option value="http://">http://</Option>
                <Option value="https://">https://</Option>
              </Select>
              <Select v-model="formItem.target" slot="append" style="width: 100px">
                <Option value="_self">窗口内打开</Option>
                <Option value="_blank">新窗口打开</Option>
              </Select>
            </Input>
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
            <Input v-model="formItem.apiDesc" type="textarea" placeholder="Enter something..."></Input>
          </FormItem>
        </Form>
      </Modal>
    </template>
  </div>
</template>

<script>
  import {listConvertTree} from '@/libs/util'
  import {getApis, updateApi, addApi, removeApi} from '@/api/apis'

  export default {
    name: 'tree_table_page',
    data () {
      return {
        modalVisible: false,
        modalTitle: '',
        loading: true,
        formItemRules: {
          apiCode: [
            {required: true, message: 'The name cannot be empty', trigger: 'blur'}
          ],
          apiName: [
            {required: true, message: 'Mailbox cannot be empty', trigger: 'blur'}
          ]
        },
        apiGroup: [
          {apiId: 'opencloud-base-producer', apiName: '基础服务',apiCode:'opencloud-base-producer', serviceId: '0'},
          {apiId: 'opencloud-auth-producer', apiName: '认证服务',apiCode:'opencloud-auth-producer', serviceId: '0'}
        ],
        formItem: {
          apiId: '',
          apiCode: '',
          apiName: '',
          icon: '',
          path: '',
          status: 1,
          statusSwatch: true,
          parentId: '0',
          priority: 0,
          apiDesc: ''
        },
        columns: [
          {
            title: '名称',
            key: 'apiName',
            minWidth: '200px'
          },
          {
            title: '编码',
            key: 'apiCode',
            minWidth: '100px'
          },
          {
            title: '请求路径',
            key: 'path',
            minWidth: '200px'
          },
          {
            title: '状态',
            key: 'status',
            type: 'template',
            template: 'status'
          },
          {
            title: '描述',
            key: 'apiDesc',
            minWidth: '100px'
          },
          {
            title: '创建时间',
            key: 'createTime',
            minWidth: '100px'
          },
          {
            title: '操作',
            key: '',
            minWidth: '100px',
            type: 'template',
            template: 'action'
          }
        ],
        data: []
      }
    },
    created: function () {
      this.getApis()
    },
    methods: {
      showModal (data) {
        const newData = {
          apiId: '',
          apiCode: '',
          apiName: '',
          icon: '',
          path: '',
          status: 1,
          statusSwatch: true,
          parentId: '0',
          priority: 0,
          apiDesc: ''
        }
        if (data) {
          this.modalTitle = '编辑资源'
          this.formItem = Object.assign({}, newData, data.row)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加资源'
          this.formItem = newData
        }
        this.modalVisible = true
      },
      handleCancel () {
        //重置验证
        this.$refs['apiForm'].resetFields()
      },
      handleSubmit () {
        this.$refs['apiForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.apiId) {
              updateApi(this.formItem).then(res => {
                this.handleCancel()
                this.getApis()
              })
            } else {
              addApi(this.formItem).then(res => {
                this.handleCancel()
                this.getApis()
              })
            }
          }
        })
      },
      handleRemoveApi (data) {
        removeApi({apiId: data.row.apiId}).then(res => {
          this.getApis()
        })
      },
      getApis () {
        getApis().then(res => {

          let opt = {
            primaryKey: 'apiId',
            parentKey: 'serviceId',
            startPid: '0'
          }
          this.data = listConvertTree(res.data.list.concat(this.apiGroup), opt)
        })
      }
    }
  }
</script>

<style>

</style>
