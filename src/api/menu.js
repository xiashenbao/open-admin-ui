import request from '@/libs/request'

/**
 * 获取菜单列表
 */
export const getMenus = () => {
  return request({
    url: 'base/menu/all',
    method: 'post'
  })
}

/**
 * 添加菜单
 * @param menuCode
 * @param menuName
 * @param icon
 * @param prefix
 * @param path
 * @param target
 * @param status
 * @param parentId
 * @param priority
 * @param menuDesc
 */
export const addMenu = ({menuCode, menuName, icon, prefix, path, target, status, parentId, priority, menuDesc}) => {
  const data = {
    menuCode: menuCode,
    menuName: menuName,
    icon: icon,
    prefix: prefix,
    path: path,
    target: target,
    status: status,
    parentId: parentId,
    priority: priority,
    menuDesc: menuName
  }
  return request({
    url: 'base/menu/add',
    data,
    method: 'post'
  })
}

/**
 * 更新菜单
 * @param menuId
 * @param menuCode
 * @param menuName
 * @param icon
 * @param prefix
 * @param path
 * @param target
 * @param status
 * @param parentId
 * @param priority
 * @param menuDesc
 */
export const updateMenu = ({menuId, menuCode, menuName, icon, prefix, path, target, status, parentId, priority, menuDesc}) => {
  const data = {
    menuId: menuId,
    menuCode: menuCode,
    menuName: menuName,
    icon: icon,
    prefix: prefix,
    path: path,
    target: target,
    status: status,
    parentId: parentId,
    priority: priority,
    menuDesc: menuName
  }
  return request({
    url: 'base/menu/update',
    data,
    method: 'post'
  })
}
/**
 * 删除菜单
 * @param menuId
 */
export const removeMenu = (menuId) => {
  const data = {
    menuId: menuId
  }
  return request({
    url: 'base/menu/remove',
    data,
    method: 'post'
  })
}

