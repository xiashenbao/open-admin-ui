import request from '@/libs/request'

export const refreshGateway = () => {
  const data = {}
  return request({
    url: 'actuator/refresh-gateway',
    data,
    headers:{
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'post'
  })
}

export const getAccessLogs = ({page,limit}) => {
  const data = {page:page,limit:limit}
  return request({
    url: 'gateway/access/logs',
    data,
    method: 'post'
  })
}
