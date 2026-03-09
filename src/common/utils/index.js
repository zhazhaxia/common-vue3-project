/**
 * 公共工具函数库
 * 所有项目都可以通过 @common/utils 引用
 */

/**
 * 格式化日期
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的日期字符串
 */
export function formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
  const d = new Date(date)
  if (isNaN(d.getTime())) return 'Invalid Date'
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 深拷贝对象
 * @param {*} obj - 要拷贝的对象
 * @returns {*} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime())
  if (obj instanceof Array) return obj.map(item => deepClone(item))
  if (obj instanceof Object) {
    const clonedObj = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }
}

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300) {
  let timer = null
  return function(...args) {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let lastTime = 0
  return function(...args) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
export function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

/**
 * URL参数解析
 * @param {string} url - URL字符串
 * @returns {Object} 解析后的参数对象
 */
export function parseUrlParams(url) {
  const params = {}
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
 * @param {Object} obj - 参数对象
 * @returns {string} URL参数字符串
 */
export function objectToUrlParams(obj) {
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
   * @param {string} key - 键名
   * @param {*} value - 值
   * @param {number} expire - 过期时间（秒），可选
   */
  set(key, value, expire = null) {
    const data = {
      value,
      expire: expire ? Date.now() + expire * 1000 : null
    }
    localStorage.setItem(key, JSON.stringify(data))
  },
  
  /**
   * 获取本地存储
   * @param {string} key - 键名
   * @returns {*} 存储的值
   */
  get(key) {
    const item = localStorage.getItem(key)
    if (!item) return null
    
    try {
      const data = JSON.parse(item)
      if (data.expire && data.expire < Date.now()) {
        localStorage.removeItem(key)
        return null
      }
      return data.value
    } catch (e) {
      return item
    }
  },
  
  /**
   * 删除本地存储
   * @param {string} key - 键名
   */
  remove(key) {
    localStorage.removeItem(key)
  },
  
  /**
   * 清空本地存储
   */
  clear() {
    localStorage.clear()
  }
}

/**
 * 验证函数
 */
export const validators = {
  /**
   * 验证邮箱
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  isEmail(email) {
    const reg = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return reg.test(email)
  },
  
  /**
   * 验证手机号（中国大陆）
   * @param {string} phone - 手机号
   * @returns {boolean} 是否有效
   */
  isPhone(phone) {
    const reg = /^1[3-9]\d{9}$/
    return reg.test(phone)
  },
  
  /**
   * 验证身份证号（中国大陆）
   * @param {string} idCard - 身份证号
   * @returns {boolean} 是否有效
   */
  isIdCard(idCard) {
    const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return reg.test(idCard)
  },
  
  /**
   * 验证URL
   * @param {string} url - URL地址
   * @returns {boolean} 是否有效
   */
  isUrl(url) {
    const reg = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
    return reg.test(url)
  }
}

/**
 * 数字格式化
 * @param {number} num - 数字
 * @param {number} decimals - 小数位数，默认2
 * @returns {string} 格式化后的数字字符串
 */
export function formatNumber(num, decimals = 2) {
  return Number(num).toFixed(decimals)
}

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 * @returns {string} 格式化后的大小字符串
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 数组去重
 * @param {Array} arr - 数组
 * @returns {Array} 去重后的数组
 */
export function uniqueArray(arr) {
  return [...new Set(arr)]
}

/**
 * 数组分组
 * @param {Array} arr - 数组
 * @param {Function|string} key - 分组依据的函数或属性名
 * @returns {Object} 分组后的对象
 */
export function groupBy(arr, key) {
  return arr.reduce((result, item) => {
    const groupKey = typeof key === 'function' ? key(item) : item[key]
    if (!result[groupKey]) {
      result[groupKey] = []
    }
    result[groupKey].push(item)
    return result
  }, {})
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
