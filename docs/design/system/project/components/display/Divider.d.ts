import * as React from 'react';

/** 1px Line separator — horizontal (optionally labelled) or vertical. */
export interface DividerProps {
  /** Centred label on a horizontal rule (e.g. "또는"). */
  label?: React.ReactNode;
  /** Margin along the main axis, px. @default 16 */
  spacing?: number;
  /** @default "horizontal" */
  orientation?: 'horizontal' | 'vertical';
  style?: React.CSSProperties;
}
export declare function Divider(props: DividerProps): JSX.Element;
