<template>
  <div>
    <div class="search-con search-con-top">
      <ButtonGroup size="small">
        <Button class="search-btn" type="primary" @click="openModal()">
          <Icon type="search"/>&nbsp;&nbsp;新增

        </Button>
      </ButtonGroup>
    </div>
    <Table :columns="columns" :data="data">
      <template slot="userType" slot-scope="{ row }">
        <Tag color="blue" v-if="row.userType===1">服务提供商</Tag>
        <Tag color="blue" v-else-if="row.userType===2">自研开发者</Tag>
        <Tag color="blue" v-else="">平台</Tag>
      </template>
      <template slot="status" slot-scope="{ row }">
        <Badge v-if="row.status===1" status="success" text="有效"/>
        <Badge v-else="" status="default" text="无效"/>
      </template>
      <template slot="action" slot-scope="{ row }">
        <a @click="openModal(row)">
          编辑</a>&nbsp;
        <Poptip
          confirm
          title="确定删除吗?"
          @on-ok="removeApp(row)">
          <a>删除</a>
        </Poptip>&nbsp;
      </template>
    </Table>
    <Modal v-model="modalVisible"
           :title="modalTitle"
           width="680"
           @on-ok="submitForm"
           @on-cancel="resetForm">
      <Form ref="appForm" :model="formItem" :rules="formItemRules" :label-width="80">
        <FormItem label="应用名称" prop="appName">
          <Input v-model="formItem.appName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="英文名称" prop="appNameEn">
          <Input v-model="formItem.appNameEn" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="应用类型" prop="appType">
          <Select v-model="formItem.appType">
            <Option value="server">服务应用</Option>
            <Option value="app">手机应用</Option>
            <Option value="pc">PC网页应用</Option>
            <Option value="wap">手机网页应用</Option>
          </Select>
        </FormItem>
        <FormItem v-if="formItem.appType === 'app'" label="操作系统" prop="appOs">
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
        <FormItem label="开发者">
          <Input v-model="formItem.userId" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="开发者类型">
          <RadioGroup v-model="formItem.userType">
            <Radio label="0">平台</Radio>
            <Radio label="1">服务提供商</Radio>
            <Radio label="2">自研开发者</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="状态">
          <i-switch v-model="formItem.statusSwatch" size="large">
            <span slot="open">有效</span>
            <span slot="close">无效</span>
          </i-switch>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.appDesc" type="textarea" placeholder="请输入内容"></Input>
        </FormItem>
      </Form>
    </Modal>
  </div>
</template>

<script>
  import {getApps, updateApp, addApp, removeApp} from '@/api/app'

  export default {
    name: 'App',
    data () {
      return {
        modalVisible: false,
        modalTitle: '',
        spinShow: false,
        confirmModal: false,
        formItemRules: {
          appName: [
            {required: true, message: '应用名称不能为空', trigger: 'blur'}
          ],
          appNameEn: [
            {required: true, message: '英文不能为空', trigger: 'blur'}
          ]
        },
        formItem: {
          appId: '',
          appSecret: '',
          appCode: '',
          appName: '',
          appNameEn: '',
          appType: '',
          appIcon: '',
          appOs: '',
          path: '',
          appDesc: '',
          status: 1,
          statusSwatch: true,
          userId: 0,
          userType: '0'
        },
        columns: [
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
            title: '应用秘钥',
            key: 'appSecret',
            width: 300
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
            key: 'status'
          },
          {
            title: '描述',
            key: 'appDesc'
          },
          {
            title: '更新时间',
            key: 'updateTime'
          },
          {
            title: '应用',
            slot: 'action',
            width: 100
          }
        ],
        data: []
      }
    },
    methods: {
      openModal (data) {
        const newData = {
          appId: '',
          appSecret: '',
          appCode: '',
          appName: '',
          appNameEn: '',
          appType: '',
          appIcon: '',
          appOs: '',
          path: '',
          appDesc: '',
          status: 1,
          statusSwatch: true,
          userId: 0,
          userType: '0'
        }
        if (data) {
          this.modalTitle = '编辑应用'
          this.formItem = Object.assign({}, newData, data)
          this.formItem.userType = this.formItem.userType + ''
          this.formItem.statusSwatch = this.formItem.status === 1 ? true : false
        } else {
          this.modalTitle = '添加应用'
          this.formItem = newData
        }
        this.modalVisible = true
      },
      resetForm () {
        //重置验证
        this.$refs['appForm'].resetFields()
      },
      submitForm () {
        this.$refs['appForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.appId) {
              updateApp(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.resetForm()
                this.getApps()
              })
            } else {
              addApp(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.resetForm()
                this.getApps()
              })
            }
          }
        })
      },
      getApps () {
        getApps().then(res => {
          this.data = res.data.list
        })
      },
      removeApp (data) {
        removeApp({appId: data.appId}).then(res => {
          if (res.code === 0) {
            this.$Message.success('删除成功')
          }
          this.getApps()
        })
      }
    },
    mounted: function () {
      this.getApps()
    }
  }
</script>
