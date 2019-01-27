<style lang="less">
  @import './login.less';
</style>

<template>
  <div class="login">
    <div class="login-con">
      <Card icon="log-in" title="欢迎登录" :bordered="false">
        <div class="form-con">
          <Form ref="loginForm" :model="form" :rules="rules" @keydown.enter.native="handleSubmit">
            <FormItem prop="userName">
              <Input v-model="form.username" placeholder="请输入用户名\手机号\邮箱"/>
              <span slot="prepend">
                <Icon :size="16" type="ios-person"></Icon>
              </span>
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="form.password" placeholder="请输入密码"/>
              <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
            </FormItem>
            <FormItem>
              <Checkbox v-model="form.auto">自动登录</Checkbox>
              <a href="#" style="float: right">忘记密码</a>
            </FormItem>
            <FormItem>
              <Button @click="handleSubmit" type="primary" long>登录</Button>
            </FormItem>
          </Form>
          <p class="login-tip">其他登录方式
            <Icon custom="icon iconfont icon-QQ-circle-fill" color="#0099ff" size="22" />
            <Icon custom="icon iconfont icon-wechat-fill" color="#00cc33" size="22" />
            <Icon custom="icon iconfont icon-alipay-circle-fill" color="#0099ff" size="22" />
            <a href="#" style="float: right">注册账号</a></p>
        </div>
      </Card>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'LoginForm',
  props: {
    usernameRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '账号不能为空', trigger: 'blur' }
        ]
      }
    },
    passwordRules: {
      type: Array,
      default: () => {
        return [
          { required: true, message: '密码不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  data () {
    return {
      form: {
        username: 'admin',
        password: '123456',
        auto:true,
      }
    }
  },
  computed: {
    rules () {
      return {
        username: this.usernameRules,
        password: this.passwordRules
      }
    }
  },
  methods: {
    ...mapActions([
      'handleLogin',
      'getUserInfo'
    ]),
    handleSubmit () {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          let username = this.form.username
          let password = this.form.password
          let auto = this.form.auto
          this.handleLogin({ username, password,auto}).then(res => {
            this.$router.push({
              name: this.$config.homeName
            })
          })
        }
      })
    }
  }
}
</script>
<style>

</style>
