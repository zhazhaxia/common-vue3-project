/**
 * 公共工具函数库
 * 所有项目都可以通过 @common/utils 引用
 */

/**
 * 格式化日期
 * @param date - 日期对象、时间戳或日期字符串
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export    function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 深拷贝对象
 * @param obj - 要拷贝的对象
 * @returns 拷贝后的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (obj instanceof Object) {
    const clonedObj: Record<string, any> = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj as unknown as T
  }
  return obj
}

/**
 * 防抖函数
 * @param func - 要防抖的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number = 300): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null
  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param func - 要节流的函数
 * @param delay - 延迟时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(func: T, delay: number = 300): (...args: Parameters<T>) => void {
  let lastTime = 0
  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 生成UUID
 * @returns UUID字符串
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * URL参数解析
 * @param url - URL字符串
 * @returns 解析后的参数对象
 */
export function parseUrlParams(url: string): Record<string, string> {
  const params: Record<string, string> = {}
  const queryString = url.split('?')[1]
  if (!queryString) return params
  
  queryString.split('&').forEach(param => {
    const [key, value] = param.split('=')
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '')
    }
  })
  
  return params
}

/**
 * 对象转URL参数
 * @param obj - 参数对象
 * @returns URL参数字符串
 */
export function objectToUrlParams(obj: Record<string, any>): string {
  return Object.keys(obj)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

/**
 * 本地存储操作
 */
export const storage = {
  /**
   * 设置本地存储
   * @param key - 键名
   * @param value - 值
   * @param expire - 过期时间（秒），可选
   */
  set(key: string, value: any, expire: number | null = null): void {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null
    }
    localStorage.setItem(key, JSON.stringify(data))
  },
  
  /**
   * 获取本地存储
   * @param key - 键名
   * @returns 存储的值
   */
  get<T = any>(key: string): T | null | string {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    try {
      const data = JSON.parse(item)
      if (data.expire && data.expire < Date.now()) {
        localStorage.removeItem(key)
        return null
      }
      return data.value as T
    } catch (e) {
      return item
    }
  },
  
  /**
   * 删除本地存储
   * @param key - 键名
   */
  remove(key: string): void {
    localStorage.removeItem(key)
  },
  
  /**
   * 清空本地存储
   */
  clear(): void {
    localStorage.clear()
  }
}

/**
 * 验证函数
 */
export const validators = {
  /**
   * 验证邮箱
   * @param email - 邮箱地址
   * @returns 是否有效
   */
  isEmail(email: string): boolean {
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return reg.test(email)
  },
  
  /**
   * 验证手机号（中国大陆）
   * @param phone - 手机号
   * @returns 是否有效
   */
  isPhone(phone: string): boolean {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
  },
  
  /**
   * 验证身份证号（中国大陆）
   * @param idCard - 身份证号
   * @returns 是否有效
   */
  isIdCard(idCard: string): boolean {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return reg.test(idCard)
  },
  
  /**
   * 验证URL
   * @param url - URL地址
   * @returns 是否有效
   */
  isUrl(url: string): boolean {
    const reg = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    return reg.test(url)
  }
}

/**
 * 数字格式化
 * @param num - 数字
 * @param decimals - 小数位数，默认2
 * @returns 格式化后的数字字符串
 */
export function formatNumber(num: number | string, decimals: number = 2): string {
  return Number(num).toFixed(decimals)
}

/**
 * 文件大小格式化
 * @param bytes - 字节数
 * @returns 格式化后的大小字符串
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 数组去重
 * @param arr - 数组
 * @returns 去重后的数组
 */
export function uniqueArray<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

/**
 * 数组分组
 * @param arr - 数组
 * @param key - 分组依据的函数或属性名
 * @returns 分组后的对象
 */
export function groupBy<T>(arr: T[], key: string | ((item: T) => string | number)): Record<string | number, T[]> {
  return arr.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key as keyof T]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {} as Record<string | number, T[]>)
}

export default {
  formatDate,
  deepClone,
  debounce,
  throttle,
  generateUUID,
  parseUrlParams,
  objectToUrlParams,
  storage,
  validators,
  formatNumber,
  formatFileSize,
  uniqueArray,
  groupBy
}