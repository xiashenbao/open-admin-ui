import request from '@/libs/request'

export const login = ({ username, password }) => {
  const data = {
    username,
    password
  }
  return request({
    url: 'admin/login/token',
    data,
    method: 'post'
  })
}

export const getUserInfo = () => {
  return request({
    url: 'auth/user/me',
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
export const getMyAuthority = () => {
  return request({
    url: 'base/authority/granted/me',
    method: 'get'
  })
}

export const getAllUsers = () => {
  const data = {keyword:''}
  return request({
    url: 'base/user/all',
    data,
    method: 'post'
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

/**
 * 分配用户角色
 * @param data
 */
export const addUserRoles = ({userId,grantRoles}) => {
  const data = {userId:userId,roleIds:grantRoles.join(',')}
  return request({
    url: 'base/user/roles/add',
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
