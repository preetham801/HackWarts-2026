import castleImage from '../assets/hackwarts-night-hero.jpg'

export function CastleBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[#07101b]" />
      <img src={castleImage} alt="" className="hero-art absolute inset-0 h-full w-full object-cover" fetchPriority="high" />
      <div className="hero-image-grade absolute inset-0" />
      <div className="hero-title-shade absolute inset-0" />
      <div className="hero-edge-shade absolute inset-0" />
    </div>
  )
}
