import request from '@/libs/request'

export const getRoles = ({page,limit}) => {
  const data = {page:page,limit:limit}
  return request({
    url: 'base/role',
    data,
    method: 'post'
  })
}

export const updateRole = (data) => {
  return request({
    url: 'base/role/update',
    data,
    method: 'post'
  })
}

export const addRole = (data) => {
  return request({
    url: 'base/role/add',
    data,
    method: 'post'
  })
}

export const removeRole = ({roleId}) => {
  const data= {
    roleId:roleId
  }
  return request({
    url: 'base/role/remove',
    data,
    method: 'post'
  })
}

export const roleGrantMenu = ({roleId,grantMenus}) => {
  const data= {
    roleId:roleId,
    menuIds:grantMenus.join(",")
  }
  return request({
    url: 'base/role/grant/menu',
    data,
    method: 'post'
  })
}

export const roleGrantAction = ({roleId,grantActions}) => {
  const data= {
    roleId:roleId,
    actionIds:grantActions.join(",")
  }
  return request({
    url: 'base/role/grant/action',
    data,
    method: 'post'
  })
}

export const roleGrantApi = ({roleId,grantApis}) => {
  const data= {
    roleId:roleId,
    apiIds:grantApis.join(",")
  }
  return request({
    url: 'base/role/grant/api',
    data,
    method: 'post'
  })
}

export const getRoleGrantedMenu = (roleId) => {
  const data= {
    roleId:roleId
  }
  return request({
    url: 'base/role/granted/menu',
    data,
    method: 'post'
  })
}

export const getRoleGrantedAction = (roleId) => {
  const data= {
    roleId:roleId
  }
  return request({
    url: 'base/role/granted/action',
    data,
    method: 'post'
  })
}

export const getRoleGrantedApi = (roleId) => {
  const data= {
    roleId:roleId
  }
  return request({
    url: 'base/role/granted/api',
    data,
    method: 'post'
  })
}
