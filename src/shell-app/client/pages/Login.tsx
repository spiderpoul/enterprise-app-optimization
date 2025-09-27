import React, { useState } from 'react';
import { Alert, Button, Form, Input, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { UIFCard, UIFContent, UIFHeader, UIFStack } from '@kaspersky/uif-react';
import { useAuth } from '../auth/AuthContext';

const { Paragraph, Text } = Typography;

interface LoginFormValues {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticating } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const handleSubmit = async ({ username, password }: LoginFormValues): Promise<void> => {
    setError(null);

    try {
      const trimmedUsername = username.trim();
      const trimmedPassword = password.trim();

      await login(trimmedUsername, trimmedPassword);
      void navigate(from, { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unable to authenticate. Please try again.';
      setError(message);
    }
  };

  return (
    <div className="login-page">
      <UIFContent>
        <UIFStack className="login-page__layout" space="xl">
          <UIFHeader
            title="Enterprise App Optimization"
            subtitle="Sign in to orchestrate automation and manage registered microfrontends"
          />

          <UIFCard emphasis="strong" title="Welcome back" className="login-page__card">
            <Paragraph className="login-page__intro">
              Use the shared shell credentials to continue. The demonstration environment accepts
              any username paired with the
              <Text strong> optimize</Text> password.
            </Paragraph>

            <Form<LoginFormValues>
              layout="vertical"
              onFinish={(values) => {
                void handleSubmit(values);
              }}
              disabled={isAuthenticating}
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Enter your username' }]}
              >
                <Input placeholder="automation.lead" autoComplete="username" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Enter your password' }]}
              >
                <Input.Password placeholder="optimize" autoComplete="current-password" />
              </Form.Item>

              {error ? (
                <Alert type="error" message="Authentication failed" description={error} showIcon />
              ) : null}

              <div className="login-page__actions">
                <Button type="primary" htmlType="submit" block loading={isAuthenticating}>
                  Sign in
                </Button>
              </div>
            </Form>
          </UIFCard>
        </UIFStack>
      </UIFContent>
    </div>
  );
};

export default LoginPage;
