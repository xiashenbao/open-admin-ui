import request from '@/libs/request'

export const getApps = () => {
  const data = {}
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
