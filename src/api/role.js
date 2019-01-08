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



export const roleGrantApi = ({roleId,apiIds}) => {
  const data= {
    roleId:roleId,
    apiIds:apiIds
  }
  return request({
    url: 'base/role/grant/api',
    data,
    method: 'post'
  })
}


export const roleGrantMenu = ({roleId,menuIds}) => {
  const data= {
    roleId:roleId,
    menuIds:menuIds
  }
  return request({
    url: 'base/role/grant/menu',
    data,
    method: 'post'
  })
}

export const roleGrantAction = ({roleId,actionIds}) => {
  const data= {
    roleId:roleId,
    actionIds:actionIds
  }
  return request({
    url: 'base/role/grant/action',
    data,
    method: 'post'
  })
}
