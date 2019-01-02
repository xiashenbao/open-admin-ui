import request from '@/libs/request'

export const getApps = ({page,limit}) => {
  const data = {page:page,limit:limit}
  return request({
    url: 'base/app',
    data,
    method: 'post'
  })
}


export const updateApp = (data) => {
  return request({
    url: 'base/app/update',
    data,
    method: 'post'
  })
}

export const addApp = (data) => {
  return request({
    url: 'base/app/add',
    data,
    method: 'post'
  })
}

export const removeApp = ({appId}) => {
  const data= {
    appId:appId
  }
  return request({
    url: 'base/app/remove',
    data,
    method: 'post'
  })
}

export const getAppInfo = ({appId}) => {
  return request({
    url: `base/app/${appId}`,
    method: 'get'
  })
}

export const getAppDevInfo = ({appId}) => {
  return request({
    url: `base/app/dev/${appId}`,
    method: 'get'
  })
}
