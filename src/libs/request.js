import axios from 'axios'
import qs from 'qs'
import config from '@/config'
import { getToken } from '@/libs/util'
import { Message } from 'iview'

const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
/** **** 创建axios实例 ******/
const service = axios.create({
  baseURL: baseUrl, // api的base_url
  timeout: 5000 // 请求超时时间
})
/** **** request拦截器==>对请求参数做处理 ******/
service.interceptors.request.use((config) => {
  config.method === 'post'
    ? config.data = qs.stringify({ ...config.data })
    : config.params = { ...config.params }
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
  if (getToken()) {
    config.headers['Authorization'] = 'Bearer ' + getToken()
  }
  return config
}
)

service.interceptors.response.use(
  (response) => {
    if (response.data.code === 0) {
      // 服务端定义的响应code码为0时请求成功
      // 使用Promise.resolve 正常响应
      return Promise.resolve(response.data)
    } else {
      return Promise.reject(response.data)
    }
  }, error => {
    let message = ''
    if (error && error.response) {
      switch (error.response.status) {
        case 400:
          message = '错误请求'
          break
        case 401:
          message = '未授权，请重新登录'
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求错误,未找到该资源'
          break
        case 405:
          message = '请求方法未允许'
          break
        case 408:
          message = '请求超时'
          break
        case 500:
          message = '服务器端出错'
          break
        case 501:
          message = '网络未实现'
          break
        case 502:
          message = '网络错误'
          break
        case 503:
          message = '服务不可用'
          break
        case 504:
          message = '网络超时'
          break
        case 505:
          message = 'http版本不支持该请求'
          break
        default:
          message = `连接错误${error.response.status}`
      }
    } else {
      message = '连接到服务器失败'
    }
    Message.error({ content: message })
    // 请求错误处理
    return Promise.resolve(error.response)
  }
)

export default service
