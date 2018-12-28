import request from '@/libs/request'

export const getApis = () => {
  const data = {}
  return request({
    url: 'base/api',
    data,
    method: 'post'
  })
}

export const getAllApps = () => {
  const data = {}
  return request({
    url: 'base/app/list',
    data,
    method: 'post'
  })
}


export const updateApi = (data) => {
  return request({
    url: 'base/api/update',
    data,
    method: 'post'
  })
}

export const addApi = (data) => {
  return request({
    url: 'base/api/add',
    data,
    method: 'post'
  })
}

export const removeApi = ({apiId}) => {
  const data= {
    apiId:apiId
  }
  return request({
    url: 'base/api/remove',
    data,
    method: 'post'
  })
}
