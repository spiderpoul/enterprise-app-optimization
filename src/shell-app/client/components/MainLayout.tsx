import React, { Suspense, useCallback, useMemo, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import {
  Alert,
  Button,
  H2,
  H4,
  Loader,
  Menu,
  Nav,
  P,
  ServicesNav,
  Space,
  Text,
  UserNav,
  type NavItemData,
  Hamburger,
} from '@kaspersky/hexa-ui';
import { AppUpdate, Grid, Settings2, UserAccount } from '@kaspersky/hexa-ui-icons/16';
import Dashboard from './dashboard/Dashboard';
import { useMicrofrontends } from '../microfrontends/useMicrofrontends';
import MicrofrontendBoundary from '../microfrontends/MicrofrontendBoundary';
import NotFound from '../pages/NotFound';
import { useAuth } from '../auth/AuthContext';
import { useShellInitialization } from '../hooks/useShellInitialization';

interface ShellMenuItem {
  id: string;
  title: string;
  path: string;
}

interface ShellMenuSection {
  id: string;
  title: string;
  icon: React.ComponentType;
  items: ShellMenuItem[];
}

const baseMenuSections: ShellMenuSection[] = [
  {
    id: 'core',
    title: 'Core experience',
    icon: Grid,
    items: [
      {
        id: 'dashboard',
        title: 'Dashboard',
        path: '/dashboard',
      },
    ],
  },
];

const surfaceStyles = css`
  backdrop-filter: blur(8px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(244, 247, 255, 0.88) 100%);
`;

const LayoutGrid = styled.div<{ menuWidth: number }>`
  min-height: 100vh;
  display: grid;
  grid-template-columns: ${({ menuWidth }) => `${menuWidth}px 1fr`};
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'sidebar header'
    'sidebar main'
    'sidebar footer';
  background: linear-gradient(135deg, #f5f7ff 0%, #e8eeff 100%);
`;

const SidebarContainer = styled.div`
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 6px 0 24px -20px rgba(15, 23, 42, 0.45);
`;

const ShellMenu = styled(Menu)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
`;

const Branding = styled(Space)<{ minimized: boolean }>`
  padding: ${({ minimized }) => (minimized ? '20px 12px' : '24px 20px')};
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  transition: padding 0.2s ease;
`;

const BrandingLogo = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  color: #ffffff;
  font-weight: 700;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BrandingText = styled(Space)`
  align-items: flex-start;
  gap: 4px;
`;

const HeaderBar = styled(Space)`
  grid-area: header;
  padding: 32px 40px 24px;
  gap: 24px;
  align-items: flex-start;
  ${surfaceStyles};
`;

const HeaderTitles = styled(Space)`
  max-width: 640px;
  gap: 8px;
`;

const HeaderActions = styled(Space)`
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
`;

const UserChip = styled(Space)`
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  padding: 8px 16px;
  gap: 12px;
  align-items: center;
`;

const ContentArea = styled.div`
  grid-area: main;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 40px 40px;
  ${surfaceStyles};
`;

const LoaderContainer = styled.div`
  margin-bottom: 24px;
`;

const AlertContainer = styled.div`
  margin-bottom: 24px;
`;

const FooterBar = styled(Space)`
  grid-area: footer;
  padding: 24px 40px 32px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  ${surfaceStyles};
`;

const FooterActions = styled(Space)`
  gap: 12px;
`;

const InitializationContainer = styled(Space)`
  height: 100vh;
  width: 100%;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 60%), #f5f7ff;
  align-items: center;
  justify-content: center;
`;

const InitializationPanel = styled.div`
  background: #ffffff;
  border-radius: 20px;
  padding: 32px;
  box-shadow: 0 40px 80px -40px rgba(15, 23, 42, 0.35);
  max-width: 520px;
  width: 100%;
`;

const InitializationSteps = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 8px;
`;

const InitializationStep = styled.li<{ status: 'complete' | 'active' | 'pending' }>`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ status }) =>
    status === 'complete' ? '#14532d' : status === 'active' ? '#1d4ed8' : '#475467'};
  font-weight: ${({ status }) => (status === 'pending' ? 500 : 600)};
  opacity: ${({ status }) => (status === 'pending' ? 0.72 : 1)};
`;

const StepBullet = styled.span<{ status: 'complete' | 'active' | 'pending' }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: ${({ status }) =>
    status === 'complete' ? '#16a34a' : status === 'active' ? '#2563eb' : '#cbd5f5'};
  box-shadow: ${({ status }) =>
    status === 'active' ? '0 0 0 4px rgba(37, 99, 235, 0.2)' : 'none'};
`;

const MainLayout: React.FC = () => {
  const { microfrontends, isLoading, error } = useMicrofrontends();
  const { user, logout } = useAuth();
  const { isInitializing, currentStep, completedSteps, steps, progress } = useShellInitialization();
  const [menuMinimized, setMenuMinimized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const extensionSection = useMemo<ShellMenuSection | null>(() => {
    if (microfrontends.length === 0) {
      return null;
    }

    return {
      id: 'extensions',
      title: 'Extensions',
      icon: AppUpdate,
      items: microfrontends.map((microfrontend) => ({
        id: microfrontend.id,
        title: microfrontend.menuLabel,
        path: microfrontend.routePath.startsWith('/')
          ? microfrontend.routePath
          : `/${microfrontend.routePath}`,
      })),
    };
  }, [microfrontends]);

  const sections = useMemo<ShellMenuSection[]>(() => {
    const baseSections = baseMenuSections.map((section) => ({
      ...section,
      items: [...section.items],
    }));

    if (extensionSection) {
      baseSections.push(extensionSection);
    }

    return baseSections;
  }, [extensionSection]);

  const matchRoute = useCallback(
    (targetPath: string) => {
      const normalized = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
      return location.pathname === normalized || location.pathname.startsWith(`${normalized}/`);
    },
    [location.pathname],
  );

  const handleNavigate = useCallback(
    (targetPath: string) => {
      const normalized = targetPath.startsWith('/') ? targetPath : `/${targetPath}`;
      if (location.pathname !== normalized) {
        void navigate(normalized);
      }
    },
    [location.pathname, navigate],
  );

  const navItems = useMemo<NavItemData[]>(
    () =>
      sections.map((section) => {
        const SectionIcon = section.icon;
        const sectionActive = section.items.some((item) => matchRoute(item.path));

        return {
          state: section.id,
          key: section.title,
          icon: SectionIcon,
          isRoot: true,
          expanded: sectionActive,
          items: section.items.map((item) => ({
            state: item.path,
            key: item.title,
            onClick: () => handleNavigate(item.path),
            active: matchRoute(item.path),
          })),
        } satisfies NavItemData;
      }),
    [handleNavigate, matchRoute, sections],
  );

  const userNavItems = useMemo<NavItemData[]>(() => {
    const displayName = user?.displayName ?? 'Enterprise guest';

    return [
      {
        mode: 'user',
        state: 'user-profile',
        key: displayName,
        icon: UserAccount,
        isRoot: true,
        userProps: {
          name: displayName,
          role: user ? 'Workspace administrator' : 'Guest session',
          status: 'available',
        },
        items: [
          {
            key: 'Profile preferences',
            onClick: () => handleNavigate('/dashboard'),
          },
          {
            key: 'Sign out',
            onClick: logout,
          },
        ],
      },
      {
        state: 'settings',
        key: 'Settings',
        icon: Settings2,
        isRoot: true,
        items: [
          {
            key: 'Automation catalog',
            onClick: () => handleNavigate('/dashboard'),
          },
        ],
      },
    ];
  }, [handleNavigate, logout, user]);

  if (isInitializing) {
    return (
      <InitializationContainer direction="vertical" size={32}>
        <InitializationPanel>
          <Space direction="vertical" gap={16} align="stretch">
            <H2>Preparing your workspace</H2>
            <Text style={{ color: '#475467' }}>
              The shell intentionally performs several staged requests to showcase asynchronous
              service initialisation and delay the UI start-up sequence.
            </Text>
            <Loader size="large" centered tip={currentStep?.label ?? 'Preparing workspace…'} />
            <Text style={{ color: '#475467' }}>{Math.round(progress * 100)}% complete</Text>
            <InitializationSteps>
              {steps.map((step) => {
                const status: 'complete' | 'active' | 'pending' = completedSteps.includes(step.id)
                  ? 'complete'
                  : currentStep?.id === step.id
                    ? 'active'
                    : 'pending';

                return (
                  <InitializationStep key={step.id} status={status}>
                    <StepBullet status={status} />
                    <span>{step.label}</span>
                  </InitializationStep>
                );
              })}
            </InitializationSteps>
          </Space>
        </InitializationPanel>
      </InitializationContainer>
    );
  }

  const activeMenuWidth = menuMinimized ? 72 : 292;

  return (
    <LayoutGrid menuWidth={activeMenuWidth}>
      <SidebarContainer>
        <ShellMenu
          applyAppTheme
          theme="light"
          width={292}
          collapsedWidth={72}
          collapsible
          collapsed={menuMinimized}
        >
          <ServicesNav>
            <Hamburger
              className="item left"
              role="button"
              name="hamburger"
              onClick={() => setMenuMinimized((value) => !value)}
            />
          </ServicesNav>
          <Branding minimized={menuMinimized} direction="horizontal" gap={12}>
            <BrandingLogo aria-label="Enterprise App Optimization logo">EAO</BrandingLogo>
            {!menuMinimized ? (
              <BrandingText direction="vertical">
                <Text>Enterprise App Optimization</Text>
                <Text style={{ color: '#475467' }}>Automation command centre</Text>
              </BrandingText>
            ) : null}
          </Branding>
          <Nav navItems={navItems} minimized={menuMinimized} favsEnabled={false} />
          <UserNav navItems={userNavItems} minimized={menuMinimized} childPop />
        </ShellMenu>
      </SidebarContainer>

      <HeaderBar direction="horizontal" justify="space-between">
        <HeaderTitles direction="vertical" align="flex-start">
          <H2>Enterprise optimisation centre</H2>
          <Text style={{ color: '#475467' }}>
            Monitor posture, orchestrate response playbooks, and track automation coverage from a
            unified shell.
          </Text>
        </HeaderTitles>
        <HeaderActions direction="horizontal" align="flex-start">
          <UserChip direction="horizontal">
            <Text>{user?.displayName ?? 'Enterprise guest'}</Text>
            <Button mode="tertiary" onClick={logout} text="Sign out" />
          </UserChip>
          <Button mode="secondary" text="Export insights" />
          <Button mode="primary" text="Launch automation" />
        </HeaderActions>
      </HeaderBar>

      <ContentArea>
        {isLoading ? (
          <LoaderContainer role="status">
            <Loader centered size="large" tip="Discovering registered microfrontends…" />
          </LoaderContainer>
        ) : null}

        {error ? (
          <AlertContainer>
            <Alert mode="error">
              <Space direction="vertical" gap={4} align="flex-start">
                <H4>Microfrontend registry unreachable</H4>
                <Text>{error}</Text>
              </Space>
            </Alert>
          </AlertContainer>
        ) : null}

        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {microfrontends.map((microfrontend) => (
            <Route
              key={microfrontend.id}
              path={
                microfrontend.routePath.startsWith('/')
                  ? microfrontend.routePath
                  : `/${microfrontend.routePath}`
              }
              element={
                <Suspense
                  fallback={
                    <LoaderContainer role="status">
                      <Loader centered size="large" tip={`Loading ${microfrontend.name}…`} />
                    </LoaderContainer>
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
      </ContentArea>

      <FooterBar direction="horizontal" align="flex-start">
        <Space direction="vertical" align="flex-start" gap={8}>
          <Text as="span" style={{ fontWeight: 600 }}>
            Need help accelerating adoption?
          </Text>
          <P style={{ color: '#475467' }}>
            Review design system documentation, explore integration blueprints, or reach out to the
            enterprise solutions team for guided onboarding.
          </P>
        </Space>
        <FooterActions direction="horizontal">
          <Button mode="tertiary" text="View documentation" />
          <Button mode="primary" text="Contact solutions team" />
        </FooterActions>
      </FooterBar>
    </LayoutGrid>
  );
};

export default MainLayout;
