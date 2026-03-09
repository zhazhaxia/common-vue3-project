/**
 * 通用请求封装
 * 基于 Fetch API 封装，支持请求拦截、响应拦截、错误处理
 */

/**
 * 默认配置
 */
const defaultConfig = {
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * 请求拦截器队列
 */
const requestInterceptors = []

/**
 * 响应拦截器队列
 */
const responseInterceptors = []

/**
 * 添加请求拦截器
 * @param {Function} interceptor - 拦截器函数
 */
export function addRequestInterceptor(interceptor) {
  if (typeof interceptor === 'function') {
    requestInterceptors.push(interceptor)
  }
}

/**
 * 添加响应拦截器
 * @param {Function} interceptor - 拦截器函数
 */
export function addResponseInterceptor(interceptor) {
  if (typeof interceptor === 'function') {
    responseInterceptors.push(interceptor)
  }
}

/**
 * 超时控制
 * @param {Promise} promise - 请求Promise
 * @param {number} timeout - 超时时间
 * @returns {Promise} 带超时控制的Promise
 */
function timeoutPromise(promise, timeout) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`请求超时: ${timeout}ms`))
      }, timeout)
    })
  ])
}

/**
 * 请求方法
 * @param {string} url - 请求地址
 * @param {Object} options - 请求配置
 * @returns {Promise} 响应数据
 */
async function request(url, options = {}) {
  // 合并配置
  const config = {
    ...defaultConfig,
    ...options
  }
  
  // 构建完整URL
  const fullURL = config.baseURL + url
  
  // 构建请求头
  const headers = {
    ...defaultConfig.headers,
    ...config.headers
  }
  
  // 构建请求配置
  const fetchOptions = {
    method: config.method || 'GET',
    headers,
    credentials: config.credentials || 'same-origin'
  }
  
  // 处理请求体
  if (config.data && fetchOptions.method !== 'GET') {
    if (headers['Content-Type'].includes('application/json')) {
      fetchOptions.body = JSON.stringify(config.data)
    } else if (headers['Content-Type'].includes('multipart/form-data')) {
      fetchOptions.body = config.data
      delete headers['Content-Type'] // 让浏览器自动设置
    } else if (headers['Content-Type'].includes('application/x-www-form-urlencoded')) {
      fetchOptions.body = new URLSearchParams(config.data).toString()
    }
  }
  
  // 构建查询参数
  if (config.params && fetchOptions.method === 'GET') {
    const queryString = new URLSearchParams(config.params).toString()
    const separator = fullURL.includes('?') ? '&' : '?'
    fetchOptions.url = fullURL + separator + queryString
  } else {
    fetchOptions.url = fullURL
  }
  
  // 执行请求拦截器
  for (const interceptor of requestInterceptors) {
    await interceptor(fetchOptions)
  }
  
  try {
    // 发起请求
    const responsePromise = fetch(fetchOptions.url, fetchOptions)
    const response = await timeoutPromise(responsePromise, config.timeout)
    
    // 解析响应数据
    let data
    const contentType = response.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else if (contentType.includes('text')) {
      data = await response.text()
    } else {
      data = await response.blob()
    }
    
    // 构建响应对象
    const result = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      config: fetchOptions
    }
    
    // 执行响应拦截器
    for (const interceptor of responseInterceptors) {
      await interceptor(result)
    }
    
    // 处理HTTP错误状态
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status} ${response.statusText}`)
    }
    
    return result.data
  } catch (error) {
    console.error('请求失败:', error)
    throw error
  }
}

/**
 * GET请求
 * @param {string} url - 请求地址
 * @param {Object} config - 请求配置
 * @returns {Promise} 响应数据
 */
export function get(url, config = {}) {
  return request(url, {
    method: 'GET',
    ...config
  })
}

/**
 * POST请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} config - 请求配置
 * @returns {Promise} 响应数据
 */
export function post(url, data, config = {}) {
  return request(url, {
    method: 'POST',
    data,
    ...config
  })
}

/**
 * PUT请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} config - 请求配置
 * @returns {Promise} 响应数据
 */
export function put(url, data, config = {}) {
  return request(url, {
    method: 'PUT',
    data,
    ...config
  })
}

/**
 * DELETE请求
 * @param {string} url - 请求地址
 * @param {Object} config - 请求配置
 * @returns {Promise} 响应数据
 */
export function del(url, config = {}) {
  return request(url, {
    method: 'DELETE',
    ...config
  })
}

/**
 * PATCH请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} config - 请求配置
 * @returns {Promise} 响应数据
 */
export function patch(url, data, config = {}) {
  return request(url, {
    method: 'PATCH',
    data,
    ...config
  })
}

/**
 * 创建请求实例
 * @param {Object} config - 实例配置
 * @returns {Object} 请求实例
 */
export function createRequest(config = {}) {
  const instanceConfig = {
    ...defaultConfig,
    ...config
  }
  
  return {
    get: (url, options) => get(url, { ...instanceConfig, ...options }),
    post: (url, data, options) => post(url, data, { ...instanceConfig, ...options }),
    put: (url, data, options) => put(url, data, { ...instanceConfig, ...options }),
    delete: (url, options) => del(url, { ...instanceConfig, ...options }),
    patch: (url, data, options) => patch(url, data, { ...instanceConfig, ...options })
  }
}

export default {
  request,
  get,
  post,
  put,
  delete: del,
  patch,
  createRequest,
  addRequestInterceptor,
  addResponseInterceptor
}
