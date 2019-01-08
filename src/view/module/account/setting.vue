<template>
  <Card shadow>
    <div>
      <div  class="account-setting-con left-con">
        <Menu  active-name="profile" @on-select="handleSelect">
          <MenuItem name="profile">
            <span>基本信息</span>
          </MenuItem>
          <MenuItem name="security">
            <span>安全设置</span>
          </MenuItem>
        </Menu>
      </div>
      <div class="account-setting-con view-con">
        <Form v-if="currentSelect==='profile'" ref="userForm" :model="profile">
          <h3>
            <span>基本信息</span>
          </h3>
          <Row>
            <Col span="8">
            <FormItem label="昵称" prop="nickName">
              <Input v-model="profile.nickName" placeholder="请输入内容"></Input>
            </FormItem>
            <FormItem label="描述">
              <Input v-model="profile.userDesc" type="textarea" placeholder="请输入内容"></Input>
            </FormItem>
            </Col>
            <Col span="8">
            <FormItem label="头像" prop="nickName">
              <Avatar  style="height: 128px;width: 128px;border-radius: 50%;" src="https://i.loli.net/2017/08/21/599a521472424.jpg" size="large" />
            </FormItem>
            </Col>
          </Row>
          <FormItem>
            <Button type="primary" @click="handleSubmit">保存</Button>
          </FormItem>
        </Form>

        <div  v-if="currentSelect==='security'">
          <h3>
            <span>安全设置</span>
          </h3>
          <Divider />
          <p>登陆名</p>
          <p style="color: #9ea7b4">当前登录名:{{profile.userName}}</p>
          <Divider />
          <p>绑定手机</p>
          <p style="color: #9ea7b4">
            <span v-if="profile.mobile">已绑定手机：{{profile.mobile}}&nbsp;&nbsp;<a>修改</a></span>
            <span v-else="">
               尚未绑定手机 <a>绑定</a>
            </span>
          </p>
          <Divider />
          <p>绑定邮箱</p>
          <p style="color: #9ea7b4">
            <span v-if="profile.email">已绑定邮箱：{{profile.email}}&nbsp;&nbsp;<a>修改</a></span>
            <span v-else="">
               尚未绑定手机 <a>绑定</a>
            </span>
          </p>
          <Divider style="color: #9ea7b4" />
        </div>
      </div>
    </div>
  </Card>
</template>

<script>
  export default {
    name: 'message_page',
    data () {
      return {
        currentSelect: 'profile',
        profile: this.$store.state.user,
      }
    },
    methods: {
      handleSubmit(){
          console.log(JSON.stringify(this.profile))
      },
      handleSelect (name) {
        this.currentSelect = name
      }
    },
    mounted () {
    }
  }
</script>

<style lang="less">
  .account-setting{
    &-con{
      height: ~"calc(100vh - 176px)";
      display: inline-block;
      vertical-align: top;
      position: relative;
      &.left-con{
        border-right: 1px solid #e6e6e6;
      }
      &.view-con{
        position: absolute;
        left: 264px;
        top: 16px;
        right: 16px;
        bottom: 16px;
        overflow: auto;
        padding: 12px 20px 0;
      }
    }
  }
</style>
