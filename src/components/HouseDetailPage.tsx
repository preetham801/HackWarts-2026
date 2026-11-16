import { Link, useNavigate, useParams } from 'react-router-dom'
import { getHouseDossierContent, houseDossiers } from '../data/houseDossiers'

export function HouseDetailPage() {
  const { houseSlug } = useParams()
  const navigate = useNavigate()
  const house = houseDossiers.find((entry) => entry.slug === houseSlug)
  const dossier = houseSlug ? getHouseDossierContent(houseSlug) : undefined

  if (!house || !dossier) {
    return <main className="house-dossier house-dossier--missing"><h1>House not found</h1><Link to="/#houses">Back to The Houses</Link></main>
  }

  const returnToHouses = () => {
    navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className={`house-dossier house-dossier--${house.tone}`}>
      <div className="house-dossier__inner">
        <nav className="house-dossier__topnav" aria-label="House dossier navigation">
          <button className="house-dossier__back" type="button" onClick={returnToHouses}>← Go Back to Home Page</button>
          <p><Link to="/">HackWarts 2026</Link><span aria-hidden="true"> / </span><button type="button" onClick={returnToHouses}>Houses</button><span aria-hidden="true"> / </span><span aria-current="page">{house.name}</span></p>
        </nav>
        <header className="house-dossier__hero">
          <div className="house-dossier__crest"><img src={house.crest} alt={`${house.name} heraldic crest`} /></div>
          <div><p className="house-dossier__index">HOUSE {house.index}</p><h1>{house.name}</h1><p className="house-dossier__motto">{house.motto}</p><p className="house-dossier__track-label">Designated Track</p><p className="house-dossier__track">{dossier.track}</p></div>
        </header>
        <section className="house-dossier__intro-grid" aria-label="House and track overview">
          <article><p className="house-dossier__eyebrow">The House</p><h2>What We Do in This House</h2><p>{dossier.mission}</p></article>
          <article><p className="house-dossier__eyebrow">The Challenge</p><h2>About the Track</h2><p>{dossier.overview}</p></article>
        </section>
        <section className="house-dossier__domains" aria-labelledby="house-domain-title">
          <p className="house-dossier__eyebrow">Explore the possibilities</p><h2 id="house-domain-title">What You Can Build Under This Track</h2>
          <div className="house-dossier__domain-grid">{dossier.domains.map((domain, index) => <article className="house-domain" key={domain.title}><p className="house-domain__index">FOCUS {String(index + 1).padStart(2, '0')}</p><h3>{domain.title}</h3><h4>What It Involves</h4><p>{domain.involves}</p><h4>What You Can Build</h4><p>{domain.involves}</p></article>)}</div>
        </section>
        <footer className="house-dossier__footer"><div><p className="house-dossier__eyebrow">Choose another House</p><nav className="house-dossier__switcher" aria-label="Switch Houses">{houseDossiers.map((item) => <Link className={item.slug === house.slug ? 'is-current' : ''} aria-current={item.slug === house.slug ? 'page' : undefined} key={item.slug} to={`/houses/${item.slug}`}>{item.name}</Link>)}</nav></div><Link className="house-dossier__register" to="/register">Register for This Track</Link></footer>
      </div>
    </main>
  )
}
