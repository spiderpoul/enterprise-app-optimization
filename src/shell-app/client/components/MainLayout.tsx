import React, { Suspense, useMemo } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { UIFApplication, UIFHeader, UIFContent, UIFButton, Loader } from '@kaspersky/uif-react';
import SidebarMenu, { MenuSection } from './SidebarMenu';
import Dashboard from './dashboard/Dashboard';
import { useMicrofrontends } from '../microfrontends/useMicrofrontends';
import MicrofrontendBoundary from '../microfrontends/MicrofrontendBoundary';
import NotFound from '../pages/NotFound';

const coreMenuSections: MenuSection[] = [
  {
    id: 'core',
    title: 'Core experience',
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        description: 'Live optimization overview',
        status: 'active',
        path: '/dashboard',
      },
    ],
  },
];

const MainLayout: React.FC = () => {
  const { microfrontends, isLoading, error } = useMicrofrontends();

  const extensionSection = useMemo<MenuSection | null>(() => {
    if (microfrontends.length === 0) {
      return null;
    }

    return {
      id: 'extensions',
      title: 'Extensions',
      items: microfrontends.map((microfrontend) => ({
        id: microfrontend.id,
        title: microfrontend.menuLabel,
        description: microfrontend.description,
        path: microfrontend.routePath.startsWith('/')
          ? microfrontend.routePath
          : `/${microfrontend.routePath}`,
      })),
    };
  }, [microfrontends]);

  const menuSections = useMemo<MenuSection[]>(() => {
    if (!extensionSection) {
      return [...coreMenuSections];
    }

    return [...coreMenuSections, extensionSection];
  }, [extensionSection]);

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
          <SidebarMenu sections={menuSections} />
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
              {isLoading ? (
                <div className="microfrontend-loading" role="status">
                  <Loader size="m" label="Discovering registered microfrontends…" />
                </div>
              ) : null}

              {error ? (
                <div className="microfrontend-error" role="alert">
                  <h2>Microfrontend registry unreachable</h2>
                  <p>{error}</p>
                </div>
              ) : null}

              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                {microfrontends.map((microfrontend) => (
                  <Route
                    key={microfrontend.id}
                    path={microfrontend.routePath.startsWith('/') ? microfrontend.routePath : `/${microfrontend.routePath}`}
                    element={
                      <Suspense
                        fallback={
                          <div className="microfrontend-loading" role="status">
                            <Loader size="m" label={`Loading ${microfrontend.name}…`} />
                          </div>
                        }
                      >
                        <MicrofrontendBoundary name={microfrontend.name}>
                          <microfrontend.Component />
                        </MicrofrontendBoundary>
                      </Suspense>
                    }
                  />
                ))}
                <Route path="*" element={<NotFound />} />
              </Routes>
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
