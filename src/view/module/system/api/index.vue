<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新建接口
          </Button>
        </ButtonGroup>
      </div>
      <Alert show-icon><Tag color="red">@EnableResourceServer</Tag>自动扫描服务下的API接口。&nbsp;&nbsp;已上线接口 <a><strong>{{openApiCount}}</strong></a> 个可授权 </Alert>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="apiName" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" />
          <Badge v-else="" status="error" />
           {{row.apiName}}
        </template>
        <template slot="isOpen" slot-scope="{ row }">
          <Tag color="green" v-if="row.isOpen===1" >已上线</Tag>
          <Tag v-else="">已下线</Tag>
        </template>
        <template slot="isAuth" slot-scope="{ row }">
          <Tag color="green" v-if="row.isAuth===1" >已开启</Tag>
          <Tag v-else="">未开启</Tag>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="remove">删除接口</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-cancel="handleReset">
          <Alert show-icon v-if="formItem.apiId?true:false">
            接口信息部分内容,需要在接口定义时修改。

            <Poptip placement="bottom"  title="示例代码" >
              <a>示例代码</a>
              <div slot="content">
                <div v-highlight>
                <pre>
                        // 接口介绍
                        @ApiOperation(value = "接口名称", notes = "接口备注")
                        @PostMapping("/testApi")
                        // 方法名为接口标识
                        public ResultBody testApi() {
                           return ResultBody.success();
                        }
                </pre>
                </div>
              </div>
            </Poptip>
          </Alert>
          <Form ref="form1" :model="formItem" :rules="formItemRules" :label-width="100">
            <FormItem label="服务名称" prop="serviceId">
              <Select :disabled="formItem.apiId?true:false" v-model="formItem.serviceId" class="search-col">
                <Option v-for="item in selectServiceList"  :value="item.serviceId" >{{ item.serviceName }}</Option>
              </Select>
            </FormItem>
            <FormItem label="接口分类" prop="apiCategory">
              <Input v-model="formItem.apiCategory" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="接口标识" prop="apiCode">
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
            <FormItem label="开放接口">
              <i-switch v-model="formItem.openSwatch" size="large">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
            <FormItem label="安全认证">
              <i-switch v-model="formItem.authSwatch" size="large">
                <span slot="open">是</span>
                <span slot="close">否</span>
              </i-switch>
            </FormItem>
            <FormItem label="状态">
              <i-switch v-model="formItem.statusSwatch" size="large">
                <span slot="open">启用</span>
                <span slot="close">禁用</span>
              </i-switch>
            </FormItem>
            <FormItem label="描述">
              <Input v-model="formItem.apiDesc" type="textarea" placeholder="请输入内容"></Input>
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
  import {listConvertTree} from '@/libs/util'
  import {getApis, updateApi, addApi, removeApi} from '@/api/api'
  import {getServiceList} from '@/api/data'

  export default {
    name: 'SystemApi',
    data () {
      const validateEn = (rule, value, callback) => {
        let reg = /^[_.a-zA-Z0-9]+$/
        if (value === '') {
          callback(new Error('接口标识不能为空'))
        } else if (value !== '' && !reg.test(value)) {
          callback(new Error('只允许字母、数字、点、下划线'))
        }  else {
          callback()
        }
      }
      return {
        loading: false,
        modalVisible: false,
        modalTitle: '',
        saving: false,
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        selectServiceList:[{serviceId:'all',serviceName:'所有'}],
        openApiCount:0,
        formItemRules: {
          serviceId: [
            {required: true, message: '所属服务不能为空', trigger: 'blur'}
          ],
          apiCategory: [
            {required: true, message: '接口分类不能为空', trigger: 'blur'}
          ],
          apiCode: [
            {required: true,validator: validateEn, trigger: 'blur'}
          ],
          apiName: [
            {required: true, message: '接口名称不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          apiId: '',
          apiCode: '',
          apiName: '',
          apiCategory: 'default',
          path: '',
          status: 1,
          statusSwatch: true,
          isOpen: 0,
          isAuth: 1,
          openSwatch: false,
          authSwatch: true,
          serviceId: '',
          priority: 0,
          apiDesc: ''
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '接口',
            key: 'path',
          },
          {
            title: '名称',
            key: 'apiName',
            slot: 'apiName',
            width: 250,
          },
          {
            title: '分类',
            key: 'apiCategory',
            width: 100,
          },
          {
            title: '服务名称',
            key: 'serviceId',
            width: 200
          },
          {
            title: '开放接口',
            key: 'isOpen',
            slot: 'isOpen',
            width: 100,
          },
          {
            title: '安全认证',
            key: 'isAuth',
            slot: 'isAuth',
            width: 100,
          },
          {
            title: '最后更新时间',
            key: 'updateTime',
            width: 200
          },
          {
            title: '操作',
            key: '',
            slot: 'action'
          }
        ],
        data: []
      }
    },
    methods: {
      handleModal (data) {
        if (data) {
          this.modalTitle = '编辑接口 - '+data.apiName
          this.formItem = Object.assign({}, this.formItem, data)
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
          this.formItem.openSwatch = this.formItem.isOpen === 1 ? true : false
          this.formItem.authSwatch = this.formItem.isAuth === 1 ? true : false
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
          apiCategory: 'default',
          path: '',
          status: 1,
          statusSwatch: true,
          openSwatch: false,
          authSwatch: true,
          isOpen: 0,
          isAuth: 1,
          serviceId: '',
          priority: 0,
          apiDesc: ''
        }
        this.formItem = newData
        //重置验证
        this.$refs['form1'].resetFields()
        this.modalVisible = false
        this.saving = false
      },
      handleSubmit () {
        this.$refs['form1'].validate((valid) => {
          if (valid) {
            this.saving = true
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            this.formItem.isOpen = this.formItem.openSwatch ? 1 : 0
            this.formItem.isAuth = this.formItem.authSwatch ? 1 : 0
            if (this.formItem.apiId) {
              updateApi(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              }).finally(() =>{
                this.saving = false
              })
            } else {
              addApi(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              }).finally(() =>{
                this.saving = false
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
              this.handleSearch()
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
            })
          }
        })
      },
      handleSearch () {
        this.loading = true
        getApis({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.openApiCount = res.extra.openApiCount
          this.pageInfo.total = parseInt(res.data.total)
        }).finally(() =>{
          this.loading = false
        })
      },
      handlePage (current) {
        this.pageInfo.page = current
        this.handleSearch()
      },
      handlePageSize (size) {
        this.pageInfo.limit = size
        this.handleSearch()
      },
      handleClick (name, row) {
        switch (name) {
          case 'remove':
            this.handleRemove(row)
            break
        }
      },
      handleLoadServiceList(){
        getServiceList().then(res =>{
          if(res.code===0){
            this.selectServiceList.push(...res.data)
          }
        })
      }
    },
    mounted: function () {
      this.handleLoadServiceList()
      this.handleSearch()
    }
  }
</script>
