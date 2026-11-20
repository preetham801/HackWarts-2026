import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

type PaymentPortalFrameProps = {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}

export function PaymentPortalFrame({ eyebrow, title, description, children }: PaymentPortalFrameProps) {
  return (
    <main className="payment-portal">
      <div className="payment-portal__inner">
        <header className="payment-portal__header">
          <Link className="payment-portal__brand" to="/" aria-label="HackWarts 2026 home">
            <span className="payment-portal__brand-mark" aria-hidden="true">H</span>
            <span>HACKWARTS <small>2026</small></span>
          </Link>
          <Link className="payment-portal__home-link" to="/">Home</Link>
        </header>
        <section className="payment-portal__intro" aria-labelledby="payment-portal-title">
          <p>{eyebrow}</p>
          <h1 id="payment-portal-title">{title}</h1>
          <div>{description}</div>
        </section>
        {children}
        <footer className="payment-portal__footer">Sri Siddhartha School of Engineering · Tumkur · November 25 &amp; 26, 2026</footer>
      </div>
    </main>
  )
}
