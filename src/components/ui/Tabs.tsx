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
      <div className="border-b border-gray-200 mb-6 ">
        <nav
          className="flex w-full max-w-full overflow-hidden border-collapse"
          aria-label="Tabs"
        >
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
                  flex-1 px-1 sm:px-3 py-2.5 sm:py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors
  flex items-center justify-center gap-1.5 sm:gap-2 box-border
                  ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {tab.icon && (
                    <i className={`${tab.icon} text-xs sm:text-base`}></i>
                  )}
                  <span className="hidden min-[500px]:inline">{tab.label}</span>
                  <span className="min-[500px]:hidden">
                    {tab.label.includes('Finalizadas')
                      ? 'Vendas'
                      : tab.label.includes('Contactados')
                        ? 'Contato'
                        : tab.label.includes('Arquivados')
                          ? 'Arquivo'
                          : tab.label}
                  </span>
                  {tab.count !== undefined && (
                    <span
                      className={`
                      px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold
                      ${
                        isActive
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-gray-100 text-gray-600'
                      }
                    `}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>
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
