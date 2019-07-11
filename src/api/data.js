import request from '@/libs/request'

/**
 * 保存错误日志
 * @param info
 */
export const saveErrorLogger = info => {
  return request({
    url: 'save_error_logger',
    data: info,
    method: 'post'
  })
}

/**
 * 获取服务列表
 */
export const getServiceList = () => {
  return request({
    url: 'service/list',
    method: 'get'
  })
}
