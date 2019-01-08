<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <Avatar size="12" :src="userAvatar"/>
      <label class="user-name">{{userName}}</label>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="setting"><Icon size="16" type="md-person" /> 个人设置</DropdownItem>
        <DropdownItem divided name="logout"><Icon size="16" type="md-power" /> 退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
  import './user.less'
  import {mapActions} from 'vuex'

  export default {
    name: 'User',
    props: {
      userName: {
        type: String,
        default: ''
      },
      userAvatar: {
        type: String,
        default: ''
      }
    },
    methods: {
      ...mapActions([
        'handleLogout'
      ]),
      handleClick (name) {
        switch (name) {
          case 'setting':
            this.$router.push({
              name: 'setting'
            })
              break
          case 'logout':
            this.handleLogout().then(() => {
              // 地址栏重新刷新
              location.reload()
            })
            break
        }
      }
    }
  }
</script>
