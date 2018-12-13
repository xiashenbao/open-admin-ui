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
              <Input v-model="form.username" placeholder="请输入用户名">
        <span slot="prepend">
          <Icon :size="16" type="ios-person"></Icon>
        </span>
              </Input>
            </FormItem>
            <FormItem prop="password">
              <Input type="password" v-model="form.password" placeholder="请输入密码">
        <span slot="prepend">
          <Icon :size="14" type="md-lock"></Icon>
        </span>
              </Input>
            </FormItem>
            <FormItem>
              <Button @click="handleSubmit" type="primary" long>登录</Button>
            </FormItem>
          </Form>
          <p class="login-tip">输入任意用户名和密码即可</p>
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
        username: 'super_admin',
        password: ''
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
          const username = this.form.username
          const password = this.form.password
          this.handleLogin({ username, password }).then(res => {
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
