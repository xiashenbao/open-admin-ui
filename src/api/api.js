import request from '@/libs/request'

/**
 * 获取接口列表
 * @param page
 * @param limit
 */
export const getApis = ({page, limit}) => {
  const data = {page: page, limit: limit}
  return request({
    url: 'base/api',
    data,
    method: 'post'
  })
}

/**
 * 获取所有接口
 */
export const getAllApi = () => {
  return request({
    url: 'base/api/all',
    method: 'post'
  })
}

/**
 * 添加接口
 * @param apiCode
 * @param apiName
 * @param apiCategory
 * @param serviceId
 * @param path
 * @param status
 * @param priority
 * @param apiDesc
 * @param isOpen
 * @param isAuth
 */
export const addApi = ({apiCode, apiName, apiCategory, serviceId, path, status, priority, apiDesc, isOpen, isAuth}) => {
  const data = {
    apiCode: apiCode,
    apiName: apiName,
    apiCategory: apiCategory,
    serviceId: serviceId,
    path: path,
    status: status,
    priority: priority,
    apiDesc: apiDesc,
    isOpen: isOpen,
    isAuth: isAuth
  }
  return request({
    url: 'base/api/add',
    data,
    method: 'post'
  })
}

/**
 * 更新接口
 * @param apiId
 * @param apiCode
 * @param apiName
 * @param apiCategory
 * @param serviceId
 * @param path
 * @param status
 * @param priority
 * @param apiDesc
 * @param isOpen
 * @param isAuth
 */
export const updateApi = ({apiId, apiCode, apiName, apiCategory, serviceId, path, status, priority, apiDesc, isOpen, isAuth}) => {
  const data = {
    apiId: apiId,
    apiCode: apiCode,
    apiName: apiName,
    apiCategory: apiCategory,
    serviceId: serviceId,
    path: path,
    status: status,
    priority: priority,
    apiDesc: apiDesc,
    isOpen: isOpen,
    isAuth: isAuth
  }
  return request({
    url: 'base/api/update',
    data,
    method: 'post'
  })
}

/**
 * 删除接口
 * @param apiId
 */
export const removeApi = (apiId) => {
  const data = {
    apiId: apiId
  }
  return request({
    url: 'base/api/remove',
    data,
    method: 'post'
  })
}
