import request from '@/libs/request'

export const getMenus = () => {
  const data = {}
  return request({
    url: 'base/menu/all',
    data,
    method: 'post'
  })
}
