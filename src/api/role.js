import request from '@/libs/request'

/**
 * 获取角色列表
 * @param page
 * @param limit
 */
export const getRoles = ({page, limit}) => {
  const data = {page: page, limit: limit}
  return request({
    url: 'base/role',
    data,
    method: 'post'
  })
}

/**
 * 获取所有角色
 */
export const getAllRoles = () => {
  return request({
    url: 'base/role/all',
    method: 'post'
  })
}

/**
 * 添加角色
 * @param roleCode
 * @param roleName
 * @param roleDesc
 * @param status
 */
export const addRole = ({roleCode, roleName, roleDesc, status}) => {
  const data = {
    roleCode: roleCode,
    roleName: roleName,
    roleDesc: roleDesc,
    status: status
  }
  return request({
    url: 'base/role/add',
    data,
    method: 'post'
  })
}

/**
 * 更新角色
 * @param roleId
 * @param roleCode
 * @param roleName
 * @param roleDesc
 * @param status
 */
export const updateRole = ({roleId, roleCode, roleName, roleDesc, status}) => {
  const data = {
    roleId: roleId,
    roleCode: roleCode,
    roleName: roleName,
    roleDesc: roleDesc,
    status: status
  }
  return request({
    url: 'base/role/update',
    data,
    method: 'post'
  })
}

/**
 * 删除角色
 * @param roleId
 */
export const removeRole = (roleId) => {
  const data = {
    roleId: roleId
  }
  return request({
    url: 'base/role/remove',
    data,
    method: 'post'
  })
}

/**
 * 获取角色成员
 * @param roleId
 * @param userIds
 */
export const getRoleUsers = (roleId) => {
  const data = {
    roleId: roleId
  }
  return request({
    url: 'base/role/users',
    data,
    method: 'post'
  })
}

/**
 * 添加角色成员
 * @param roleId
 * @param userIds
 */
export const addRoleUsers = ({roleId,userIds}) => {
  const data = {
    roleId: roleId,
    userIds:userIds.join(',')
  }
  return request({
    url: 'base/role/users/add',
    data,
    method: 'post'
  })
}


