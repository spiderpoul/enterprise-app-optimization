declare module '@kaspersky/uif';

declare module '@kaspersky/uif-react' {
  import type { ElementType, FC, ReactNode } from 'react';

  export interface UIFApplicationProps {
    appCode?: string;
    children?: ReactNode;
    locale?: string;
    title?: string;
  }
  export const UIFApplication: FC<UIFApplicationProps>;

  export interface UIFHeaderProps {
    title: string;
    subtitle?: string;
  }
  export const UIFHeader: FC<UIFHeaderProps>;

  export interface UIFContentProps {
    children?: ReactNode;
  }
  export const UIFContent: FC<UIFContentProps>;

  export interface UIFButtonProps {
    appearance?: 'primary' | 'secondary' | 'ghost';
    children?: ReactNode;
    onClick?: () => void;
  }
  export const UIFButton: FC<UIFButtonProps>;

  export interface LoaderProps {
    label?: string;
    size?: 's' | 'm' | 'l';
  }
  export const Loader: FC<LoaderProps>;

  export interface UIFStackProps {
    as?: ElementType;
    children?: ReactNode;
    direction?: 'row' | 'column';
    space?: 'xs' | 's' | 'm' | 'l' | 'xl';
    [key: string]: unknown;
  }
  export const UIFStack: FC<UIFStackProps>;

  export interface UIFCardProps {
    children?: ReactNode;
    description?: string;
    emphasis?: 'subtle' | 'strong';
    title?: string;
    [key: string]: unknown;
  }
  export const UIFCard: FC<UIFCardProps>;
}
