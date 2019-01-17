<template>
  <div>
    <Card shadow>
      <div class="search-con search-con-top">
        <ButtonGroup>
          <Button class="search-btn" type="primary" @click="handleModal()">
            <Icon type="search"/>&nbsp;&nbsp;新建用户
        </Button>
        </ButtonGroup>
      </div>
      <Table :columns="columns" :data="data" :loading="loading">
        <template slot="status" slot-scope="{ row }">
          <Badge v-if="row.status===1" status="success" text="正常"/>
          <Badge v-else-if="row.status===2" status="success" text="锁定"/>
          <Badge v-else="" status="error" text="禁用"/>
        </template>
        <template  slot="action" slot-scope="{ row }">
          <a @click="handleModal(row)">
            编辑</a>&nbsp;
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
      <Form ref="userForm" :model="formItem" :rules="formItemRules" :label-width="100">
        <FormItem  label="用户类型" prop="userType">
          <RadioGroup v-model="formItem.userType">
            <Radio label="platform">平台</Radio>
            <Radio label="isp">服务提供商</Radio>
            <Radio label="dev">自研开发者</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="昵称" prop="nickName">
          <Input v-model="formItem.nickName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="登录名" prop="userName">
          <Input :disabled="formItem.userId?true:false" v-model="formItem.userName" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem v-if="formItem.userId?false:true"  label="登录密码" prop="password">
          <Input type="password" v-model="formItem.password"  placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem v-if="formItem.userId?false:true"   label="再次确认密码" prop="passwordConfirm">
          <Input type="password" v-model="formItem.passwordConfirm" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="邮箱" prop="email">
          <Input v-model="formItem.email" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="手机号" prop="mobile">
          <Input v-model="formItem.mobile" placeholder="请输入内容"></Input>
        </FormItem>
        <FormItem label="状态">
          <RadioGroup v-model="formItem.status">
            <Radio label="0">禁用</Radio>
            <Radio label="1">正常</Radio>
            <Radio label="2">锁定</Radio>
          </RadioGroup>
        </FormItem>
        <FormItem label="描述">
          <Input v-model="formItem.userDesc" type="textarea" placeholder="请输入内容"></Input>
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
  import {getUsers, updateUser, addUser} from '@/api/user'

  export default {
    name: 'SystemUser',
    data () {
      const validatePassConfirm= (rule, value, callback) => {
        if (value === '') {
          callback(new Error('请再次输入密码'));
        } else if (value !== this.formItem.passwd) {
          callback(new Error('两次输入密码不一致'));
        } else {
          callback();
        }
      };
      const validateMobile= (rule, value, callback) => {
        var reg = /^1\d{10}$/
        if (value !=='' && !reg.test(value)) {
          callback(new Error('手机号码格式不正确'));
        } else {
          callback();
        }
      };
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
          userType: [
            {required: true, message: '用户类型不能为空', trigger: 'blur'}
          ],
          userName: [
            {required: true, message: '登录名不能为空', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '登录密码不能为空', trigger: 'blur'}
          ],
          passwordConfirm: [
            {validator: validatePassConfirm, trigger: 'blur'}
          ],
          nickName: [
            {required: true, message: '昵称不能为空', trigger: 'blur'}
          ],
          email: [
            {type: 'email', message: '邮箱格式不正确', trigger: 'blur'}
          ]
          ,
          mobile: [
            {validator:validateMobile, trigger: 'blur'}
          ]
        },
        formItem: {
          userId: '',
          userName: '',
          nickName: '',
          password: '',
          passwordConfirm:'',
          status: 1,
          companyId: '',
          email: '',
          mobile: '',
          userType: 'platform',
          userDesc: '',
          avatar: ''
        },
        columns: [
          {
            type: 'selection',
            width: 60,
            align: 'center'
          },
          {
            title: '登录名称',
            key: 'userName'
          },
          {
            title: '邮箱',
            key: 'email'
          },
          {
            title: '手机号',
            key: 'mobile'
          },
          {
            title: '昵称',
            key: 'nickName'
          },
          {
            title: '状态',
            slot: 'status',
            key: 'status'
          },
          {
            title: '用户类型',
            key: 'userType'
          },
          {
            title: '描述',
            key: 'userDesc'
          },
          {
            title: '注册时间',
            key: 'registerTime'
          },
          {
            title: '操作',
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
          this.modalTitle = '编辑用户'
          this.formItem = Object.assign({}, this.formItem, data)
        } else {
          this.modalTitle = '添加用户'
        }
        this.formItem.status = this.formItem.status + ''
        this.modalVisible = true
      },
      handleReset () {
        const newData = {
          userId: '',
          userName: '',
          nickName: '',
          status: 1,
          email: '',
          password: '',
          passwordConfirm:'',
          mobile: '',
          companyId: '',
          userType: 'platform',
          userDesc: '',
          avatar: ''
        }
        this.formItem = newData
        //重置验证
        this.$refs['userForm'].resetFields()
        this.modalVisible = false
      },
      handleSubmit () {
        this.$refs['userForm'].validate((valid) => {
          if (valid) {
            this.formItem.status = this.formItem.statusSwatch ? 1 : 0
            if (this.formItem.userId) {
              updateUser(this.formItem).then(res => {
                if (res.code === 0) {
                  this.$Message.success('保存成功')
                }
                this.handleReset()
                this.handleSearch()
              })
            } else {
              addUser(this.formItem).then(res => {
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
        getUsers({page: this.pageInfo.page, limit: this.pageInfo.limit}).then(res => {
          this.data = res.data.list
          this.pageInfo.total = parseInt(res.data.total)
          this.loading = false
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
