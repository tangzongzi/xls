import { createApp } from 'vue'
import axios from 'axios'
import './style.css'
import App from './App.vue'

// 配置axios默认值
axios.defaults.timeout = 10000 // 10秒超时
axios.defaults.headers.common['Accept'] = 'application/json'

// 错误处理拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    console.error('API请求错误:', error)
    return Promise.reject(error)
  }
)

createApp(App).mount('#app')
