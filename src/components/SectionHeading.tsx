type SectionHeadingProps = {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
}

export function SectionHeading({ id, eyebrow, title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id}>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </header>
  )
}
