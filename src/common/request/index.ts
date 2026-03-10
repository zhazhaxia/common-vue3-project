/**
 * 通用请求封装
 * 基于 Fetch API 封装，支持请求拦截、响应拦截、错误处理
 */

/**
 * 请求配置接口
 */
export interface RequestConfig {
  baseURL?: string
  timeout?: number
  headers?: Record<string, string>
  method?: string
  data?: any
  params?: Record<string, any>
  credentials?: RequestCredentials
}

/**
 * 请求选项接口
 */
export interface FetchOptions extends RequestInit {
  url: string
}

/**
 * 响应接口
 */
export interface ResponseData<T = any> {
  data: T
  status: number
  statusText: string
  headers: Headers
  config: FetchOptions
}

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (options: FetchOptions) => Promise<void> | void

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor = <T = any>(response: ResponseData<T>) => Promise<void> | void

/**
 * 默认配置
 */
const defaultConfig: RequestConfig = {
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
}

/**
 * 请求拦截器队列
 */
const requestInterceptors: RequestInterceptor[] = []

/**
 * 响应拦截器队列
 */
const responseInterceptors: ResponseInterceptor[] = []

/**
 * 添加请求拦截器
 * @param interceptor - 拦截器函数
 */
export function addRequestInterceptor(interceptor: RequestInterceptor) {
  if (typeof interceptor === 'function') {
    requestInterceptors.push(interceptor)
  }
}

/**
 * 添加响应拦截器
 * @param interceptor - 拦截器函数
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  if (typeof interceptor === 'function') {
    responseInterceptors.push(interceptor)
  }
}

/**
 * 超时控制
 * @param promise - 请求Promise
 * @param timeout - 超时时间
 * @returns 带超时控制的Promise
 */
function timeoutPromise<T>(promise: Promise<T>, timeout: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`请求超时: ${timeout}ms`))
      }, timeout)
    })
  ])
}

/**
 * 请求方法
 * @param url - 请求地址
 * @param options - 请求配置
 * @returns 响应数据
 */
async function request<T = any>(url: string, options: RequestConfig = {}): Promise<T> {
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
  const fetchOptions: FetchOptions = {
    method: config.method || 'GET',
    headers,
    credentials: config.credentials || 'same-origin',
    url: fullURL
  }
  
  // 处理请求体
  if (config.data && fetchOptions.method !== 'GET') {
    if (headers['Content-Type']?.includes('application/json')) {
      fetchOptions.body = JSON.stringify(config.data)
    } else if (headers['Content-Type']?.includes('multipart/form-data')) {
      fetchOptions.body = config.data as BodyInit
      delete headers['Content-Type'] // 让浏览器自动设置
    } else if (headers['Content-Type']?.includes('application/x-www-form-urlencoded')) {
      fetchOptions.body = new URLSearchParams(config.data as Record<string, string>).toString()
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
    const response = await timeoutPromise(responsePromise, config.timeout || 10000)
    
    // 解析响应数据
    let data: any
    const contentType = response.headers.get('Content-Type') || ''
    if (contentType.includes('application/json')) {
      data = await response.json()
    } else if (contentType.includes('text')) {
      data = await response.text()
    } else {
      data = await response.blob()
    }
    
    // 构建响应对象
    const result: ResponseData<T> = {
      data: data as T,
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
 * @param url - 请求地址
 * @param config - 请求配置
 * @returns 响应数据
 */
export function get<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
  return request<T>(url, {
    method: 'GET',
    ...config
  })
}

/**
 * POST请求
 * @param url - 请求地址
 * @param data - 请求数据
 * @param config - 请求配置
 * @returns 响应数据
 */
export function post<T = any>(url: string, data: any, config: RequestConfig = {}): Promise<T> {
  return request<T>(url, {
    method: 'POST',
    data,
    ...config
  })
}

/**
 * PUT请求
 * @param url - 请求地址
 * @param data - 请求数据
 * @param config - 请求配置
 * @returns 响应数据
 */
export function put<T = any>(url: string, data: any, config: RequestConfig = {}): Promise<T> {
  return request<T>(url, {
    method: 'PUT',
    data,
    ...config
  })
}

/**
 * DELETE请求
 * @param url - 请求地址
 * @param config - 请求配置
 * @returns 响应数据
 */
export function del<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
  return request<T>(url, {
    method: 'DELETE',
    ...config
  })
}

/**
 * PATCH请求
 * @param url - 请求地址
 * @param data - 请求数据
 * @param config - 请求配置
 * @returns 响应数据
 */
export function patch<T = any>(url: string, data: any, config: RequestConfig = {}): Promise<T> {
  return request<T>(url, {
    method: 'PATCH',
    data,
    ...config
  })
}

/**
 * 请求实例接口
 */
export interface RequestInstance {
  get<T = any>(url: string, config?: RequestConfig): Promise<T>
  post<T = any>(url: string, data: any, config?: RequestConfig): Promise<T>
  put<T = any>(url: string, data: any, config?: RequestConfig): Promise<T>
  delete<T = any>(url: string, config?: RequestConfig): Promise<T>
  patch<T = any>(url: string, data: any, config?: RequestConfig): Promise<T>
}

/**
 * 创建请求实例
 * @param config - 实例配置
 * @returns 请求实例
 */
export function createRequest(config: RequestConfig = {}): RequestInstance {
  const instanceConfig = {
    ...defaultConfig,
    ...config
  }
  
  return {
    get: <T = any>(url: string, options?: RequestConfig) => get<T>(url, { ...instanceConfig, ...options }),
    post: <T = any>(url: string, data: any, options?: RequestConfig) => post<T>(url, data, { ...instanceConfig, ...options }),
    put: <T = any>(url: string, data: any, options?: RequestConfig) => put<T>(url, data, { ...instanceConfig, ...options }),
    delete: <T = any>(url: string, options?: RequestConfig) => del<T>(url, { ...instanceConfig, ...options }),
    patch: <T = any>(url: string, data: any, options?: RequestConfig) => patch<T>(url, data, { ...instanceConfig, ...options })
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