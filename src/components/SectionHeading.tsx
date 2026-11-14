type SectionHeadingProps = {
  id?: string
  eyebrow?: string
  title: string
  subtitle?: string
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeading({ id, eyebrow, title, subtitle, align = 'center', className }: SectionHeadingProps) {
  return (
    <header className={`section-heading section-heading--${align}${className ? ` ${className}` : ''}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id}>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </header>
  )
}
