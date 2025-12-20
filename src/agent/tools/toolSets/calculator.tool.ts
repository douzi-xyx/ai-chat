import { z } from 'zod';
import { ToolConfig } from '@/agent/typs';

type CalculatorParams = {
  expression: string;
};
export const calculatorTool: ToolConfig<CalculatorParams> = {
  name: 'calculator',
  description: '用于数学表达式',
  schema: z.object({
    expression: z.string().describe('数学表达式'),
  }),
  enabled: true,
  handler: async (params?: CalculatorParams) => {
    const expression = params?.expression;
    if (!expression) {
      return '请提供一个数学表达式';
    }
    try {
      const result = eval(expression);
      return result.toString();
    } catch (error) {
      return `计算表达式${expression}时出错: ${error}`;
    }
  },
};
