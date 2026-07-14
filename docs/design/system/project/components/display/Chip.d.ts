import * as React from 'react';

/** Pill-shaped filter / category toggle and suggestion chip. */
export interface ChipProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** Selected = solid Ink fill. @default false */
  selected?: boolean;
  /** Lucide icon name shown before the label. */
  icon?: string;
  /** Optional trailing count (e.g. filter result count). */
  count?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function Chip(props: ChipProps): JSX.Element;
