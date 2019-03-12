import request from '@/libs/request'

export const getAccessLogs = ({page,limit}) => {
  const data = {page:page,limit:limit}
  return request({
    url: 'gateway/access/logs',
    data,
    method: 'post'
  })
}
