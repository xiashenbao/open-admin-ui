<template>
  <div>
    <Alert show-icon>服务器启动后(仅限资源服务器@EnableResourceServer),自动扫描@RestController标注的类,并自动添加或覆盖已有API接口(名称、编码、路径、备注)
      方法上含有:@GetMapping、@PostMapping、@RequestMapping、@PutMapping、@DeleteMapping,结合Swagger注解@ApiOperation可设置接口名称

    </Alert>
    <Card shadow>
      <div class="search-con search-con-top">
        <Button class="search-btn" type="primary" @click="handleModal()">
          <Icon type="search"/>&nbsp;&nbsp;添加

        </Button>
      </div>
      <Table :columns="columns" :data="data">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="default" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <a @click="handleRemove(row)">删除</a>
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-ok="handleSubmit"
           @on-cancel="handleReset">
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
  </div>
</template>

<script>
  import {listConvertTree} from '@/libs/util'
  import {getApis, updateApi, addApi, removeApi} from '@/api/apis'

  export default {
    name: 'SystemApi',
    data () {
      return {
        modalVisible: false,
        modalTitle: '',
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        apiGroup: [
          {apiId: 'opencloud-base-producer', apiName: '基础服务', apiCode: 'opencloud-base-producer', serviceId: '0'},
          {apiId: 'opencloud-auth-producer', apiName: '认证服务', apiCode: 'opencloud-auth-producer', serviceId: '0'}
        ],
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
            key: 'apiName'
          },
          {
            title: '接口编码',
            key: 'apiCode'
          },
          {
            title: '分类',
            key: 'apiCategory'
          },
          {
            title: '请求路径',
            key: 'path'
          },
          {
            title: '状态',
            key: 'status',
            slot: 'status'
          },
          {
            title: '描述',
            key: 'apiDesc'
          },
          {
            title: '上次更新时间',
            key: 'updateTime'
          },
          {
            title: '操作',
            key: '',
            slot: 'action',
            width: 150,
            fixed: 'right'
          }
        ],
        data: []
      }
    },

    methods: {
      handleModal (data) {
        if (data) {
          this.modalTitle = '编辑接口'
          this.formItem = Object.assign({}, this.formItem, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加接口'
        }
        this.modalVisible = true
      },
      handleReset () {
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
        this.formItem = newData
        //重置验证
        this.$refs['apiForm'].resetFields()
      },
      handleSubmit () {
        this.$refs['apiForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.apiId) {
              updateApi(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              })
            } else {
              addApi(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              })
            }
          }
        })
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '确定删除吗？',
          onOk: () => {
            removeApi({apiId: data.apiId}).then(res => {
              if (res.code === 0) {
                this.pageInfo.page=1
                this.$Message.success('删除成功')
              }
              this.handleSearch()
            })
          }
        });
      },
      rowClick (data) {
      },
      handleSearch () {
        getApis({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
        })
      },
      handlePage(current){
        this.pageInfo.page = current;
        this.handleSearch()
      },
      handlePageSize(size){
        this.pageInfo.limit = size
        this.handleSearch()
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
