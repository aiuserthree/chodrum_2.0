import * as React from 'react';

/**
 * Thin-stroke icon from the Lucide set, rendered via CSS mask so it inherits
 * `currentColor`. No runtime dependency — safe inside the bundle.
 */
export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Lucide icon name, kebab-case (e.g. "shopping-cart", "download"). */
  name: string;
  /** Pixel size (width & height). @default 18 */
  size?: number;
  /** Accessible label; falls back to `name`. */
  label?: string;
}
export declare function Icon(props: IconProps): JSX.Element;
