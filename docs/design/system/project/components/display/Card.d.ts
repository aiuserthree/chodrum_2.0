import * as React from 'react';

/**
 * The primary content container: white surface, 12px radius, hairline shadow.
 */
export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'style'> {
  /** Inner padding in px (or any CSS length string). @default 16 */
  padding?: number | string;
  /** card = hairline shadow · outline = 1px ring · none = flat. @default "card" */
  elevation?: 'card' | 'outline' | 'none';
  /** Adds a hover lift; pair with onClick for clickable cards. @default false */
  interactive?: boolean;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Card(props: CardProps): JSX.Element;
