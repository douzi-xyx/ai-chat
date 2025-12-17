import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // 在 Tailwind v4 中，主题主要通过 CSS @theme 指令配置
  // 这里保留配置文件主要用于 content 路径配置
  // theme: {
  //   colors: {
  //     primary: '#7c3aed'
  //   }
  // }
};

export default config;
