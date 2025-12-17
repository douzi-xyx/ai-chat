/* eslint-disable react-hooks/set-state-in-effect */
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

const ThemeSwitcher = () => {
  // 使用 useState 的初始化函数来检查是否在客户端
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    setMounted(true);
  }, [])

  // 如果还未挂载，显示占位符
  if (!mounted) {
    return (
      <div className="flex gap-2 items-center">
        <div className="px-4 py-2 rounded-lg font-medium text-sm bg-surface border border-border opacity-50" style={{ color: 'var(--color-text)' }}>
        中性色
        </div>
        <div className="px-4 py-2 rounded-lg font-medium text-sm bg-surface border border-border opacity-50" style={{ color: 'var(--color-text)' }}>
        靓蓝色
        </div>
        <div className="px-4 py-2 rounded-lg font-medium text-sm bg-surface border border-border opacity-50" style={{ color: 'var(--color-text)' }}>
        翡翠绿
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 items-center">
      {/* <button 
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          theme === 'normal' 
            ? 'bg-primary text-white shadow-md' 
            : 'br-no-active border border-bd hover:bg-primary/10'
        }`}
        style={theme !== 'normal' ? { color: 'var(--color-text)' } : {}}
        onClick={() => setTheme('normal')}
      >
        中性色
      </button> */}
      <button 
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          theme === 'blue' 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-no-active border border-bd hover:bg-primary/10'
        }`}
        style={theme !== 'blue' ? { color: 'var(--color-text)' } : {}}
        onClick={() => setTheme('blue')}
      >
        靓蓝色
      </button>
      <button 
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
          theme === 'purple' 
            ? 'bg-primary text-white shadow-md' 
            : 'bg-no-active border border-bd hover:bg-primary/10'
        }`}
          style={theme !== 'purple' ? { color: 'var(--color-text)' } : {}}
        onClick={() => setTheme('purple')}
      >
        紫罗兰
      </button>
    </div>
  )
}

export default ThemeSwitcher
