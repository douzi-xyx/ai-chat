import { ToolConfig } from '@/agent/typs';
import { z } from 'zod';

type WeatherParams = {
  city: string;
};

const callHistory = new Map<string, number[]>();

export const weatherTool: ToolConfig<WeatherParams> = {
  name: 'weather',
  description: '查询指定城市的天气',
  enabled: true,
  schema: z.object({
    city: z.string().describe('要查询天气的城市名称'),
  }),
  handler: async (params?: WeatherParams) => {
    if (!params?.city) return '请提供一个城市名称';

    const historyCacheKey = `weather-${params.city}}`;
    const now = Date.now();
    const history = callHistory.get(historyCacheKey) || [];
    // console.log('weather---history', history);
    // 找出调用时间小于10分钟的
    const recent = history.filter((time) => now - time < 1000 * 60 * 10);
    // console.log('weather---recent', recent);
    if (recent.length >= 3) {
      return '查询过于频繁，请稍后再试';
    }

    recent.push(now);
    callHistory.set(historyCacheKey, recent);

    try {
      const key = process.env.GOOGLE_MAP_API_KEY;
      const city = params.city;
      const colaKey = process.env.ColaKey;
      //   console.log('weather---key', { key, colaKey, city });
      const cityCodeRes = await fetch(
        `https://luckycola.com.cn/weather/geo?colaKey=${colaKey}&address=${city}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );
      const cityCodeData = await cityCodeRes.json();
      //   console.log('weather---cityCodeData', cityCodeData);
      const cityCode = cityCodeData?.data?.geocodes?.[0]?.adcode;
      //   console.log('weather---cityCode', cityCode);
      const response = await fetch(
        `https://restapi.amap.com/v3/weather/weatherInfo?city=${cityCode}&key=${key}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store',
        }
      );
      const data = await response.json();
      //   console.log('weather---data', data);
      const weather = data?.lives?.[0] || {};

      console.log(
        'weather---result',
        `城市: ${city}\n
            当前天气: ${weather.weather}\n
            气温: ${weather.temperature}℃\n
            风向: ${weather.winddirection}\n
            风力: ${weather.windpower}\n
            更新日期: ${weather.reporttime}`
      );
      return `城市: ${city}\n
            当前天气: ${weather.weather}\n
            气温: ${weather.temperature}℃\n
            风向: ${weather.winddirection}\n
            风力: ${weather.windpower}\n
            更新日期: ${weather.reporttime}`;
    } catch (error) {
      return `查询天气失败`;
    }
  },
};
