import gryffindorCrest from '../assets/tracks/gryffindor-crest.png'
import hufflepuffCrest from '../assets/tracks/hufflepuff-crest-transparent.png'
import ravenclawCrest from '../assets/tracks/ravenclaw-crest.png'
import slytherinCrest from '../assets/tracks/slytherin-crest.png'

export const houseDossiers = [
  {
    slug: 'gryffindor', name: 'Gryffindor', index: '01', motto: 'Courage, bravery and bold thinking.', track: 'AgriTech', tone: 'crimson', crest: gryffindorCrest,
    mission: 'Build practical agricultural and rural technology prototypes that empower farmers, optimize field resources, and strengthen food supply resilience.',
    overview: 'This track focuses on modernizing agriculture through smart cultivation tools, soil and crop intelligence, efficient water management, and transparent farm-to-market supply chains.',
    domains: [
      { title: 'Farming', involves: 'Smart farm management workflows, precision cultivation planners, crop advisory tools, and mechanization aids.' },
      { title: 'Crop and Soil Health', involves: 'Soil nutrient diagnostics, early pest and disease detection, fertilizer optimization, and crop yield prediction.' },
      { title: 'Irrigation', involves: 'Automated moisture-driven irrigation scheduling, water-saving drip controllers, and sensor-based field telemetry.' },
      { title: 'Food Supply', involves: 'Farm-to-market logistics, cold-chain storage monitoring, harvest shelf-life tracking, and post-harvest loss reduction.' },
      { title: 'Rural Livelihoods', involves: 'Direct farmer-to-buyer marketplaces, fair-price discovery tools, rural micro-enterprise platforms, and community resource access.' },
    ],
  },
  {
    slug: 'hufflepuff', name: 'Hufflepuff', index: '02', motto: 'Dedication, loyalty and teamwork.', track: 'EdTech & FinTech', tone: 'amber', crest: hufflepuffCrest,
    mission: 'Create accessible educational platforms and trustworthy financial tools that help learners build real skills and empower individuals to transact safely.',
    overview: 'This track bridges modern learning experiences with inclusive digital finance—combining interactive education, practical skill development, seamless payments, financial literacy, and fraud defense.',
    domains: [
      { title: 'Learning Tools', involves: 'Adaptive study companions, interactive concept visualizers, accessible classroom assistants, and personalized quiz engines.' },
      { title: 'Skill Building', involves: 'Project-based upskilling pathways, hands-on career/coding simulators, peer mentorship hubs, and verifiable skill portfolios.' },
      { title: 'Digital Payments', involves: 'Seamless micro-payment workflows, campus and merchant billing solutions, offline-friendly transactions, and expense-splitting tools.' },
      { title: 'Financial Literacy', involves: 'Interactive budgeting planners, student and household savings guides, credit/investment basics, and personal expense analyzers.' },
      { title: 'Fraud Prevention', involves: 'Real-time UPI and payment scam alerts, phishing link/message detectors, suspicious transaction flagging, and digital identity protection.' },
    ],
  },
  {
    slug: 'ravenclaw', name: 'Ravenclaw', index: '03', motto: 'Wisdom, creativity and curiosity.', track: 'Health & Safety', tone: 'blue', crest: ravenclawCrest,
    mission: 'Engineer human-centered healthcare, personal safety, accessibility, and rapid emergency response solutions that protect lives in both physical and digital spaces.',
    overview: "This track addresses critical challenges in medical care, mental well-being, inclusive accessibility, women's safety, cybersecurity, and disaster preparedness through reliable, high-impact prototypes.",
    domains: [
      { title: 'Health Care', involves: 'Early symptom triage, preventive health trackers, telemedicine bridges, medication adherence alerts, and clinic workflow tools.' },
      { title: 'Mental Health', involves: 'Stress and burnout check-ins, guided mindfulness companions, anonymous peer-support spaces, and emotional wellness trackers.' },
      { title: 'Accessibility', involves: 'Assistive tools for visual, hearing, speech, or motor accessibility, screen-friendly interfaces, and inclusive navigation aids.' },
      { title: "Women's Safety", involves: 'One-tap SOS emergency alerts, safe-route navigation, live guardian location sharing, and campus/community safety networks.' },
      { title: 'Cyber Security', involves: 'Personal privacy shields, deepfake and scam verification, credential breach alerts, and campus or network threat monitoring.' },
      { title: 'Disaster Safety', involves: 'Early-warning hazard alerts, emergency shelter and resource locators, offline SOS coordination, and rescue mapping tools.' },
    ],
  },
  {
    slug: 'slytherin', name: 'Slytherin', index: '04', motto: 'Ambition, strategy and determination.', track: 'Sustainability & Development', tone: 'green', crest: slytherinCrest,
    mission: 'Design scalable environmental, infrastructure, and civic solutions that turn campuses and cities into cleaner, greener, and better-connected communities.',
    overview: 'This track tackles environmental sustainability and urban/campus development—spanning circular waste management, water conservation, clean energy, climate resilience, and civic platforms.',
    domains: [
      { title: 'Waste', involves: 'Smart waste segregation classifiers, circular recycling marketplaces, food-surplus redistribution, and e-waste collection trackers.' },
      { title: 'Water', involves: 'Smart leak detection, rainwater harvesting monitors, greywater reuse trackers, and clean-water quality dashboards.' },
      { title: 'Energy', involves: 'Solar and renewable energy optimizers, smart building power-saving automation, microgrid load balancers, and carbon-footprint trackers.' },
      { title: 'Climate', involves: 'Hyper-local air-quality and urban heat-island mapping, reforestation monitors, and climate-resilience planning tools.' },
      { title: 'Smart Campus & City, Civic and Community Development', involves: 'Smart campus utilities, civic issue reporting portals, public facility/transit trackers, and neighborhood or volunteer coordination platforms.' },
    ],
  },
] as const

const dossierSourceByHouse: Record<string, string> = {
  gryffindor: 'ravenclaw',
  hufflepuff: 'slytherin',
  ravenclaw: 'hufflepuff',
  slytherin: 'gryffindor',
}

export const getHouseDossierContent = (slug: string) => {
  const sourceSlug = dossierSourceByHouse[slug] ?? slug
  return houseDossiers.find((entry) => entry.slug === sourceSlug)
}
