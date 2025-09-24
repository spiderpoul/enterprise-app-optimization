import React from 'react';

export interface MenuItem {
  id: string;
  title: string;
  description?: string;
  badge?: string;
  status?: 'active' | 'alert' | 'success';
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

export const menuSections: MenuSection[] = [
  {
    id: 'monitoring',
    title: 'Monitoring',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Live optimization overview',
        status: 'active',
      },
      {
        id: 'incidents',
        title: 'Incidents',
        description: 'Threats awaiting triage',
        badge: '12',
        status: 'alert',
      },
      {
        id: 'performance',
        title: 'Performance',
        description: 'Resource utilization insights',
      },
    ],
  },
  {
    id: 'management',
    title: 'Management',
    items: [
      {
        id: 'policies',
        title: 'Policies',
        description: 'Security and compliance configuration',
      },
      {
        id: 'automation',
        title: 'Automation',
        description: 'Playbooks and scheduled tasks',
        badge: '4',
      },
      {
        id: 'integrations',
        title: 'Integrations',
        description: 'Connectors and data sources',
      },
    ],
  },
  {
    id: 'administration',
    title: 'Administration',
    items: [
      {
        id: 'settings',
        title: 'Settings',
        description: 'Global environment controls',
      },
      {
        id: 'support',
        title: 'Support Center',
        description: 'Guides and escalation paths',
        status: 'success',
      },
      {
        id: 'audit',
        title: 'Audit log',
        description: 'System events and user actions',
      },
    ],
  },
];

interface SidebarMenuProps {
  activeId: string;
  onSelect: (id: string) => void;
  sections?: MenuSection[];
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ activeId, onSelect, sections = menuSections }) => (
  <nav className="sidebar-menu" aria-label="Main navigation">
    {sections.map((section) => (
      <div key={section.id} className="sidebar-menu__section">
        <p className="sidebar-menu__title">{section.title}</p>
        <ul className="sidebar-menu__list">
          {section.items.map((item) => {
            const isActive = item.id === activeId;

            return (
              <li key={item.id} className="sidebar-menu__item">
                <button
                  type="button"
                  className={`sidebar-menu__button${isActive ? ' sidebar-menu__button--active' : ''}`}
                  onClick={() => onSelect(item.id)}
                >
                  <span className="sidebar-menu__button-main">
                    <span className="sidebar-menu__button-title">{item.title}</span>
                    {item.badge ? <span className="sidebar-menu__badge">{item.badge}</span> : null}
                  </span>
                  {item.description ? (
                    <span className="sidebar-menu__description">{item.description}</span>
                  ) : null}
                  {item.status ? (
                    <span className={`sidebar-menu__status sidebar-menu__status--${item.status}`}>
                      {item.status === 'alert' && 'Requires attention'}
                      {item.status === 'active' && 'In progress'}
                      {item.status === 'success' && 'Healthy'}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    ))}
  </nav>
);

export default SidebarMenu;
