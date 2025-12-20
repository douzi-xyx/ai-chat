import { useEffect, useState } from 'react';

const list = [
  {
    name: 'qwen3-next-80b-a3b-instruct',
    value: 'qwen:qwen3-next-80b-a3b-instruct',
  },
  {
    name: 'qwen3-max',
    value: 'qwen:qwen3-max',
  },
  {
    name: 'qwen-image-plus',
    value: 'qwen:qwen-image-plus',
  },
  {
    name: 'gemini-3-pro-preview',
    value: 'google:gemini-3-pro-preview',
  },
  {
    name: 'gemini-3-pro-preview',
    value: 'google:gemini-3-pro-preview',
  },
];

export default function useSelectModel() {
  const [model, setModel] = useState(list[0]?.value);

  return {
    list,
    model,
    setModel,
  };
}
