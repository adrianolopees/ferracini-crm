import { ReactNode } from 'react';

interface Tab {
  id: string;
  label: string;
  count?: number;
  icon?: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: ReactNode;
}

function Tabs({ tabs, activeTab, onTabChange, children }: TabsProps) {
  return (
    <div className="w-full overflow-hidden">
      {/* Tab Headers */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6">
        <nav className="flex w-full -mb-px" aria-label="Tabs">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabChange(tab.id);
                }}
                className={`
                  flex-1 min-w-0 px-1 sm:px-2 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 cursor-pointer
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {/* Ícone - maior em mobile */}
                {tab.icon && <i className={`${tab.icon} text-base sm:text-base flex-shrink-0`}></i>}

                {/* Label - apenas desktop */}
                <span className="hidden sm:inline text-[11px] sm:text-xs truncate min-w-0 max-w-[90px]">{tab.label}</span>

                {/* Badge de contagem */}
                {tab.count !== undefined && (
                  <span
                    className={`
                      px-1 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 min-w-[20px] text-center
                      ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div>{children}</div>
    </div>
  );
}

export default Tabs;
