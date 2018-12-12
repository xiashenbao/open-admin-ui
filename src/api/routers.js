import request from '@/libs/request'

export const getRouterReq = (access) => {
  return request({
    url: 'get_router',
    params: {
      access
    },
    method: 'get'
  })
}
