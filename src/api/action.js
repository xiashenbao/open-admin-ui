import request from '@/libs/request'

export const getActions = (menuId) => {
  const data = {menuId:menuId}
  return request({
    url: 'base/action/list',
    data,
    method: 'post'
  })
}

export const updateAction = (data) => {
  return request({
    url: 'base/action/update',
    data,
    method: 'post'
  })
}

export const addAction = (data) => {
  return request({
    url: 'base/action/add',
    data,
    method: 'post'
  })
}

export const removeAction = ({actionId}) => {
  const data= {
    actionId:actionId
  }
  return request({
    url: 'base/action/remove',
    data,
    method: 'post'
  })
}
