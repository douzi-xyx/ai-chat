import ThemeSwitcher from './ThemeSwitcher';

export default function Header({}) {
  return (
    <div className="flex flex-row justify-between pl-[20px] pr-[20px] mx-auto">
      <div className="flex items-center gap-4 w-[255px]">
        <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-3 to-primary-4 text-white font-medium text-sm">
          AI Chat / LangGraph
        </span>
      </div>
      <div className="flex flex-1 justify-between">
        <div></div>
        <ThemeSwitcher />
      </div>
    </div>
  );
}
