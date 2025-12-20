import { ToolConfig } from '@/agent/typs';
import { z } from 'zod';

export const getDateTimeTool: ToolConfig = {
  name: 'get_date_time',
  description: '获取当前日期和时间',
  schema: z.object({}),
  enabled: true,
  handler: async () => {
    const now = new Date();
    console.log('getDateTimeTool 结果:', now);
    return `当前时间: ${now.toLocaleString('zh-CN', {
      timeZone: 'Asia/Shanghai',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      weekday: 'long',
    })}`;
  },
};
