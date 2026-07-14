import * as React from 'react';

/** Minus / value / plus quantity control for detail & cart rows. */
export interface QuantityStepperProps {
  value: number;
  min?: number;
  max?: number;
  /** @default "md" */
  size?: 'sm' | 'md';
  disabled?: boolean;
  /** Called with the clamped next value. */
  onChange?: (next: number) => void;
  style?: React.CSSProperties;
}
export declare function QuantityStepper(props: QuantityStepperProps): JSX.Element;
