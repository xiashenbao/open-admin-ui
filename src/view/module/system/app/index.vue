<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新建应用
          </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="userType" slot-scope="{ row }">
          <Tag color="blue" v-if="row.userType==='isp'">服务提供商</Tag>
          <Tag color="blue" v-else-if="row.userType==='dev'">自研开发者</Tag>
          <Tag color="blue" v-else="">平台</Tag>
        </template>
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="有效"/>
          <Badge v-else="" status="error" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row,1)" :disabled="row.appId === 'gateway' ?true:false">
            编辑</a>&nbsp;
          <Dropdown transfer ref="dropdown" @on-click="handleClick($event,row)">
            <a href="javascript:void(0)" :disabled="row.appId === 'gateway' ?true:false">
              更多
              <Icon type="ios-arrow-down"></Icon>
            </a>
            <DropdownMenu slot="list">
              <DropdownItem name="grantApi">功能授权</DropdownItem>
              <DropdownItem name="resetSecret">重置密钥</DropdownItem>
              <DropdownItem name="remove">删除应用</DropdownItem>
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
           @on-cancel="handleReset"
           width="780">
      <Alert v-if="formItem.appId?true:false" show-icon>
        重要信息,请妥善保管：AppId：<code>{{formItem.appId}}</code>AppSecret：<code>{{formItem.appSecret}}</code>&nbsp;&nbsp;<a @click="handleResetSecret(formItem)">重置密钥</a>
      </Alert>
      <Steps :current="current" size="small">
        <Step title="填写开发者"></Step>
        <Step title="完善应用信息"></Step>
        <Step title="功能授权"></Step>
      </Steps>
      <Form ref="stepForm1" v-show="current==0" :model="formItem" :rules="formItemRules" :label-width="135">
        <FormItem  label="开发者类型" prop="userType">
          <RadioGroup v-model="formItem.userType">
            <Radio label="platform">平台</Radio>
            <Radio label="isp">服务提供商</Radio>
            <Radio label="dev">自研开发者</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem  label="开发者" prop="userId">
          <Input v-model="formItem.userId" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <Form ref="stepForm2"  v-show="current==1" :model="formItem" :rules="formItemRules" :label-width="135">
        <FormItem  label="应用图标">
          <div class="upload-list" v-for="item in uploadList">
            <template v-if="item.status === 'finished'">
              <img :src="item.url">
              <div class="upload-list-cover">
                <Icon type="ios-eye-outline" @click.native="handleView(item.name)"></Icon>
                <Icon type="ios-trash-outline" @click.native="handleRemoveImg(item)"></Icon>
              </div>
            </template>
            <template v-else>
              <Progress v-if="item.showProgress" :percent="item.percentage" hide-info></Progress>
            </template>
          </div>
          <Upload
                  ref="upload"
                  :show-upload-list="false"
                  :default-file-list="defaultList"
                  :format="['jpg','jpeg','png']"
                  :max-size="2048"
                  :on-success="handleSuccess"
                  :on-format-error="handleFormatError"
                  :on-exceeded-size="handleMaxSize"
                  :before-upload="handleBeforeUpload"
                  type="drag"
                  action="//jsonplaceholder.typicode.com/posts/"
                  style="display: inline-block;width:58px;">
            <div style="width: 58px;height:58px;line-height: 58px;">
              <Icon type="ios-camera" size="20"></Icon>
            </div>
          </Upload>
        </FormItem>
        <FormItem  label="应用名称" prop="appName">
          <Input v-model="formItem.appName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  label="英文名称" prop="appNameEn">
          <Input v-model="formItem.appNameEn" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  label="应用类型" prop="appType">
          <Select v-model="formItem.appType" @on-change="handleOnAppTypeChange">
            <Option value="server">服务器应用</Option>
            <Option value="app">手机应用</Option>
            <Option value="pc">PC网页应用</Option>
            <Option value="wap">手机网页应用</Option>
          </Select>
        </FormItem>
        <FormItem v-if="current==1 && formItem.appType === 'app'" prop="appOs" label="操作系统">
          <RadioGroup v-model="formItem.appOs">
            <Radio label="ios">
              <Icon type="logo-apple"></Icon>
              <span>苹果IOS</span>
            </Radio>
            <Radio label="android">
              <Icon type="logo-android"></Icon>
              <span>安卓Android</span>
            </Radio>
          </RadioGroup>
        </FormItem>
        <FormItem  label="官网" prop="website">
          <Input v-model="formItem.website" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  label="第三方授权回掉地址" prop="redirectUrls">
          <Input v-model="formItem.redirectUrls" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  label="状态">
          <i-switch v-model="formItem.statusSwatch" size="large">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
        <FormItem  label="描述">
          <Input v-model="formItem.appDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <Form ref="stepForm3" v-show="current==2" :model="formItem" :rules="formItemRules" :label-width="135">
        <FormItem  label="授权类型" prop="grantTypes">
          <CheckboxGroup v-model="formItem.grantTypes">
            <Checkbox v-for="item in selectGrantTypes" :label="item.label"><span>{{ item.title }}</span></Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem  label="用户授权范围" prop="scopes">
          <CheckboxGroup v-model="formItem.scopes">
            <Checkbox v-for="item in selectScopes" :label="item.label"><span>{{ item.title }}</span></Checkbox>
          </CheckboxGroup>
        </FormItem>
        <FormItem   label="功能接口授权" prop="authorities">
          <Select v-model="formItem.authorities" multiple filterable  @on-change="handleOnSelectAuths" >
            <OptionGroup  v-for="(item,index) in selectApis" :label="item.apiCategory">
             <Option :title="cate.apiDesc" :disabled="cate.apiCode!=='all' && formItem.authorities.indexOf('all')!=-1?true:false" v-for="cate in item.children" :value="cate.apiCode" :label="cate.apiName">
               <span>{{ cate.apiName }}</span>
               <span style="float:right;color:#ccc;">{{ cate.path }}</span></Option>
            </OptionGroup>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer">
        <Button v-if="current!==0" type="default" @click="handleUp" style="float: left">上一步</Button>&nbsp;
        <Button v-if="current===2" type="primary" @click="handleSubmit">提交</Button>&nbsp;
        <Button type="default" @click="handleReset">取消</Button>
        <Button v-if="current!==2" type="primary" @click="handleNext">下一步</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getApps, updateApp, addApp, removeApp, getAppDevInfo,restApp} from '@/api/app'
  import {getAllApi} from '@/api/apis'
  import {startWith,listConvertGroup} from '@/libs/util'
  export default {
    name: 'SystemApp',
    data () {
      return {
        current: 0,
        loading: false,
        forms: [
          'stepForm1',
          'stepForm2',
          'stepForm3'
        ],
        selectApis: [],
        selectGrantTypes: [
          {label: 'authorization_code', title: '授权码模式'},
          {label: 'client_credentials', title: '客户端模式'},
          {label: 'refresh_token', title: '刷新令牌'},
          {label: 'password', title: '密码模式'},
          {label: 'implicit', title: '简化模式'},
        ],
        selectScopes: [
          {label: 'userProfile', title: '平台登录信息'},
          // 这是测试数据,根据实际情况自定义添加
          {label: 'api1', title: '每种用户授权需对应下方的某一个功能接口'},
        ],
        pageInfo: {
          total: 0,
          page: 1,
          limit: 10
        },
        defaultList: [
          {
            name: '',
            'url': 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar'
          }
        ],
        modalVisible: false,
        modalTitle: '',
        imgName: '',
        visible: false,
        uploadList: [],
        formItemRules: {
          userId: [
            {required: true, message: '开发者不能为空', trigger: 'blur'}
          ],
          userType: [
            {required: true, message: '开发者类型不能为空', trigger: 'blur'}
          ],
          website: [
            {required: true, message: '官网不能为空', trigger: 'blur'}
          ],
          appType: [
            {required: true, message: '应用类型不能为空', trigger: 'blur'}
          ],
          appOs: [
            {required: true, message: '操作系统不能为空', trigger: 'blur'}
          ],
          redirectUrls: [
            {required: true, message: '授权重定向地址不能为空', trigger: 'blur'}
          ],
          appName: [
            {required: true, message: '应用名称不能为空', trigger: 'blur'}
          ],
          appNameEn: [
            {required: true, message: '英文不能为空', trigger: 'blur'}
          ],
          grantTypes: [
            {required: true, type: 'array', min: 1, message: '授权类型不能为空', trigger: 'blur'}
          ],
          scopes: [
            {required: true, type: 'array', min: 1, message: '用户授权范围不能为空', trigger: 'blur'}
          ],
          authorities: [
            {required: true, type: 'array', min: 1, message: '接口权限不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          appId: '',
          appSecret: '',
          appCode: '',
          appName: '',
          appNameEn: '',
          appType: 'server',
          appIcon: 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar',
          appOs: '',
          path: '',
          website: '',
          appDesc: '',
          status: 1,
          redirectUrls: '',
          statusSwatch: true,
          userId: '0',
          userType: 'platform',
          scopes: [],
          authorities: [],
          grantTypes: ['authorization_code','client_credentials','refresh_token']
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '应用名称',
            key: 'appName'
          },
          {
            title: '英文名称',
            key: 'appNameEn'
          },
          {
            title: '应用ID',
            key: 'appId',
            width: 200
          },
          {
            title: '应用类型',
            key: 'appType'
          },
          {
            title: '开发者',
            key: 'userId'
          },
          {
            title: '开发者类型',
            key: 'userType',
            slot: 'userType'
          },
          {
            title: '状态',
            slot: 'status',
            sortable: true,
            key: 'status'
          },
          {
            title: '描述',
            key: 'appDesc'
          },
          {
            title: '创建时间',
            sortable: true,
            key: 'createTime'
          },
          {
            title: '操作',
            slot: 'action'
          }
        ],
        data: []
      }
    },
    methods: {
      handleNext () {
        this.$refs[this.forms[this.current]].validate((valid) => {
          if (valid) {
            if (this.current < 2) {
              this.current += 1
            }
          }
        })
      },
      handleUp () {
        if (this.current > 0 && this.current < 3) {
          this.current -= 1
        }
      },
      handleModal (data,step) {
        if (data) {
          getAppDevInfo({appId: data.appId}).then(res => {
            if (res.code === 0) {
              this.formItem.scopes = res.data.scope
              this.formItem.grantTypes = res.data.authorized_grant_types
              if (res.data.authorities && res.data.authorities.length > 0) {
                this.formItem.authorities = res.data.authorities.map(item => {
                    // 替换掉前缀
                    return item.replace('APP_', '').replace('API_','')
                  }
                )
              }
            }
          })
          this.modalTitle = '编辑应用'
          this.formItem = Object.assign({}, this.formItem, data)
          this.formItem.userType = this.formItem.userType + ''
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加应用'
        }
        if(!step){
          step =  0
        }
        this.current = step
        this.modalVisible = true
      },
      handleReset () {
        //重置验证
        const newData = {
          appId: '',
          appSecret: '',
          appCode: '',
          appName: '',
          appNameEn: '',
          appType: 'server',
          appIcon: 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar',
          appOs: '',
          website: '',
          appDesc: '',
          status: 1,
          statusSwatch: true,
          userId: '0',
          userType: 'platform',
          scopes: [],
          authorities: [],
          grantTypes: ['authorization_code','client_credentials','refresh_token']
        }
        this.formItem = newData
        this.forms.map(form => {
          this.$refs[form].resetFields()
        })
        this.current = 0
        this.modalVisible = false
      },
      handleSubmit () {
        this.$refs[this.forms[this.current]].validate((valid) => {
          if (valid) {
            const data = Object.assign({},this.formItem)
            data.status = this.formItem.statusSwatch ? 1 : 0
            data.scopes = this.formItem.scopes.join(',')
            data.grantTypes = this.formItem.grantTypes.join(',')
            data.authorities = this.formItem.authorities.join(',')
            if (data.appId) {
              updateApp(data).then(res => {
                this.handleReset()
                this.handleSearch()
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
              })
            } else {
              addApp(data).then(res => {
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
        this.loading = true
        getApps({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
          this.loading = false
        })
      },
      handleRemove (data) {
        this.$Modal.confirm({
          title: '删除后将无法恢复,确定删除吗？',
          onOk: () => {
            removeApp({appId: data.appId}).then(res => {
              this.handleSearch()
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.$Message.success('删除成功')
              }
            })
          }
        })
      },
      handleResetSecret (data) {
        this.$Modal.confirm({
          title: '重置后将无法恢复,确定继续吗？',
          onOk: () => {
            restApp({appId: data.appId}).then(res => {
              if (res.code === 0) {
                this.pageInfo.page = 1
                this.formItem.appSecret = res.data
                this.$Message.success('重置成功,请妥善保管.并及时更新到相关应用')
              }
              this.handleSearch()
            })
          }
        })
      },
      handleClick (name, row) {
        switch (name) {
          case'grantApi':
            this.handleModal(row,2)
            break
          case 'remove':
            this.handleRemove(row)
            break
          case 'resetSecret':
            this.handleResetSecret(row)
            break
        }
      },
      handleOnAppTypeChange(data){
        if(data!=='app'){
          this.formItem.appOs = ''
        }else{
          if(!this.formItem.appOs){
            this.formItem.appOs = 'ios'
          }
        }
      },
      handleOnSelectAuths(data){
          // 全部,其他的不用选了
          if(data.indexOf('all') !== -1){
              this.formItem.authorities = ['all']
          }
      },
      handlePage (current) {
        this.pageInfo.page = current
        this.handleSearch()
      }
      ,
      handlePageSize (size) {
        this.pageInfo.limit = size
        this.handleSearch()
      }
      ,
      handleView (name) {
        this.imgName = name
        this.visible = true
      }
      ,
      handleRemoveImg (file) {
        const fileList = this.$refs.upload.fileList
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      }
      ,
      handleSuccess (res, file) {
        file.url = 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar'
        file.name = '7eb99afb9d5f317c912f08b5212fd69a'
      }
      ,
      handleFormatError (file) {
        this.$Notice.warning({
          title: 'The file format is incorrect',
          desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
        })
      }
      ,
      handleMaxSize (file) {
        this.$Notice.warning({
          title: 'Exceeding file size limit',
          desc: 'File  ' + file.name + ' is too large, no more than 2M.'
        })
      }
      ,
      handleBeforeUpload () {
        const check = this.uploadList.length < 1
        if (!check) {
          this.$Notice.warning({
            title: 'Up to five pictures can be uploaded.'
          })
        }
        return check
      },
      handleLoadApis () {
        getAllApi().then(res => {
          if (res.code === 0) {
            this.selectApis = listConvertGroup(res.data.list, "apiCategory")
          }
        })
      }
    },
    mounted: function () {
      this.handleSearch()
      this.handleLoadApis()
    }
  }
</script>
<style scoped>
  .upload-list {
    display: inline-block;
    width: 60px;
    height: 60px;
    text-align: center;
    line-height: 60px;
    border: 1px solid transparent;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;
    position: relative;
    box-shadow: 0 1px 1px rgba(0, 0, 0, .2);
    margin-right: 4px;
  }

  .upload-list img {
    width: 100%;
    height: 100%;
  }

  .upload-list-cover {
    display: none;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, .6);
  }

  .upload-list:hover .upload-list-cover {
    display: block;
  }

  .upload-list-cover i {
    color: #fff;
    font-size: 20px;
    cursor: pointer;
    margin: 0 2px;
  }
</style>
