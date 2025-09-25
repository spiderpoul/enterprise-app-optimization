import React from 'react';
import { NavLink } from 'react-router-dom';

export interface MenuItem {
  id: string;
  title: string;
  path: string;
  description?: string;
  badge?: string;
  status?: 'active' | 'alert' | 'success';
}

export interface MenuSection {
  id: string;
  title: string;
  items: MenuItem[];
}

interface SidebarMenuProps {
  sections: MenuSection[];
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ sections }) => (
  <nav className="sidebar-menu" aria-label="Main navigation">
    {sections.map((section) => (
      <div key={section.id} className="sidebar-menu__section">
        <p className="sidebar-menu__title">{section.title}</p>
        <ul className="sidebar-menu__list">
          {section.items.map((item) => (
            <li key={item.id} className="sidebar-menu__item">
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `sidebar-menu__button${isActive ? ' sidebar-menu__button--active' : ''}`
                }
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
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </nav>
);

export default SidebarMenu;
