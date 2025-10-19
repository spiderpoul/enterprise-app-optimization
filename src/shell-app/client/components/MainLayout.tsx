import React, { useCallback, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate, useRoutes } from 'react-router-dom';
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
import {
  ActivityMonitor,
  AppUpdate,
  Grid,
  Settings2,
  UserAccount,
} from '@kaspersky/hexa-ui-icons/16';
import Dashboard from './dashboard/Dashboard';
import { useMicrofrontends } from '../microfrontends/useMicrofrontends';
import NotFound from '../pages/NotFound';
import { useShellInitialization } from '../hooks/useShellInitialization';
import WizardQuickSetupPage from '../pages/workshop/react-perf/WizardQuickSetupPage';
import DeviceSecurityPage from '../pages/DeviceSecurityPage';

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
      {
        id: 'device-security',
        title: 'Device security',
        path: '/device-security',
      },
    ],
  },
  {
    id: 'react-perf',
    title: 'React Perf',
    icon: ActivityMonitor,
    items: [
      {
        id: 'react-perf-wizard',
        title: 'Wizard Quick Setup',
        path: '/workshop/react-perf/wizard',
      },
    ],
  },
];

const surfaceStyles = css`
  backdrop-filter: blur(8px);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(244, 247, 255, 0.88) 100%);
`;

const LayoutGrid = styled.div<{ menuWidth: number; collapsed: boolean }>`
  height: 100vh;
  min-height: 100vh;
  display: grid;
  grid-template-columns: ${({ menuWidth }) => `${menuWidth}px 1fr`};
  grid-template-areas: 'sidebar main';
  background: linear-gradient(135deg, #f5f7ff 0%, #e8eeff 100%);
  overflow: hidden;

  @media (max-width: 720px) {
    grid-template-columns: ${({ collapsed }) => (collapsed ? '0 1fr' : 'minmax(260px, 78vw) 1fr')};
    grid-template-areas: 'main';
    height: auto;
    min-height: 100vh;
    position: relative;
    overflow: visible;
  }
`;

const SidebarContainer = styled.div<{ collapsed: boolean }>`
  grid-area: sidebar;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  box-shadow: 6px 0 24px -20px rgba(15, 23, 42, 0.45);
  position: sticky;
  top: 0;
  height: 100vh;
  min-height: 0;
  overflow: hidden;
  background: #ffffff;
  transition: transform 0.3s ease;

  @media (max-width: 720px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: min(320px, 78vw);
    max-width: 320px;
    transform: ${({ collapsed }) => (collapsed ? 'translateX(-100%)' : 'translateX(0)')};
    box-shadow: 24px 0 48px -24px rgba(15, 23, 42, 0.35);
    border-right: 1px solid rgba(15, 23, 42, 0.08);
    z-index: 3;
  }
`;

const MainColumn = styled.div`
  grid-area: main;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  position: relative;
  z-index: 1;

  @media (max-width: 720px) {
    min-height: 100vh;
    overflow: visible;
  }
`;

const ScrollContainer = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: 720px) {
    overflow-y: visible;
  }
`;

const ShellMenu = styled(Menu)`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: transparent;
  height: 100%;
  min-height: 0;
  overflow-y: auto;
`;

const Branding = styled(Space)<{ minimized: boolean }>`
  padding: ${({ minimized }) => (minimized ? '20px 12px' : '24px 20px')};
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  transition: padding 0.2s ease;

  @media (max-width: 720px) {
    padding: ${({ minimized }) => (minimized ? '16px 16px' : '20px 20px 16px')};
  }
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
  padding: 32px 40px 24px;
  gap: 24px;
  align-items: flex-start;
  ${surfaceStyles};

  @media (max-width: 720px) {
    padding: 24px 20px;
    gap: 20px;
    align-items: stretch;
    flex-direction: column;
  }
`;

const HeaderTitles = styled(Space)`
  max-width: 640px;
  gap: 8px;

  @media (max-width: 720px) {
    gap: 12px;
  }
`;

const HeaderActions = styled(Space)`
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 720px) {
    justify-content: flex-start;
    width: 100%;
  }
`;

const DesktopHeading = styled(H2)`
  margin: 0;

  @media (max-width: 720px) {
    display: none;
  }
`;

const MobileHeading = styled(H2)`
  margin: 0;

  @media (min-width: 721px) {
    display: none;
  }
`;

const HeaderTitleRow = styled(Space)`
  width: 100%;
  align-items: center;
  gap: 12px;

  @media (min-width: 721px) {
    display: none !important;
  }
`;

const UserChip = styled(Space)`
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.06);
  padding: 8px 16px;
  gap: 12px;
  align-items: center;
`;

const ContentArea = styled.div`
  padding: 0 40px 40px;
  ${surfaceStyles};

  @media (max-width: 720px) {
    padding: 0 20px 28px;
  }
`;

const LoaderContainer = styled.div`
  margin-bottom: 24px;
`;

const AlertContainer = styled.div`
  margin-bottom: 24px;
`;

const FooterBar = styled(Space)`
  padding: 24px 40px 32px;
  border-top: 1px solid rgba(15, 23, 42, 0.08);
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  ${surfaceStyles};

  @media (max-width: 720px) {
    padding: 24px 20px 28px;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }
`;

const FooterActions = styled(Space)`
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 720px) {
    justify-content: flex-start;
  }
`;

const InitializationContainer = styled(Space)`
  height: 100vh;
  width: 100%;
  background: radial-gradient(circle at top, rgba(59, 130, 246, 0.12), transparent 60%), #f5f7ff;
  align-items: center;
  justify-content: center;
`;

const MobileMenuBackdrop = styled.div<{ visible: boolean }>`
  display: none;

  @media (max-width: 720px) {
    display: ${({ visible }) => (visible ? 'block' : 'none')};
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(2px);
    z-index: 2;
    cursor: pointer;
  }
`;

const MobileMenuTrigger = styled.button`
  display: none;

  @media (max-width: 720px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 12px;
    padding: 8px;
    background: rgba(15, 23, 42, 0.08);
    color: #0f172a;
    cursor: pointer;
    box-shadow: 0 10px 24px -18px rgba(15, 23, 42, 0.45);
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 2px;
  }

  & > * {
    pointer-events: none;
  }
`;

const MainLayout: React.FC = () => {
  const { microfrontends, isLoading, error } = useMicrofrontends();
  const userDisplayName = 'Enterprise operator';
  const userRole = 'Workspace automation lead';
  const { isInitializing } = useShellInitialization();
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
      items: microfrontends.map((microfrontend) => {
        const path = microfrontend.routeConfig.path;
        const trimmedPath = path === '/' ? '/' : path.replace(/\/+$/, '');

        return {
          id: microfrontend.id,
          title: microfrontend.menuLabel,
          path: trimmedPath,
        };
      }),
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
          expanded: !menuMinimized || sectionActive,
          items: section.items.map((item) => ({
            state: item.path,
            klId: item.id,
            key: item.title,
            onClick: () => handleNavigate(item.path),
            active: matchRoute(item.path),
          })),
        } satisfies NavItemData;
      }),
    [handleNavigate, matchRoute, menuMinimized, sections],
  );

  const userNavItems = useMemo<NavItemData[]>(() => {
    return [
      {
        mode: 'user',
        state: 'user-profile',
        key: userDisplayName,
        icon: UserAccount,
        isRoot: true,
        userProps: {
          name: userDisplayName,
          role: userRole,
          status: 'available',
        },
        items: [
          {
            key: 'Profile preferences',
            onClick: () => handleNavigate('/dashboard'),
          },
          {
            key: 'Notification settings',
            onClick: () => handleNavigate('/dashboard'),
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
  }, [handleNavigate, userDisplayName, userRole]);

  const microfrontendRoutes = useMemo(
    () => microfrontends.map(({ routeConfig }) => routeConfig),
    [microfrontends],
  );

  const routes = useRoutes([
    {
      path: '/',
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: '/dashboard',
      Component: Dashboard,
    },
    {
      path: '/device-security',
      Component: DeviceSecurityPage,
    },
    {
      path: '/workshop/react-perf/wizard',
      Component: WizardQuickSetupPage,
    },
    ...microfrontendRoutes,
    {
      path: '*',
      Component: NotFound,
    },
  ]);

  if (isInitializing) {
    return (
      <InitializationContainer direction="vertical" size={32}>
        <Loader size="large" centered />
      </InitializationContainer>
    );
  }

  const activeMenuWidth = menuMinimized ? 72 : 292;

  return (
    <LayoutGrid menuWidth={activeMenuWidth} collapsed={menuMinimized}>
      <SidebarContainer id="shell-sidebar" collapsed={menuMinimized}>
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
              aria-expanded={!menuMinimized}
              aria-controls="shell-sidebar"
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

      <MobileMenuBackdrop
        role="presentation"
        visible={!menuMinimized}
        onClick={() => setMenuMinimized(true)}
      />

      <MainColumn>
        <ScrollContainer>
          <HeaderBar direction="horizontal" justify="space-between">
            <HeaderTitles direction="vertical" align="flex-start">
              <HeaderTitleRow direction="horizontal">
                <MobileMenuTrigger
                  type="button"
                  aria-label="Toggle navigation menu"
                  aria-controls="shell-sidebar"
                  aria-expanded={!menuMinimized}
                  onClick={() => setMenuMinimized((value) => !value)}
                >
                  <Hamburger name="mobile-hamburger" />
                </MobileMenuTrigger>
                <MobileHeading>Enterprise optimisation centre</MobileHeading>
              </HeaderTitleRow>
              <DesktopHeading>Enterprise optimisation centre</DesktopHeading>
              <Text style={{ color: '#475467' }}>
                Monitor posture, orchestrate response playbooks, and track automation coverage from
                a unified shell.
              </Text>
            </HeaderTitles>
            <HeaderActions direction="horizontal" align="flex-start">
              <UserChip direction="horizontal">
                <Text>{userDisplayName}</Text>
                <Button
                  mode="tertiary"
                  onClick={() => handleNavigate('/dashboard')}
                  text="Manage profile"
                />
              </UserChip>
              <Button mode="secondary" text="Export insights" />
              <Button mode="primary" text="Launch automation" />
            </HeaderActions>
          </HeaderBar>

          <ContentArea>
            {isLoading ? (
              <LoaderContainer role="status">
                <Space direction="vertical" align="center" gap={12}>
                  <Loader centered size="large" />
                  <Text style={{ color: '#475467' }}>Discovering registered microfrontends…</Text>
                </Space>
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

            {routes}
          </ContentArea>

          <FooterBar direction="horizontal" align="flex-start">
            <Space direction="vertical" align="flex-start" gap={8}>
              <Text as="span" style={{ fontWeight: 600 }}>
                Need help accelerating adoption?
              </Text>
              <P style={{ color: '#475467' }}>
                Review design system documentation, explore integration blueprints, or reach out to
                the enterprise solutions team for guided onboarding.
              </P>
            </Space>
            <FooterActions direction="horizontal">
              <Button mode="tertiary" text="View documentation" />
              <Button mode="primary" text="Contact solutions team" />
            </FooterActions>
          </FooterBar>
        </ScrollContainer>
      </MainColumn>
    </LayoutGrid>
  );
};

export default MainLayout;
