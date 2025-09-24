import React, { useState } from 'react';
import { UIFApplication, UIFHeader, UIFContent, UIFButton } from '@kaspersky/uif-react';
import SidebarMenu, { menuSections } from './SidebarMenu';
import Dashboard from './dashboard/Dashboard';

const MainLayout: React.FC = () => {
  const [activeMenuItem, setActiveMenuItem] = useState<string>('dashboard');

  return (
    <UIFApplication appCode="enterprise-app-optimization" locale="en-US" title="Enterprise App Optimization">
      <div className="app-shell">
        <aside className="app-shell__sidebar">
          <div className="app-shell__sidebar-header">
            <span className="app-shell__logo" aria-label="Enterprise App Optimization logo">
              EAO
            </span>
            <h1 className="app-shell__product">Enterprise App Optimization</h1>
            <p className="app-shell__subtitle">Unified interface framework quick-start</p>
          </div>
          <SidebarMenu activeId={activeMenuItem} onSelect={setActiveMenuItem} sections={menuSections} />
        </aside>

        <div className="app-shell__main">
          <header className="app-shell__header">
            <UIFHeader
              title="Enterprise optimization center"
              subtitle="Monitor posture, orchestrate response playbooks, and track automation coverage."
            />
            <div className="app-shell__header-actions">
              <UIFButton appearance="secondary">Export insights</UIFButton>
              <UIFButton appearance="primary">Launch automation</UIFButton>
            </div>
          </header>

          <UIFContent>
            <div className="app-shell__content">
              <Dashboard activeSection={activeMenuItem} />
            </div>
          </UIFContent>

          <footer className="app-shell__footer">
            <div>
              <p className="app-shell__footer-title">Need help accelerating adoption?</p>
              <p className="app-shell__footer-copy">
                Review the UIF documentation, explore integration blueprints, or reach out to the enterprise solutions
                team for guided onboarding.
              </p>
            </div>
            <div className="app-shell__footer-actions">
              <UIFButton appearance="ghost">View documentation</UIFButton>
              <UIFButton appearance="primary">Contact solutions team</UIFButton>
            </div>
          </footer>
        </div>
      </div>
    </UIFApplication>
  );
};

export default MainLayout;
