<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup size="small">
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新增
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
          <Badge v-else="" status="default" text="无效"/>
        </template>
        <template slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
          <Poptip
            confirm
            title="确定删除吗?"
            @on-ok="handleRemove(row)">
            <a>删除</a>
          </Poptip>&nbsp;
        </template>
      </Table>
      <Page :total="pageInfo.total" :current="pageInfo.page" :page-size="pageInfo.limit" show-elevator show-sizer
            show-total
            @on-change="handlePage" @on-page-size-change='handlePageSize'></Page>
    </Card>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           @on-cancel="handleReset"
           width="680">
      <Alert v-if="formItem.appId?true:false" show-icon>
        重要信息,请妥善保管：<span>AppId： </span><strong>{{formItem.appId}}</strong>&nbsp;&nbsp;<span>AppSecret：</span><strong>{{formItem.appSecret}}</strong>
      </Alert>
      <Steps :current="current" size="small">
        <Step title="填写开发者"></Step>
        <Step title="完善应用信息"></Step>
        <Step title="功能授权"></Step>
      </Steps>
      <Form ref="stepForm1"  :model="formItem" :rules="formItemRules1" :label-width="135">
        <FormItem  v-if="current==0" label="开发者类型" prop="userType">
          <RadioGroup v-model="formItem.userType">
            <Radio label="platform">平台</Radio>
            <Radio label="isp">服务提供商</Radio>
            <Radio label="dev">自研开发者</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem v-if="current==0" label="开发者" prop="userId">
          <Input v-model="formItem.userId" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <Form ref="stepForm2" :model="formItem" :rules="formItemRules2" :label-width="135">
        <FormItem  v-if="current==1" label="应用图标">
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
          <Upload  v-if="current==1"
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
        <FormItem   v-if="current==1" label="应用名称" prop="appName">
          <Input v-model="formItem.appName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  v-if="current==1" label="英文名称" prop="appNameEn">
          <Input v-model="formItem.appNameEn" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  v-if="current==1" label="应用类型" prop="appType">
          <Select v-model="formItem.appType">
            <Option value="server">服务器应用</Option>
            <Option value="app">手机应用</Option>
            <Option value="pc">PC网页应用</Option>
            <Option value="wap">手机网页应用</Option>
          </Select>
        </FormItem>
        <FormItem v-if="current==1 && formItem.appType === 'app'" label="操作系统">
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
        <FormItem   v-if="current==1" label="官网" prop="website">
          <Input v-model="formItem.website" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  v-if="current==1" label="第三方授权回掉地址" prop="redirectUrls">
          <Input v-model="formItem.redirectUrls" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem  v-if="current==1" label="状态">
          <i-switch v-model="formItem.statusSwatch" size="large">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
        <FormItem  v-if="current==1" label="描述">
          <Input v-model="formItem.appDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
      <Form ref="stepForm3" :model="formItem" :rules="formItemRules3" :label-width="135">

      </Form>

      <div slot="footer">
        <Button  v-if="current!==0" type="default"  @click="handleUp" style="float: left">上一步</Button>&nbsp;
        <Button  v-if="current===2" type="primary">提交</Button>&nbsp;
        <Button  type="default"  @click="handleReset">取消</Button>
        <Button  v-if="current!==2" type="primary"  @click="handleNext">下一步</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
  import {getApps, updateApp, addApp, removeApp} from '@/api/app'

  export default {
    name: 'SystemApp',
    data () {
      return {
        current: 0,
        loading:false,
        forms: [
          'stepForm1',
          'stepForm2',
          'stepForm3'
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
        formItemRules1: {
          userId: [
            {required: true, message: '开发者不能为空', trigger: 'blur'}
          ],
          userType: [
            {required: true, message: '开发者类型不能为空', trigger: 'blur'}
          ],
        },
        formItemRules2: {
          website: [
            {required: true, message: '官网不能为空', trigger: 'blur'}
          ],
          appType: [
            {required: true, message: '应用类型不能为空', trigger: 'blur'}
          ],
          redirectUrls: [
            {required: true, message: '授权重定向地址不能为空', trigger: 'blur'}
          ],
          appName: [
            {required: true, message: '应用名称不能为空', trigger: 'blur'}
          ],
          appNameEn: [
            {required: true, message: '英文不能为空', trigger: 'blur'}
          ]
        },
        formItemRules3: {},
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
          userType: 'platform'
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
            title: '上次更新时间',
            sortable: true,
            key: 'updateTime'
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
      handleModal (data) {
        if (data) {
          this.modalTitle = '编辑应用'
          this.formItem = Object.assign({}, this.formItem, data)
          this.formItem.userType = this.formItem.userType + ''
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加应用'
        }
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
          userType: 'platform'
        }
        this.formItem = newData
        this.forms.map(form => {
          this.$refs[form].resetFields()
        })
        this.current = 0
        this.modalVisible=false
      },
      handleSubmit () {
        this.$refs['appForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.appId) {
              updateApp(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              })
            } else {
              addApp(this.formItem).then(res => {
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
      handleSearch () {
        this.loading = true
        getApps({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.loading = false
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
        })
      },
      handleRemove (data) {
        removeApp({appId: data.appId}).then(res => {
          if (res.code === 0) {
            this.pageInfo.page=1
            this.$Message.success('删除成功')
          }
          this.handleSearch()
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
      handleView (name) {
        this.imgName = name
        this.visible = true
      },
      handleRemoveImg (file) {
        const fileList = this.$refs.upload.fileList
        this.$refs.upload.fileList.splice(fileList.indexOf(file), 1)
      },
      handleSuccess (res, file) {
        file.url = 'https://o5wwk8baw.qnssl.com/7eb99afb9d5f317c912f08b5212fd69a/avatar'
        file.name = '7eb99afb9d5f317c912f08b5212fd69a'
      },
      handleFormatError (file) {
        this.$Notice.warning({
          title: 'The file format is incorrect',
          desc: 'File format of ' + file.name + ' is incorrect, please select jpg or png.'
        })
      },
      handleMaxSize (file) {
        this.$Notice.warning({
          title: 'Exceeding file size limit',
          desc: 'File  ' + file.name + ' is too large, no more than 2M.'
        })
      },
      handleBeforeUpload () {
        const check = this.uploadList.length < 1
        if (!check) {
          this.$Notice.warning({
            title: 'Up to five pictures can be uploaded.'
          })
        }
        return check
      }
    },
    mounted: function () {
      this.handleSearch()
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
