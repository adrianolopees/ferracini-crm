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
                  flex-1 px-2 sm:px-4 py-3 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {/* Ícone - maior em mobile */}
                {tab.icon && <i className={`${tab.icon} text-xl sm:text-base`}></i>}

                {/* Label - apenas desktop */}
                <span className="hidden sm:inline">{tab.label}</span>

                {/* Badge de contagem */}
                {tab.count !== undefined && (
                  <span
                    className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold
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
