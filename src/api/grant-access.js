import request from '@/libs/request'

export const getGrantAccess = ({page,limit}) => {
  const data = {page:page,limit:limit}
  return request({
    url: 'base/grant/access',
    data,
    method: 'post'
  })
}

export const grantRoleMenu = ({roleId,grantMenus}) => {
  const data= {
    roleId:roleId,
    menuIds:grantMenus.join(",")
  }
  return request({
    url: 'base/grant/role/menu',
    data,
    method: 'post'
  })
}

export const grantRoleAction = ({roleId,grantActions}) => {
  const data= {
    roleId:roleId,
    actionIds:grantActions.join(",")
  }
  return request({
    url: 'base/grant/role/action',
    data,
    method: 'post'
  })
}

export const grantRoleApi = ({roleId,grantApis}) => {
  const data= {
    roleId:roleId,
    apiIds:grantApis.join(",")
  }
  return request({
    url: 'base/grant/role/api',
    data,
    method: 'post'
  })
}

export const getGrantedRoleMenu = (roleId) => {
  const data= {
    roleId:roleId
  }
  return request({
    url: 'base/granted/role/menu',
    data,
    method: 'post'
  })
}

export const getGrantedRoleAction = (roleId) => {
  const data= {
    roleId:roleId
  }
  return request({
    url: 'base/granted/role/action',
    data,
    method: 'post'
  })
}

export const getGrantedRoleApi = (roleId) => {
  const data= {
    roleId:roleId
  }
  return request({
    url: 'base/granted/role/api',
    data,
    method: 'post'
  })
}



export const grantUserMenu = ({userId,grantMenus}) => {
  const data= {
    userId:userId,
    menuIds:grantMenus.join(",")
  }
  return request({
    url: 'base/grant/user/menu',
    data,
    method: 'post'
  })
}

export const grantUserAction = ({userId,grantActions}) => {
  const data= {
    userId:userId,
    actionIds:grantActions.join(",")
  }
  return request({
    url: 'base/grant/user/action',
    data,
    method: 'post'
  })
}

export const grantUserApi = ({userId,grantApis}) => {
  const data= {
    userId:userId,
    apiIds:grantApis.join(",")
  }
  return request({
    url: 'base/grant/user/api',
    data,
    method: 'post'
  })
}

export const getGrantedUserMenu = (userId) => {
  const data= {
    userId:userId
  }
  return request({
    url: 'base/granted/user/menu',
    data,
    method: 'post'
  })
}

export const getGrantedUserAction = (userId) => {
  const data= {
    userId:userId
  }
  return request({
    url: 'base/granted/user/action',
    data,
    method: 'post'
  })
}

export const getGrantedUserApi = (userId) => {
  const data= {
    userId:userId
  }
  return request({
    url: 'base/granted/user/api',
    data,
    method: 'post'
  })
}
