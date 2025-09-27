import React, { PropsWithChildren, useEffect } from 'react';

type ButtonAppearance = 'primary' | 'secondary' | 'ghost';

type StackDirection = 'row' | 'column';
type StackSpace = 'xs' | 's' | 'm' | 'l' | 'xl';

type UIFApplicationProps = PropsWithChildren<{
  appCode?: string;
  locale?: string;
  title?: string;
}>;

export const UIFApplication: React.FC<UIFApplicationProps> = ({ children, title }) => {
  useEffect(() => {
    if (title) {
      document.title = title;
    }
  }, [title]);

  return <div data-app-shell>{children}</div>;
};

type UIFHeaderProps = {
  title: string;
  subtitle?: string;
};

export const UIFHeader: React.FC<UIFHeaderProps> = ({ title, subtitle }) => (
  <header className="uif-header">
    <div className="uif-header__titles">
      <h1 className="uif-header__title">{title}</h1>
      {subtitle ? <p className="uif-header__subtitle">{subtitle}</p> : null}
    </div>
  </header>
);

type UIFContentProps = PropsWithChildren<Record<string, unknown>>;

export const UIFContent: React.FC<UIFContentProps> = ({ children }) => (
  <main className="uif-content">{children}</main>
);

type UIFButtonProps = PropsWithChildren<{
  appearance?: ButtonAppearance;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}>;

const getAppearanceClass = (appearance: ButtonAppearance = 'primary') =>
  `uif-button--${appearance}`;

export const UIFButton: React.FC<UIFButtonProps> = ({
  appearance = 'primary',
  children,
  onClick,
  type = 'button',
}) => (
  <button type={type} className={`uif-button ${getAppearanceClass(appearance)}`} onClick={onClick}>
    {children}
  </button>
);

type LoaderProps = {
  label?: string;
  size?: 's' | 'm' | 'l';
};

export const Loader: React.FC<LoaderProps> = ({ label, size = 'm' }) => (
  <div className={`uif-loader uif-loader--${size}`} role="status" aria-live="polite">
    <span className="uif-loader__spinner" />
    {label ? <span className="uif-loader__label">{label}</span> : null}
  </div>
);

type UIFStackProps = PropsWithChildren<{
  as?: React.ElementType;
  direction?: StackDirection;
  space?: StackSpace;
  [key: string]: unknown;
}>;

export const UIFStack: React.FC<UIFStackProps> = ({
  as: Component = 'div',
  children,
  direction = 'column',
  space = 'm',
  ...rest
}) => (
  <Component className={`uif-stack uif-stack--${direction} uif-stack--space-${space}`} {...rest}>
    {children}
  </Component>
);

type UIFCardProps = PropsWithChildren<{
  description?: string;
  emphasis?: 'subtle' | 'strong';
  title?: string;
  [key: string]: unknown;
}>;

export const UIFCard: React.FC<UIFCardProps> = ({
  children,
  description,
  emphasis = 'subtle',
  title,
  ...rest
}) => (
  <section className={`uif-card uif-card--${emphasis}`} {...rest}>
    {title ? <h2 className="uif-card__title">{title}</h2> : null}
    {description ? <p className="uif-card__description">{description}</p> : null}
    <div className="uif-card__body">{children}</div>
  </section>
);

export default {
  UIFApplication,
  UIFHeader,
  UIFContent,
  UIFButton,
  Loader,
  UIFStack,
  UIFCard,
};
