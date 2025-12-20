import { useState } from 'react';
import styles from '@/styles/index.module.css';
import { Tool } from '@/types';
import ToolSelect from './ToolSelect';
import ModelSelect from './ModelSelect';

export default function UserInput({
  model,
  setModel,
  inputValue,
  setInputValue,
  handleKeyPress,
  handleSendMessage,
  list,
  toolList,
}: {
  model: string;
  setModel: (value: string) => void;
  inputValue?: string;
  setInputValue: (value: string) => void;
  handleKeyPress: (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    model: string,
    selectedTools: string[]
  ) => void;
  handleSendMessage: (model: string, selectedTools: string[]) => void;
  list: { name: string; value: string }[];
  toolList: Tool[];
}) {
  const [selectedTools, setSelectedTools] = useState<string[]>([]);

  return (
    <div className="p-4 pt-0">
      <div className="max-w-4xl mx-auto">
        {/* 输入框容器 - 带动画边框 */}
        <div className="relative">
          {/* 动画边框效果 */}
          <div
            className={`absolute ${styles['message-content-area-border-aimation']} border-bd/30`}
          >
            <div
              className={`w-[100px] h-[100px] absolute bg-gradient-to-l from-primary-5 via-primary-4 to-primary-2 ${styles['animation-rect-line-block']}`}
            ></div>
          </div>

          {/* 美观的输入框外观 */}
          <div className="relative bg-surface/80 backdrop-blur-md rounded-2xl border border-bd/30 shadow-lg hover:shadow-xl transition-all duration-300 focus-within:border-primary-4/50 focus-within:shadow-primary-3/20">
            {/* 顶部渐变装饰线 */}
            <div className="absolute top-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-primary-4/30 to-transparent rounded-full" />

            {/* 输入区域 */}
            <div className="p-4">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, model, selectedTools)}
                placeholder="输入消息... (按 Enter 发送，Shift+Enter 换行)"
                className="w-full bg-transparent border-none outline-none resize-none text-text placeholder-text/40 text-sm leading-relaxed"
                rows={3}
              />
            </div>

            {/* 底部操作栏 */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-bd/20">
              {/* 左侧提示 */}
              <div className="flex items-center gap-2 text-xs text-text/50">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Enter 发送 · Shift+Enter 换行</span>
                {/* 工具选择组件 */}
                <ToolSelect
                  toolList={toolList}
                  selectedTools={selectedTools}
                  onSelectedToolsChange={setSelectedTools}
                />
              </div>
              <div className="flex items-center gap-2 justify-end">
                {/* 下拉组件选择模型 */}
                <ModelSelect list={list} model={model} setModel={setModel} />

                {/* 发送按钮 */}
                <button
                  onClick={() => handleSendMessage(model, selectedTools)}
                  disabled={!inputValue?.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-4 to-primary-5 hover:from-primary-5 hover:to-primary-5 disabled:from-bd disabled:to-bd disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  <span>发送</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
