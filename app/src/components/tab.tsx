import { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  defaultActiveTab?: string;
  onTabChange?: (tabId: string) => void;
  className?: string;
}

export default function Tabs({ items, defaultActiveTab, onTabChange, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab || items[0]?.id || '');

  const handleTabClick = (tabId: string) => {
    if (items.find((item) => item.id === tabId)?.disabled) return;

    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const activeTabContent = items.find((item) => item.id === activeTab)?.content;

  return (
    <div className={`w-full ${className}`}>
      {/* Tab Navigation */}
      <div className="border-b border-muted">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {items.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              disabled={tab.disabled}
              className={`
                whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-surface-secondary hover:text-surface-primary hover:border-muted'
                }
                ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">{activeTabContent}</div>
    </div>
  );
}
