import * as React from 'react';

/**
 * Account-entry button using a provider's mandated brand colour — the one
 * sanctioned exception to the achromatic chrome rule.
 */
export interface SocialButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'style'> {
  /** @default "kakao" */
  provider?: 'kakao' | 'naver' | 'google' | 'email';
  /** Override the glyph (supply Google's official multi-colour mark here). */
  iconUrl?: string;
  /** Override the default Korean label. */
  children?: React.ReactNode;
  style?: React.CSSProperties;
}
export declare function SocialButton(props: SocialButtonProps): JSX.Element;
