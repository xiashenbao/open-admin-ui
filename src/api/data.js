import request from '@/libs/request'

export const saveErrorLogger = info => {
  return request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}


export const uploadImg = formData => {
  return request({
    url: 'image/upload',
    data: formData
  })
}


export const loginConfig = () => {
  return request({
    url: 'auth/login/other/config',
    method: 'get'
  })
}


export const getServiceList = () => {
  return request({
    url: 'service/list',
    method: 'get'
  })
}
