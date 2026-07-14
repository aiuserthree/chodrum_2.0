import * as React from 'react';

/** Native select styled to match Input — sort order, genre, difficulty. */
export interface SelectOption { value: string; label: string; }
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'style'> {
  label?: string;
  /** Options as strings or {value,label} objects. */
  options: Array<string | SelectOption>;
  placeholder?: string;
  /** @default "md" */
  size?: 'sm' | 'md';
  /** @default true */
  fullWidth?: boolean;
  style?: React.CSSProperties;
}
export declare function Select(props: SelectProps): JSX.Element;
