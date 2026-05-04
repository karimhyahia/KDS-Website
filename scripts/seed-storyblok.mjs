import { readFileSync } from 'node:fs';
import { resolve, basename } from 'node:path';

const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '292282210158437';
const TOKEN = process.env.STORYBLOK_PERSONAL_TOKEN;
if (!TOKEN) {
  console.error('STORYBLOK_PERSONAL_TOKEN is required');
  process.exit(1);
}

const API = 'https://mapi.storyblok.com/v1';
const headers = { Authorization: TOKEN, 'Content-Type': 'application/json' };

async function api(path, init = {}) {
  const res = await fetch(`${API}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`${init.method || 'GET'} ${path} → ${res.status} ${body}`);
  }
  return res.json();
}

async function uploadAsset(filename) {
  const filepath = resolve('public/images', filename);
  const buf = readFileSync(filepath);
  const ext = filename.split('.').pop();
  const ct = ext === 'png' ? 'image/png' : 'image/jpeg';

  const sign = await api(`/spaces/${SPACE_ID}/assets`, {
    method: 'POST',
    body: JSON.stringify({ filename, size: `${buf.length}`, asset_folder_id: null }),
  });

  const form = new FormData();
  for (const [k, v] of Object.entries(sign.fields)) form.append(k, v);
  form.append('file', new Blob([buf], { type: ct }), filename);

  const upload = await fetch(sign.post_url, { method: 'POST', body: form });
  if (!upload.ok) throw new Error(`S3 upload failed for ${filename}: ${upload.status}`);

  await api(`/spaces/${SPACE_ID}/assets/${sign.id}/finish_upload`, { method: 'GET' });
  console.log(`  → uploaded ${filename}`);
  return { id: sign.id, filename: sign.pretty_url ? `https:${sign.pretty_url}` : sign.public_url };
}

async function getOrCreateStory(slug, payload) {
  const list = await api(`/spaces/${SPACE_ID}/stories?with_slug=${slug}`);
  const existing = list.stories?.find((s) => s.slug === slug || s.full_slug === slug);
  if (existing) {
    console.log(`Updating existing story: ${slug} (id=${existing.id})`);
    return api(`/spaces/${SPACE_ID}/stories/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({ story: { ...existing, content: payload.content }, publish: 1 }),
    });
  }
  console.log(`Creating new story: ${slug}`);
  return api(`/spaces/${SPACE_ID}/stories`, {
    method: 'POST',
    body: JSON.stringify({ story: payload, publish: 1 }),
  });
}

console.log('Uploading project images to Storyblok assets…');
const imageFiles = [
  'hero-dach.jpg',
  'dach-fertig.jpg',
  'fassade-geruest.jpg',
  'dach-latten.jpg',
  'bad-renovierung-4.jpg',
  'dach-daemmung.jpg',
];
const assets = {};
for (const f of imageFiles) {
  assets[f] = await uploadAsset(f);
}

const asset = (file, alt) => ({
  id: assets[file].id,
  filename: assets[file].filename,
  alt,
  name: '',
  focus: '',
  title: '',
  source: '',
  copyright: '',
});

const content = {
  component: 'page',
  seo_title: 'KDS Keller & Dach Spezialisten | Handwerker Reichelsheim | 24h Notdienst',
  seo_description:
    'KDS - Ihr Handwerker in Reichelsheim (Odenwald). Dachsanierung, Kellerentfeuchtung, Fassadenarbeiten & 24h Notdienst. ☎ 0163-6197589. Kostenlose Beratung!',
  body: [
    {
      component: 'hero',
      badge: 'Qualität aus Reichelsheim',
      headline: 'Gute Handwerker –<br><span class="highlight">Gute Arbeit</span>',
      subline:
        'Wir sind Ihr zuverlässiger Partner für alle Arbeiten rund um Keller, Dach und Fassade. Qualifiziert, sauber und fachgerecht.',
      primary_cta_text: 'Jetzt anrufen',
      primary_cta_link: { url: 'tel:+4916361975889', linktype: 'url' },
      secondary_cta_text: 'Unsere Leistungen',
      secondary_cta_link: { url: '#leistungen', linktype: 'url' },
      trust_items: [
        { component: 'trust_item', text: '24h Notdienst' },
        { component: 'trust_item', text: 'Chef kommt persönlich' },
        { component: 'trust_item', text: 'Qualitätsgarantie' },
      ],
    },
    {
      component: 'services',
      tag: 'Was wir bieten',
      headline: 'Unsere Leistungen',
      subline:
        'Vom Keller bis zum Dach – wir sind Ihr Komplettanbieter für professionelle Handwerksarbeiten.',
      cards: [
        { component: 'service_card', icon: '🎨', title: 'Maler- und Fassadenarbeiten', description: 'Professionelle Malerarbeiten innen und außen. Fassadengestaltung, die Ihr Haus erstrahlen lässt.', variant: 'default' },
        { component: 'service_card', icon: '🏗️', title: 'Verputzarbeiten', description: 'Innen- und Außenputz in höchster Qualität. Saubere Ausführung für ein perfektes Ergebnis.', variant: 'default' },
        { component: 'service_card', icon: '💧', title: 'Kellerentfeuchtung', description: 'Professionelle Entfeuchtung von Kellern und feuchten Wänden. Nachhaltige Lösungen gegen Feuchtigkeit.', variant: 'featured', badge: 'Spezialist' },
        { component: 'service_card', icon: '🦠', title: 'Schimmelbeseitigung', description: 'Fachgerechte Schimmelentfernung und Ursachenbekämpfung für ein gesundes Wohnklima.', variant: 'default' },
        { component: 'service_card', icon: '🏠', title: 'Dach- und Kaminarbeiten', description: 'Dachreparaturen, Wartung und Kaminarbeiten. Schutz von oben durch Experten.', variant: 'default' },
        { component: 'service_card', icon: '🚪', title: 'Fenster, Türen & Wintergärten', description: 'Einbau und Austausch von Fenstern und Türen. Wintergärten für mehr Wohnqualität.', variant: 'default' },
        { component: 'service_card', icon: '🌳', title: 'Gartenarbeit & Baumfällungen', description: 'Professionelle Gartenpflege und sichere Baumfällungen durch geschultes Personal.', variant: 'default' },
        { component: 'service_card', icon: '🚨', title: '24h Notdienst', description: 'Wasserschaden? Sturmschaden? Wir sind rund um die Uhr für Sie da – auch an Sonn- und Feiertagen.', variant: 'emergency', cta_text: 'Jetzt anrufen →', cta_link: { url: 'tel:+4916361975889', linktype: 'url' } },
      ],
    },
    {
      component: 'projects',
      tag: 'Unsere Arbeit',
      headline: 'Aktuelle Projekte',
      subline: 'Einblicke in unsere aktuellen Baustellen und abgeschlossenen Projekte.',
      cards: [
        { component: 'project_card', image: asset('hero-dach.jpg', 'Dachsanierung in Reichelsheim - KDS verlegt neue rote Tonziegel auf einem Einfamilienhaus'), title: 'Dachsanierung', subtitle: 'Neueindeckung mit Tonziegeln' },
        { component: 'project_card', image: asset('dach-fertig.jpg', 'Fertiggestellte Dacheindeckung mit hochwertigen Ziegeln - Handwerksarbeit von KDS'), title: 'Dacharbeiten', subtitle: 'Hochwertige Dacheindeckung' },
        { component: 'project_card', image: asset('fassade-geruest.jpg', 'Fassadensanierung mit Baugeruest - KDS Fassadenarbeiten im Odenwald'), title: 'Fassadensanierung', subtitle: 'Komplettsanierung Außenfassade' },
        { component: 'project_card', image: asset('dach-latten.jpg', 'Dachlattung mit neuen Ziegeln - professionelle Dachsanierung durch KDS Handwerker'), title: 'Dacheindeckung', subtitle: 'Neue Lattung und Ziegel' },
        { component: 'project_card', image: asset('bad-renovierung-4.jpg', 'Badezimmer-Renovierung mit Fliesenarbeiten - KDS Innenausbau in Reichelsheim'), title: 'Fliesenarbeiten', subtitle: 'Badezimmer-Renovierung' },
        { component: 'project_card', image: asset('dach-daemmung.jpg', 'Professionelle Dachdaemmung fuer bessere Energieeffizienz - KDS Daemmarbeiten'), title: 'Dachdämmung', subtitle: 'Professionelle Wärmedämmung' },
      ],
    },
    {
      component: 'about',
      tag: 'Warum KDS?',
      headline: 'Bei uns kommt der Chef noch selbst zu Ihnen',
      lead: 'Wir sind ein qualifizierter Betrieb und führen alle Arbeiten sauber und fachgerecht aus.',
      features: [
        { component: 'about_feature', icon: '👨‍🔧', title: 'Persönliche Betreuung', description: 'Herr Gillmeister kümmert sich persönlich um Ihr Anliegen.' },
        { component: 'about_feature', icon: '⭐', title: 'Qualität & Nachhaltigkeit', description: 'Hochwertige Materialien und langlebige Lösungen.' },
        { component: 'about_feature', icon: '🤝', title: 'Zuverlässigkeit', description: 'Termintreue und transparente Kommunikation.' },
        { component: 'about_feature', icon: '🛠️', title: 'Fachkompetenz', description: 'Jahrelange Erfahrung in allen Gewerken.' },
      ],
      cta_text: 'Kostenlose Beratung anfragen',
      cta_link: { url: '#kontakt', linktype: 'url' },
      visual_icon: '🏆',
      visual_title: 'Unser Versprechen',
      visual_quote: '"Prüfen Sie unsere Zuverlässigkeit und unsere Fachkompetenz."',
      visual_author: '– Herr Gillmeister, Inhaber',
    },
    {
      component: 'cta_section',
      headline: 'Haben Sie ein Projekt?',
      subline:
        'Rufen Sie uns an – wir beraten Sie gerne und erstellen Ihnen ein unverbindliches Angebot.',
      phone_number: '+4916361975889',
      phone_display: '0163 – 619 75 89',
    },
    {
      component: 'contact',
      tag: 'Kontakt',
      headline: 'Sprechen Sie uns an',
      subline: 'Wir freuen uns auf Ihre Anfrage und beraten Sie gerne.',
      contact_name: 'Herr Gillmeister',
      contact_role: 'Inhaber & Ihr direkter Ansprechpartner',
      phone: '+4916361975889',
      phone_display: '0163 – 619 75 89',
      phone_note: '24h Notdienst verfügbar',
      address: 'Firma KDS\nPanoramastr. 12\n64385 Reichelsheim',
      form_headline: 'Schreiben Sie uns',
      service_options: [
        { component: 'service_option', label: 'Maler- und Fassadenarbeiten', value: 'maler' },
        { component: 'service_option', label: 'Verputzarbeiten', value: 'putz' },
        { component: 'service_option', label: 'Kellerentfeuchtung', value: 'keller' },
        { component: 'service_option', label: 'Schimmelbeseitigung', value: 'schimmel' },
        { component: 'service_option', label: 'Dach- und Kaminarbeiten', value: 'dach' },
        { component: 'service_option', label: 'Fenster, Türen & Wintergärten', value: 'fenster' },
        { component: 'service_option', label: 'Gartenarbeit & Baumfällungen', value: 'garten' },
        { component: 'service_option', label: '24h Notdienst', value: 'notdienst' },
        { component: 'service_option', label: 'Sonstiges', value: 'sonstiges' },
      ],
    },
  ],
};

console.log('\nCreating/updating home story…');
await getOrCreateStory('home', {
  name: 'Home',
  slug: 'home',
  is_startpage: true,
  content,
});

console.log('\n✅ Seed complete.');
