import type { ReactNode } from "react";

type Area = "Library" | "Practice" | "History";

type AppShellProps = {
  children: ReactNode;
  activeArea: Area;
  onAreaChange: (area: Area) => void;
};

const navItems: Array<{ label: Area; icon: string; title: string }> = [
  { label: "Library", icon: "◈", title: "Problem library" },
  { label: "Practice", icon: "✎", title: "Practice workspace" },
  { label: "History", icon: "◴", title: "Attempt history" }
];

export function AppShell({ children, activeArea, onAreaChange }: AppShellProps) {
  return (
    <div className="min-h-screen bg-page">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          {/* Logo */}
          <button
            onClick={() => onAreaChange("Library")}
            className="flex items-center gap-2.5 text-left group"
            aria-label="Go to problem library"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-lg font-black text-white shadow-sm transition group-hover:shadow-indigo-200 group-hover:shadow-md">
              D
            </span>
            <span>
              <span className="block text-[15px] font-bold tracking-tight text-slate-900">DesignGym</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">LLD practice</span>
            </span>
          </button>

          {/* Nav */}
          <nav className="hidden items-center rounded-xl bg-slate-100 p-1 sm:flex" aria-label="Primary navigation">
            {navItems.map((item) => {
              const isActive = item.label === activeArea;
              return (
                <button
                  key={item.label}
                  onClick={() => onAreaChange(item.label)}
                  title={item.title}
                  className={`rounded-lg px-3.5 py-2 text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  <span className="mr-1.5 text-base opacity-80">{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* User avatar */}
          <div className="flex items-center gap-2.5">
            <span className="hidden text-right sm:block">
              <span className="block text-xs font-semibold text-slate-700">Alex Learner</span>
              <span className="block text-[10px] text-slate-400">Growing designer</span>
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400 text-sm font-bold text-white shadow-sm">
              AL
            </span>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="flex items-center border-t border-slate-100 sm:hidden">
          {navItems.map((item) => {
            const isActive = item.label === activeArea;
            return (
              <button
                key={item.label}
                onClick={() => onAreaChange(item.label)}
                className={`flex-1 py-2.5 text-xs font-semibold transition ${
                  isActive ? "text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500"
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {children}
    </div>
  );
}
