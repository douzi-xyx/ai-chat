import { useRef } from 'react';

interface ImageUploadProps {
  onImageSelect?: (files: File[]) => void;
  maxSize?: number; // 最大文件大小（MB）
  accept?: string; // 接受的文件类型
}

export default function ImageUpload({
  onImageSelect,
  maxSize = 10,
  accept = 'image/*',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // 过滤超过大小限制的文件
    const validFiles = files.filter((file) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxSize) {
        // console.warn(`文件 ${file.name} 超过 ${maxSize}MB 限制`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onImageSelect?.(validFiles);
    }

    // 清空 input，允许重复选择同一文件
    e.target.value = '';
  };

  return (
    <>
      {/* 上传按钮 */}
      <button
        type="button"
        onClick={handleClick}
        className="flex items-center gap-1 px-2 py-1 text-text/60 hover:text-primary-4 hover:bg-primary-4/10 rounded-lg transition-all duration-200"
        title="上传图片"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-xs">图片</span>
      </button>

      {/* 隐藏的文件输入 */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
