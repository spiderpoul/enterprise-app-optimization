declare module '@kaspersky/uif';

declare module '@kaspersky/uif-react' {
  import type { FC, ReactNode } from 'react';

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
}
