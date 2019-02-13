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
export const getUsers = ({page,limit}) => {
  const data = {page:page,limit:limit}
  return request({
    url: 'base/user',
    data,
    method: 'post'
  })
}
export const getUserMenus = () => {
  return request({
    url: 'base/grant/login/menus',
    method: 'get'
  })
}

export const getUserActions = () => {
  return request({
    url: 'base/grant/login/actions',
    method: 'get'
  })
}

export const logout = () => {
  return request({
    url: 'logout',
    method: 'get'
  })
}

export const updateUser = (data) => {
  return request({
    url: 'base/user/update',
    data,
    method: 'post'
  })
}

export const addUser = (data) => {
  return request({
    url: 'base/user/add',
    data,
    method: 'post'
  })
}


export const getUserRoles = (userId) => {
  const data= {
    userId:userId
  }
  return request({
    url: 'base/user/roles',
    data,
    method: 'post'
  })
}
