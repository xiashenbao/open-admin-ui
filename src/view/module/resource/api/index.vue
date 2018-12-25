<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <Button class="search-btn" type="primary" @click="showModal()">
          <Icon type="search"/>&nbsp;&nbsp;添加
        </Button>
      </div>
      <Alert show-icon>服务器启动后(仅限资源服务器@EnableResourceServer),自动扫描@RestController标注的类,并自动添加或覆盖已有API接口(名称、编码、路径、备注)
      <br>方法上含有:@GetMapping、@PostMapping、@RequestMapping、@PutMapping、@DeleteMapping,结合Swagger注解@ApiOperation可设置接口名称</Alert>
      <tree-table expand-key="apiName"
                  @on-row-click='rowClick'
                  :expand-type="false"
                  :is-fold="false"
                  :selectable="false"
                  :columns="columns"
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
             width="680"
             @on-ok="handleSubmit"
             @on-cancel="handleCancel">
        <Form ref="apiForm" :model="formItem" :rules="formItemRules" :label-width="80">
          <FormItem label="所属服务" prop="serviceId">
            <Select :disabled="formItem.apiId?true:false" v-model="formItem.serviceId">
              <Option v-for="(item,index) in apiGroup" :value="item.apiId" :key="index">{{ item.apiName }}</Option>
            </Select>
          </FormItem>
          <FormItem label="接口编码" prop="apiCode">
            <Input :disabled="formItem.apiId?true:false" v-model="formItem.apiCode" placeholder="请输入内容"></Input>
          </FormItem>
          <FormItem label="接口名称" prop="apiName">
            <Input :disabled="formItem.apiId?true:false" v-model="formItem.apiName" placeholder="请输入内容"></Input>
          </FormItem>
          <FormItem label="请求地址" prop="path">
            <Input :disabled="formItem.apiId?true:false" v-model="formItem.path" placeholder="请输入内容"></Input>
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
            <Input v-model="formItem.apiDesc" type="textarea" placeholder="请输入内容"></Input>
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
          serviceId: [
            {required: true, message: '所属服务不能为空', trigger: 'blur'}
          ],
          apiCode: [
            {required: true, message: '接口编码不能为空', trigger: 'blur'}
          ],
          apiName: [
            {required: true, message: '接口名称不能为空', trigger: 'blur'}
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
          path: '',
          status: 1,
          statusSwatch: true,
          serviceId: '',
          priority: 0,
          apiDesc: ''
        },
        columns: [
          {
            title: '接口名称',
            key: 'apiName',
            minWidth: '200px'
          },
          {
            title: '接口编码',
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
            minWidth: '200px'
          },
          {
            title: '更新时间',
            key: 'updateTime',
            minWidth: '150px'
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
          path: '',
          status: 1,
          statusSwatch: true,
          serviceId: '',
          priority: 0,
          apiDesc: ''
        }
        if (data) {
          this.modalTitle = '编辑接口'
          this.formItem = Object.assign({}, newData, data.row)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加接口'
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
      rowClick(data){
          console.log(data)
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
