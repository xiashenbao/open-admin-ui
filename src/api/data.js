import request from '@/libs/request'

export const getTableData = () => {
  return request({
    url: 'get_table_data',
    method: 'get'
  })
}

export const getDragList = () => {
  return request({
    url: 'get_drag_list',
    method: 'get'
  })
}

export const errorReq = () => {
  return request({
    url: 'error_url',
    method: 'post'
  })
}

export const saveErrorLogger = info => {
  return request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}
