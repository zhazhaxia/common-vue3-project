import { describe, it, expect } from 'vitest';
import { formatDate } from '../../common/utils/index';

describe('formatDate 函数测试', () => {
  // 测试默认格式
  it('应该使用默认格式格式化日期', () => {
    const date = new Date('2024-01-01T12:34:56');
    const result = formatDate(date);
    expect(result).toBe('2024-01-01 12:34:56');
  });

  // 测试自定义格式
  it('应该使用自定义格式格式化日期', () => {
    const date = new Date('2024-02-15T09:15:30');
    const result = formatDate(date, 'YYYY/MM/DD');
    expect(result).toBe('2024/02/15');
  });

  // 测试时间格式
  it('应该正确格式化时间部分', () => {
    const date = new Date('2024-03-20T18:45:12');
    const result = formatDate(date, 'HH:mm:ss');
    expect(result).toBe('18:45:12');
  });

  // 测试完整自定义格式
  it('应该正确处理完整的自定义格式', () => {
    const date = new Date('2024-04-10T08:30:45');
    const result = formatDate(date, 'MM-DD-YYYY HH:mm');
    expect(result).toBe('04-10-2024 08:30');
  });

  // 测试字符串类型的日期
  it('应该处理字符串类型的日期', () => {
    const dateStr = '2024-05-05T12:00:00';
    const result = formatDate(dateStr);
    expect(result).toBe('2024-05-05 12:00:00');
  });

  // 测试时间戳类型的日期
  it('应该处理时间戳类型的日期', () => {
    const timestamp = new Date('2024-06-15T14:20:30').getTime();
    const result = formatDate(timestamp);
    expect(result).toBe('2024-06-15 14:20:30');
  });

  // 测试无效日期
  it('应该处理无效日期', () => {
    const invalidDate = 'invalid-date';
    const result = formatDate(invalidDate);
    expect(result).toBe('Invalid Date');
  });

  // 测试月份和日期的补零
  it('应该为单个数字的月份和日期补零', () => {
    const date = new Date('2024-01-05T09:05:08');
    const result = formatDate(date, 'YYYY/MM/DD HH:mm:ss');
    expect(result).toBe('2024/01/05 09:05:08');
  });
});
