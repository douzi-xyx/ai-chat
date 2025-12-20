import { useEffect, useRef, useState } from 'react';

interface ModelSelectProps {
  list: { name: string; value: string }[];
  model: string;
  setModel: (value: string) => void;
}

export default function ModelSelect({ list, model, setModel }: ModelSelectProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (open && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex justify-end" ref={dropdownRef}>
        <div
          className="min-w-[140px] px-1 py-1 text-sm text-text flex items-center cursor-pointer hover:text-primary-5 justify-end gap-[8px]"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="truncate">{list.find((i) => i.value === model)?.name}</span>
          <svg
            className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
        {open && (
          <div className="absolute bottom-[110%] right-0 w-[200px] rounded-lg border border-bd/30 bg-surface/95 shadow-xl backdrop-blur-md z-10">
            <ul className="py-1 text-sm text-text">
              {list.map((item) => (
                <li
                  key={item.value}
                  className={`px-3 py-2 cursor-pointer flex justify-between items-center hover:bg-primary-3/20 ${
                    model === item.value ? 'text-primary-5 font-medium' : ''
                  }`}
                  onClick={() => {
                    setModel(item.value);
                    setOpen(false);
                  }}
                >
                  <span>{item.name}</span>
                  {model === item.value && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
