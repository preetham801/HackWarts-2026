type CollaborationLogosProps = { variant: 'hero' | 'footer' }

export function CollaborationLogos({ variant }: CollaborationLogosProps) {
  return (
    <div className={`collaboration-logos collaboration-logos--${variant}`} aria-label="RezonX, InUnity, and Sri Siddhartha School of Engineering">
      <img src="/images/rezonx-logo.png" alt="RezonX" />
      <span aria-hidden="true">×</span>
      <img src="/images/inunity-logo.png" alt="InUnity — innovation for community" />
      <span aria-hidden="true">×</span>
      <img src="/images/ssse-logo.png" alt="Sri Siddhartha School of Engineering" />
    </div>
  )
}
