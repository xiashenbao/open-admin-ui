import {login, logout, getUserInfo, getUserMenus} from '@/api/user'
import {setToken, getToken} from '@/libs/util'

export default {
  state: {
    userName: '',
    userId: '',
    nickName: '',
    avatarImgPath: '',
    token: getToken(),
    access: '',
    hasGetInfo: false,
    mobile: '',
    email: '',
    menus: []
  },
  mutations: {
    setAvatar (state, avatarPath) {
      state.avatarImgPath = avatarPath
    },
    setNickName (state, nickName) {
      state.nickName = nickName
    },
    setUserId (state, id) {
      state.userId = id
    },
    setUserName (state, name) {
      state.userName = name
    },
    setAccess (state, access) {
      state.access = access
    },
    setToken (state, token) {
      state.token = token
      setToken(token)
    },
    setHasGetInfo (state, status) {
      state.hasGetInfo = status
    },
    setUserMenus (state, menus) {
      state.menus = menus
    },
    setMobile (state, mobile) {
      state.mobile = mobile
    },
    setEmail (state, email) {
      state.email = email
    }
  },
  actions: {
    // 登录
    handleLogin ({commit}, {username, password}) {
      username = username.trim()
      return new Promise((resolve, reject) => {
        login({
          username,
          password
        }).then(res => {
          if (res) {
            if (res.code === 0) {
              commit('setToken', res.data.access_token)
              resolve()
            }
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogout ({state, commit}) {
      return new Promise((resolve, reject) => {
        logout().then(res => {
          commit('setToken', '')
          commit('setAccess', [])
          commit('setHasGetInfo', false)
          resolve(res)
        }).catch(err => {
          reject(err)
        })
        // 如果你的退出登录无需请求接口，则可以直接使用下面三行代码而无需使用logout调用接口
        // commit('setToken', '')
        // commit('setAccess', [])
        // resolve()
      })
    },
    // 获取用户相关信息
    getUserInfo ({state, commit}) {
      return new Promise((resolve, reject) => {
        getUserInfo().then(res => {
          if (res.code === 0) {
            commit('setAvatar', res.data.avatar)
            commit('setUserName', res.data.userName)
            commit('setNickName', res.data.nickName)
            commit('setUserId', res.data.userId)
            commit('setEmail', res.data.email)
            commit('setMobile', res.data.mobile)
            // 转换权限
            commit('setAccess', res.data.authorities)
            commit('setHasGetInfo', true)
            getUserMenus().then(res => {
              if (res.code === 0) {
                commit('setUserMenus', res.data)
                resolve(state)
              }
            }).catch(err => {
              reject(err)
            })
          }
        }).catch(err => {
          reject(err)
        })
      })
    }
  }
}
