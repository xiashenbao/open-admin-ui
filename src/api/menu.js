import request from '@/libs/request'

export const getMenus = () => {
  const data = {}
  return request({
    url: 'base/menu/all',
    data,
    method: 'post'
  })
}


export const updateMenu = (data) => {
  return request({
    url: 'base/menu/update',
    data,
    method: 'post'
  })
}

export const addMenu = (data) => {
  return request({
    url: 'base/menu/add',
    data,
    method: 'post'
  })
}

export const removeMenu = ({menuId}) => {
  const data= {
    menuId:menuId
  }
  return request({
    url: 'base/menu/remove',
    data,
    method: 'post'
  })
}
