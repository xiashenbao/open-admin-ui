import axios from 'axios';
import qs from "qs";
import config from '@/config'
import {getToken} from '@/libs/util'

const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
/****** 创建axios实例 ******/
const service = axios.create({
  baseURL: baseUrl,  // api的base_url
  timeout: 5000  // 请求超时时间
});
/****** request拦截器==>对请求参数做处理 ******/
service.interceptors.request.use(config => {
  config.method === 'post'
    ? config.data = qs.stringify({...config.data})
    : config.params = {...config.params};
  config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
  if (getToken()) {
    config.headers['Authorization'] = 'Bearer ' + getToken();
  }
  return config;
}, error => {  //请求错误处理
  Promise.reject(error)
});

export default service
