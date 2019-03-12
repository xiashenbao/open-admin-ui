import request from '@/libs/request'

export const getOperationsByMenu = (menuId) => {
  const data = {menuId:menuId}
  return request({
    url: 'base/menu/operation',
    data,
    method: 'post'
  })
}

export const updateOperation = (data) => {
  return request({
    url: 'base/operation/update',
    data,
    method: 'post'
  })
}

export const addOperation = (data) => {
  return request({
    url: 'base/operation/add',
    data,
    method: 'post'
  })
}

export const removeOperation = ({operationId}) => {
  const data= {
    operationId:operationId
  }
  return request({
    url: 'base/operation/remove',
    data,
    method: 'post'
  })
}
