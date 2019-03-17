import request from '@/libs/request'

/**
 * 获取菜单下操作列表
 * @param menuId
 */
export const getOperationsByMenu = (menuId) => {
  const data = {menuId: menuId}
  return request({
    url: 'base/menu/operation',
    data,
    method: 'post'
  })
}

/**
 * 添加操作
 * @param operationCode
 * @param operationName
 * @param menuId
 * @param apiId
 * @param status
 * @param priority
 * @param operationDesc
 */
export const addOperation = ({operationCode, operationName, menuId,  status, priority, operationDesc}) => {
  const data = {
    operationCode: operationCode,
    operationName: operationName,
    menuId: menuId,
    status: status,
    priority: priority,
    operationDesc: operationDesc
  }
  return request({
    url: 'base/operation/add',
    data,
    method: 'post'
  })
}

/**
 * 更新操作
 * @param operationId
 * @param operationCode
 * @param operationName
 * @param menuId
 * @param apiId
 * @param status
 * @param priority
 * @param operationDesc
 */
export const updateOperation = ({operationId, operationCode, operationName, menuId,  status, priority, operationDesc}) => {
  const data = {
    operationId: operationId,
    operationCode: operationCode,
    operationName: operationName,
    menuId: menuId,
    status: status,
    priority: priority,
    operationDesc: operationDesc
  }
  return request({
    url: 'base/operation/update',
    data,
    method: 'post'
  })
}

/**
 * 绑定API资源
 * @param operationId
 * @param apiIds
 */
export const addOperationApi = ({operationId, apiIds}) => {
  const data = {
    operationId: operationId,
    apiIds: apiIds.join(",")
  }
  return request({
    url: 'base/operation/api/add',
    data,
    method: 'post'
  })
}


export const getOperationApi = (operationId) => {
  const data = {
    operationId: operationId
  }
  return request({
    url: 'base/operation/api',
    data,
    method: 'post'
  })
}

/**
 * 删除操作
 * @param operationId
 */
export const removeOperation = (operationId) => {
  const data = {
    operationId: operationId
  }
  return request({
    url: 'base/operation/remove',
    data,
    method: 'post'
  })
}
