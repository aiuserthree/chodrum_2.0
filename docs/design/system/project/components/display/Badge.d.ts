import * as React from 'react';

/** Small non-interactive label for tags, counts and status. */
export interface BadgeProps {
  /** neutral (grey) · solid (Ink) · outline · success · warning · danger. @default "neutral" */
  variant?: 'neutral' | 'solid' | 'outline' | 'success' | 'warning' | 'danger';
  /** @default "md" */
  size?: 'sm' | 'md';
  /** Lucide icon name shown before the text. */
  icon?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Badge(props: BadgeProps): JSX.Element;
