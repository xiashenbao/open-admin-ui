import request from '@/libs/request'

export const getGrantAccess = ({page,limit}) => {
  const data = {page:page,limit:limit}
  return request({
    url: 'base/grant/access',
    data,
    method: 'post'
  })
}
