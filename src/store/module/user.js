import {login, logout, getUserInfo, getUserMenus} from '@/api/user'
import {setToken, getToken, getAccessArray} from '@/libs/util'
import {Message} from 'iview'

export default {
  state: {
    userName: '',
    userId: '',
    nickName: '',
    avatarImgPath: '',
    token: getToken(),
    access: '',
    hasGetInfo: false,
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
          const data = res.data
          if (data.code === 0) {
            commit('setToken', data.data.access_token)
            resolve()
          } else {
            Message.error({content: data.message})
          }
        }).catch(err => {
          reject(err)
        })
      })
    },
    // 退出登录
    handleLogout ({state, commit}) {
      return new Promise((resolve, reject) => {
        logout().then(() => {
          commit('setToken', '')
          commit('setAccess', [])
          commit('setHasGetInfo', false)
          resolve()
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
        try {
          getUserInfo().then(res => {
            const data = res.data
            commit('setAvatar', data.data.avatar)
            commit('setUserName', data.data.username)
            commit('setNickName', data.data.nickName)
            commit('setUserId', data.data.tenantId)
            // 转换权限
            commit('setAccess', getAccessArray(data.data.authorities))
            commit('setHasGetInfo', true)
          }).catch(err => {
            reject(err)
          }).then(res => {
            getUserMenus().then(res => {
              const data = res.data
              commit('setUserMenus', data.data)
              resolve(state)
            }).catch(err => {
              reject(err)
            })
          })
        } catch (error) {
          reject(error)
        }
      })
    }
  }
}
