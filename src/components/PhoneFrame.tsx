import type { CSSProperties, ReactNode } from 'react'

type Props = {
  children: ReactNode
  dir?: 'ltr' | 'rtl'
  lang?: string
  style?: CSSProperties
}

/**
 * Field-app screens are designed at 390 × 844. On a phone the frame fills the
 * viewport; on larger screens it is centred as a device-sized card.
 */
export default function PhoneFrame({ children, dir, lang, style }: Props) {
  return (
    <div className="phone-stage">
      <div className="phone" dir={dir} lang={lang} style={{ fontFamily: 'var(--font-text)', ...style }}>
        {children}
      </div>
    </div>
  )
}
