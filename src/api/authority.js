/**
 * 权限管理
 */
import request from '@/libs/request'



/**
 * 获取用户已分配权限
 * @param userId
 */
export const getUserGrantedAuthority = (userId) => {
  const params = {
    userId: userId
  }
  return request({
    url: 'base/authority/granted/user',
    params,
    method: 'get'
  })
}

/**
 * 获取角色已分配权限
 * @param roleId
 */
export const getRoleGrantedAuthority = (roleId) => {
  const params = {
    roleId: roleId
  }
  return request({
    url: 'base/authority/granted/role',
    params,
    method: 'get'
  })
}

/**
 * 获取应用已分配权限
 * @param roleId
 */
export const getAppGrantedAuthority = (appId) => {
  const params = {
    appId: appId
  }
  return request({
    url: 'base/authority/granted/app',
    params,
    method: 'get'
  })
}

/**
 * 获取菜单和操作权限列表
 * @param serviceId
 */
export const getMenuAuthorityList = () => {
  return request({
    url: 'base/authority/menu/list',
    method: 'get'
  })
}

/**
 * 获取API权限列表
 * @param serviceId
 */
export const getApiAuthorityList = (serviceId) => {
  return request({
    url: 'base/authority/api/list',
    method: 'get',
    params:{
      isOpen:1,
      serviceId:serviceId
    }
  })
}


/**
 * 用户授权
 * @param userId
 */
export const grantUserAuthority = ({userId,expireTime,authorityIds}) => {
  const data = {
    userId: userId,
    expireTime:expireTime,
    authorityIds:authorityIds.join(",")
  }
  return request({
    url: 'base/authority/grant/user',
    data,
    method: 'post'
  })
}

/**
 * 角色授权
 * @param userId
 */
export const grantRoleAuthority = ({roleId,expireTime,authorityIds}) => {
  const data = {
    roleId: roleId,
    expireTime:expireTime,
    authorityIds:authorityIds.join(",")
  }
  return request({
    url: 'base/authority/grant/role',
    data,
    method: 'post'
  })
}

/**
 * 应用授权
 * @param userId
 */
export const grantAppAuthority = ({appId,expireTime,authorityIds}) => {
  const data = {
    appId: appId,
    expireTime:expireTime,
    authorityIds:authorityIds.join(",")
  }
  return request({
    url: 'base/authority/grant/app',
    data,
    method: 'post'
  })
}
