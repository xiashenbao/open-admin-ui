import request from '@/libs/request'

export const refreshGateway = () => {
  const data = {}
  return request({
    url: 'actuator/refresh-gateway',
    data,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    },
    method: 'post'
  })
}

export const getAccessLogs = ({page, limit, path, ip, serviceId}) => {
  const params = {page: page, limit: limit, path: path, ip: ip, serviceId: serviceId}
  return request({
    url: 'gateway/access/logs',
    params,
    method: 'get'
  })
}
