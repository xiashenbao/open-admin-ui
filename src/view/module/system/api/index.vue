<template>
  <div>
    <Alert show-icon>服务器启动后,自动添加和更新API列表(需开启<code>@EnableResourceServer</code>)

    </Alert>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup size="small">
          <Button  class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新增接口
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="default" text="无效"/>
        </template>
        <template slot="action"  slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <Dropdown  transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu  slot="list">
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
        如需修改(接口标识、名称、请求地址),请在服务端修改<code>@RestController</code>标注类中的<code>方法名称</code>和<code>@ApiOperation</code>。

      </Alert>
      <Form ref="apiForm" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem label="所属服务" prop="serviceId">
          <Input :disabled="formItem.apiId?true:false" v-model="formItem.serviceId" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="接口分类" prop="apiCategory">
          <Input  v-model="formItem.apiCategory" placeholder="请输入内容"></Input>
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

      <div slot="footer">
        <Button type="default" @click="handleReset">取消</Button>&nbsp;
        <Button type="primary" @click="handleSubmit">提交</Button>
      </div>
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
        loading: false,
        modalVisible: false,
        modalTitle: '',
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        formItemRules: {
          serviceId: [
            {required: true, message: '所属服务不能为空', trigger: 'blur'}
          ],
          apiCategory: [
            {required: true, message: '接口分类不能为空', trigger: 'blur'}
          ],
          apiCode: [
            {required: true, message: '接口标识不能为空', trigger: 'blur'}
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
            title: '接口标识',
            key: 'apiCode'
          },
          {
            title: '接口分类',
            key: 'apiCategory'
          },
          {
            title: '请求路径',
            key: 'path'
          },
          {
            title: '描述',
            key: 'apiDesc'
          },
          {
            title: '状态',
            key: 'status',
            slot: 'status'
          },
          {
            title: '资源服务器',
            key: 'serviceId'
          },
          {
            title: '创建时间',
            key: 'createTime'
          },
          {
            title: '操作',
            key: '',
            slot: 'action',
            width: 125,
            fixed:'right'
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
          apiCategory: 'default',
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
        this.modalVisible = false
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
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
              this.handleSearch()
            })
          }
        });
      },
      handleSearch () {
        this.loading = true
        getApis({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.loading = false
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
      },
      handleClick (name, row) {
        switch (name) {
          case 'remove':
            this.handleRemove(row)
            break
        }
      }
    },
    mounted: function () {
      this.handleSearch()
    }
  }
</script>
