import * as React from 'react';

/** Square checkbox for cart selection and terms agreement. */
export interface CheckboxProps {
  checked?: boolean;
  /** "Select all" partial state — shows a dash. */
  indeterminate?: boolean;
  disabled?: boolean;
  label?: React.ReactNode;
  /** Called with the next boolean value. */
  onChange?: (next: boolean) => void;
  /** Box size in px. @default 18 */
  size?: number;
  style?: React.CSSProperties;
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
