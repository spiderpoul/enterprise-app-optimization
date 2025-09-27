import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Location } from 'react-router-dom';
import { Alert, Button, Card, Field, H2, Space, Text, Textbox } from '@kaspersky/hexa-ui';
import styled from 'styled-components';
import { useAuth } from '../auth/AuthContext';

interface LoginFormState {
  username: string;
  password: string;
}

const LoginForm = styled.form`
  display: grid;
  gap: 20px;
`;

const ErrorContainer = styled.div`
  margin-top: -8px;
`;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticating } = useAuth();
  const [formState, setFormState] = useState<LoginFormState>({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/dashboard';

  const handleInputChange = (field: keyof LoginFormState) => (value: string) => {
    setFormState((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      const trimmedUsername = formState.username.trim();
      const trimmedPassword = formState.password.trim();

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
      <Space className="login-page__layout" direction="vertical" gap={32} align="stretch">
        <Space direction="vertical" gap={8} align="flex-start">
          <H2>Enterprise App Optimization</H2>
          <Text style={{ color: '#475467' }}>
            Sign in to orchestrate automation and manage registered microfrontends.
          </Text>
        </Space>

        <Card className="login-page__card" title={{ value: 'Welcome back' }}>
          <Space direction="vertical" gap={24} align="stretch">
            <Text style={{ color: '#475467' }}>
              Use the shared shell credentials to continue. The demonstration environment accepts
              any username paired with the{' '}
              <Text as="span" style={{ fontWeight: 600 }}>
                optimize
              </Text>{' '}
              password.
            </Text>

            <LoginForm
              onSubmit={(event) => {
                void handleSubmit(event);
              }}
              noValidate
            >
              <Field
                label="Username"
                required
                control={
                  <Textbox
                    value={formState.username}
                    onChange={handleInputChange('username')}
                    placeholder="automation.lead"
                    disabled={isAuthenticating}
                    autoComplete="username"
                  />
                }
              />

              <Field
                label="Password"
                required
                control={
                  <Textbox.Password
                    value={formState.password}
                    onChange={handleInputChange('password')}
                    placeholder="optimize"
                    disabled={isAuthenticating}
                    autoComplete="current-password"
                  />
                }
              />

              {error ? (
                <ErrorContainer>
                  <Alert mode="error" closable={false}>
                    {error}
                  </Alert>
                </ErrorContainer>
              ) : null}

              <Button
                mode="primary"
                type="submit"
                loading={isAuthenticating}
                disabled={isAuthenticating}
                style={{ width: '100%' }}
              >
                Sign in
              </Button>
            </LoginForm>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default LoginPage;
