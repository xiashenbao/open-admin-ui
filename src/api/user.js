import request from '@/libs/request'

export const login = ({ username, password }) => {
  const data = {
    username,
    password
  }
  return request({
    url: 'login/token',
    data,
    method: 'post'
  })
}

export const getUserInfo = () => {
  return request({
    url: 'auth/user',
    method: 'get'
  })
}

export const getUserMenus = () => {
  return request({
    url: 'base/user/grant/menus',
    method: 'get'
  })
}

export const logout = () => {
  return request({
    url: 'logout',
    method: 'get'
  })
}
