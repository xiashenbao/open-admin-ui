import request from '@/libs/request'

export const login = ({ username, password }) => {
  const data = {
    username,
    password
  }
  return request({
    url: 'rest/login',
    data,
    method: 'post'
  })
}

export const getUserInfo = (token) => {
  return request({
    url: 'auth/user',
    method: 'get'
  })
}

export const logout = (token) => {
  return request({
    url: 'logout',
    method: 'get'
  })
}
