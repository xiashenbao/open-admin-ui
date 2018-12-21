<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <Avatar  :src="userAvatar"/>
      <label class="user-name">{{userName}}</label>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="info">个人信息</DropdownItem>
        <DropdownItem divided name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import './user.less'
import { mapActions } from 'vuex'
import minLogo from '@/assets/images/avatar.jpg'

export default {
  name: 'User',
  props: {
    userName: {
      type: String,
      default: ''
    },
    userAvatar: {
      type: String,
      default: minLogo
    }
  },
  methods: {
    ...mapActions([
      'handleLogout'
    ]),
    handleClick (name) {
      switch (name) {
        case 'logout':
          this.handleLogout().then(() => {
            location.reload()
            this.$router.push({
              name: 'login'
            })
          })
          break
      }
    }
  }
}
</script>
