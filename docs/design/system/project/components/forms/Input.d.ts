import * as React from 'react';

/** Single-line text field: 12px radius, 1px Line border, subtle focus glow. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'style'> {
  label?: string;
  hint?: string;
  /** Error message; turns the border and message red. */
  error?: string;
  /** Lucide icon name shown inside, left of the text. */
  iconLeft?: string;
  /** @default "md" */
  size?: 'sm' | 'md' | 'lg';
  /** @default true */
  fullWidth?: boolean;
  style?: React.CSSProperties;
}
export declare function Input(props: InputProps): JSX.Element;
