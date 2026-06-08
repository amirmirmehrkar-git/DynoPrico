import React, { useEffect, useRef, useState } from 'react';

const navItems = [
  ['Problem', 'problem'],
  ['So funktioniert es', 'solution'],
  ['Wirkung', 'impact'],
  ['Pilot', 'pilot'],
  ['Kontakt', 'contact']
];

const actions = [
  ['Intelligenter Rabatt', 'Erstellen Sie rechtzeitig ein Angebot für Produkte, die Aufmerksamkeit benötigen.'],
  ['Produktpaket', 'Kombinieren Sie ausgewählte Produkte zu einem einfachen Kundenangebot.'],
  ['Lieferangebot', 'Bereiten Sie ein freigegebenes Angebot für Lieferkunden vor.'],
  ['Aktion im Geschäft', 'Handeln Sie, solange Kundinnen und Kunden noch in der Nähe sind.']
];

const channels = ['Im Geschäft', 'Lieferung', 'Digitale Speisekarte', 'Lokale Aktion'];
const impacts = [
  ['Vermeidbare Lebensmittelverschwendung reduzieren', 'Handeln Sie, solange Produkte noch genossen werden können.'],
  ['Gefährdeten Umsatz zurückgewinnen', 'Verwandeln Sie verbleibenden Bestand in Kundennutzen.'],
  ['Margen durch besseres Timing schützen', 'Treffen Sie frühere und bewusstere Entscheidungen.'],
  ['Weniger manuelles Rätselraten', 'Geben Sie vielbeschäftigten Teams einen klaren nächsten Schritt.']
];

function Reveal({ children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function Logo({ inverse = false }) {
  return (
    <a href="#top" className="flex items-center gap-3" aria-label="DynoPrice Startseite">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm">
        <img src="/assets/dynoprice-dinosaur.png" alt="" className="h-full w-full object-contain" />
      </span>
      <span className={`text-xl font-black tracking-tight ${inverse ? 'text-white' : 'text-ink'}`}>
        <span className="text-leaf">Dyno</span>Price
      </span>
    </a>
  );
}

function SectionTitle({ eyebrow, title, copy, center = false }) {
  return (
    <div className={center ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl'}>
      <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-leaf">{eyebrow}</p>
      <h2 className="text-3xl font-black tracking-[-0.035em] text-ink sm:text-5xl">{title}</h2>
      {copy && <p className="mt-5 text-lg leading-8 text-slate">{copy}</p>}
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/80 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm font-bold text-slate lg:flex">
          {navItems.map(([label, href]) => <a key={href} href={`#${href}`} className="transition hover:text-forest">{label}</a>)}
        </nav>
        <a href="#contact" className="rounded-full bg-forest px-5 py-3 text-sm font-bold text-white shadow-lg shadow-green-900/15 transition hover:-translate-y-0.5 hover:bg-green-800">
          Demo anfragen
        </a>
      </div>
    </header>
  );
}

const storyStages = [
  {
    label: 'Phase 1 — Frischer Start',
    headline: 'Frisch zubereitet und bereit für den Tag.',
    body: 'Jeder Tag beginnt mit frischen Produkten, die für Kundinnen und Kunden vorbereitet und zum Verkauf angeboten werden.',
    src: '/assets/cafe-stage-1.jpg',
    alt: 'Eine gut gefüllte Café-Vitrine mit frisch zubereiteten Sandwiches.'
  },
  {
    label: 'Phase 2 — Steigendes Risiko',
    headline: 'Trotz Planung bleiben einige Produkte unverkauft.',
    body: 'Im Laufe des Tages bleiben einige Sandwiches in der Vitrine. Ihr Wert sinkt und das Abfallrisiko steigt.',
    src: '/assets/cafe-stage-2.jpg',
    alt: 'Eine Café-Vitrine mit wenigen verbleibenden Sandwiches.'
  },
  {
    label: 'Phase 3 — Rechtzeitig handeln',
    headline: 'DynoPrice hilft dem Team, im richtigen Moment zu handeln.',
    body: 'Der Betrieb erhält rechtzeitig einfache Empfehlungen, um gefährdete Produkte noch vor dem Tagesende anzubieten.',
    src: '/assets/cafe-stage-3.jpg',
    alt: 'Ein Café-Mitarbeiter nutzt die DynoPrice-Anwendung auf einem Smartphone.'
  },
  {
    label: 'Phase 4 — Wert gesichert',
    headline: 'Gefährdete Produkte werden verkauft statt verschwendet.',
    body: 'Durch rechtzeitiges Handeln werden verbleibende Sandwiches verkauft, Abfall reduziert und Umsatz gesichert.',
    src: '/assets/cafe-stage-4.jpg',
    alt: 'Ein Café-Mitarbeiter übergibt einer Kundin ein verkauftes Sandwich.'
  }
];

function Hero() {
  const storyRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    storyStages.forEach(({ src }) => {
      const image = new Image();
      image.src = src;
    });

    let frame;
    const update = () => {
      if (!storyRef.current) return;
      const rect = storyRef.current.getBoundingClientRect();
      const distance = storyRef.current.offsetHeight - window.innerHeight;
      setProgress(Math.min(1, Math.max(0, -rect.top / Math.max(distance, 1))));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  const stagePosition = progress * (storyStages.length - 1);
  const activeStage = Math.min(storyStages.length - 1, Math.round(stagePosition));

  return (
    <>
      <section id="top" ref={storyRef} className="relative hidden h-[420vh] bg-ink md:block">
        <div className="sticky top-[80px] h-[calc(100vh-80px)] min-h-[560px] overflow-hidden bg-[radial-gradient(circle_at_top_right,#1a6042,transparent_34%),#0D1724]">
          <div className="relative mx-auto grid h-full max-w-7xl items-center gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="relative z-10">
              {storyStages.map((stage, index) => {
                const distance = Math.abs(stagePosition - index);
                const opacity = Math.max(0, 1 - distance * 1.55);
                return (
                  <div
                    key={stage.label}
                    className="absolute left-0 top-1/2 max-w-xl -translate-y-1/2 transition-[opacity,transform] duration-200"
                    style={{ opacity, transform: `translateY(calc(-50% + ${(index - stagePosition) * 22}px))`, pointerEvents: index === activeStage ? 'auto' : 'none' }}
                  >
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-leaf">{stage.label}</p>
                    <h1 className="mt-5 text-5xl font-black tracking-[-0.05em] text-white lg:text-6xl">{stage.headline}</h1>
                    <p className="mt-5 text-lg leading-8 text-slate-300">{stage.body}</p>
                  </div>
                );
              })}
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl shadow-black/40">
              {storyStages.map((stage, index) => {
                const distance = Math.abs(stagePosition - index);
                return (
                  <img
                    key={stage.src}
                    src={stage.src}
                    alt={stage.alt}
                    className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-200 ease-out"
                    style={{ opacity: Math.max(0, 1 - distance), transform: `scale(${1.035 - Math.min(distance, 1) * 0.025}) translateY(${(index - stagePosition) * 1.5}%)` }}
                  />
                );
              })}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-8 left-6 right-6 flex items-center gap-4">
              <div className="flex gap-2">
                {storyStages.map((stage, index) => (
                  <span key={stage.label} className={`h-2 rounded-full transition-all duration-300 ${index === activeStage ? 'w-8 bg-leaf' : 'w-2 bg-white/30'}`} />
                ))}
              </div>
              <div className="h-px flex-1 bg-white/15" />
              <span className="text-xs font-black text-white/60">{activeStage + 1} / {storyStages.length}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-8 md:hidden">
        <div className="mx-auto max-w-xl space-y-8">
          {storyStages.map((stage, index) => (
            <Reveal key={stage.label}>
              <article className="overflow-hidden rounded-[2rem] border border-white/10 bg-white/5">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={stage.src} alt={stage.alt} loading={index === 0 ? 'eager' : 'lazy'} className="h-full w-full object-cover" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-leaf">{stage.label}</p>
                  <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{stage.headline}</h1>
                  <p className="mt-4 leading-7 text-slate-300">{stage.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

function Timeline() {
  const points = [
    ['Morgens', 'Frischer Bestand'],
    ['Nachmittags', 'Nachfrage sinkt'],
    ['Abends', 'Handlung nötig'],
    ['Ladenschluss', 'Abfallrisiko']
  ];
  return (
    <div className="mt-12 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-sm sm:p-9">
      <div className="relative h-2 rounded-full bg-gradient-to-r from-leaf via-amber/60 to-amber">
        <span className="timeline-dot absolute -top-2 h-6 w-6 rounded-full border-4 border-white bg-forest shadow-md" />
      </div>
      <div className="mt-7 grid grid-cols-2 gap-6 sm:grid-cols-4">
        {points.map(([time, label]) => (
          <div key={time}>
            <p className="text-sm font-black text-ink">{time}</p>
            <p className="mt-1 text-sm text-slate">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Flow() {
  const steps = ['Risiko erkennen', 'Aktion empfehlen', 'Team gibt frei', 'Angebot veröffentlichen', 'Wert sichern'];
  return (
    <div className="mt-12 grid gap-3 md:grid-cols-5">
      {steps.map((step, index) => (
        <div key={step} className="flow-step relative rounded-3xl border border-slate-100 bg-white p-5 text-center shadow-sm" style={{ animationDelay: `${index * 140}ms` }}>
          <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-mint text-sm font-black text-forest">{index + 1}</span>
          <p className="mt-4 font-black text-ink">{step}</p>
        </div>
      ))}
    </div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startedAt = useRef(Date.now());
  const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT || 'https://formspree.io/f/xykawdqv';
  const field = 'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-ink outline-none transition focus:border-leaf focus:ring-4 focus:ring-green-100';

  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    // Bots commonly fill hidden fields and submit forms immediately.
    if (formData.get('_gotcha') || Date.now() - startedAt.current < 3000) {
      setStatus('Bitte nehmen Sie sich einen Moment Zeit und senden Sie das Formular erneut.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Wird sicher gesendet...');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result?.errors?.[0]?.message);

      setStatus('Vielen Dank. Ihre Angaben wurden sicher gespeichert. Das DynoPrice-Team meldet sich, wenn es gut passt.');
      form.reset();
      startedAt.current = Date.now();
    } catch {
      setStatus('Das Absenden ist fehlgeschlagen. Bitte versuchen Sie es erneut oder schreiben Sie an hello@dynoprice.example.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form action={endpoint} method="POST" onSubmit={submit} className="mt-10 grid gap-5 rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft lg:grid-cols-2 lg:p-8">
      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Website nicht ausfüllen</label>
        <input id="website" name="_gotcha" type="text" tabIndex="-1" autoComplete="off" />
      </div>
      <input type="hidden" name="_subject" value="Neue DynoPrice-Webseitenanfrage" />
      <input type="hidden" name="_language" value="de" />
      <input name="name" className={field} required placeholder="Name *" />
      <input name="email" className={field} required type="email" placeholder="Email *" />
      <input name="company" className={field} required placeholder="Unternehmen / Organisation *" />
      <select name="role" className={field} required defaultValue="">
        <option value="" disabled>Ich bin *</option>
        {['Bäckerei-Inhaber/in oder Betreiber/in', 'Café-Inhaber/in oder Betreiber/in', 'Restaurantbetreiber/in', 'Gastronomiekette', 'Frischehändler/in', 'Investor/in', 'Partner/in', 'Sonstiges'].map(item => <option key={item}>{item}</option>)}
      </select>
      {[
        ['businessType', 'Betriebsart', ['Bäckerei', 'Café', 'Restaurant', 'Fast Food / QSR', 'Hotel / Catering', 'Lebensmittelhandel / Frischeprodukte', 'Sonstiges']],
        ['locations', 'Anzahl der Standorte', ['1', '2-5', '6-20', 'Mehr als 20']],
        ['challenge', 'Größte Herausforderung', ['Lebensmittelverschwendung reduzieren', 'Umsatz sichern', 'Margen verbessern', 'Manuelle Entscheidungen reduzieren', 'Investition / Partnerschaft']],
        ['pilot', 'Interesse an einem Pilotprojekt?', ['Ja', 'Vielleicht', 'Noch nicht']],
        ['interview', 'Dürfen wir Sie für ein kurzes Interview kontaktieren?', ['Ja', 'Nein']]
      ].map(([name, label, options]) => (
        <select key={name} name={name} className={field} defaultValue="">
          <option value="" disabled>{label}</option>
          {options.map(item => <option key={item}>{item}</option>)}
        </select>
      ))}
      <textarea name="message" className={`${field} min-h-36 lg:col-span-2`} required placeholder="Nachricht *" />
      <div className="lg:col-span-2">
        <button disabled={isSubmitting} className="rounded-full bg-forest px-7 py-4 font-bold text-white shadow-lg shadow-green-900/20 transition hover:-translate-y-0.5 hover:bg-green-800 disabled:cursor-wait disabled:opacity-60">
          {isSubmitting ? 'Wird gesendet...' : 'Interesse senden'}
        </button>
        <p className="mt-4 text-sm leading-6 text-slate">Für Lebensmittelbetriebe in Deutschland teilen wir möglicherweise zusätzlich einen kurzen 5-Minuten-Fragebogen zur Marktforschung.</p>
        <p className="mt-3 text-xs font-bold text-forest">Ihre Angaben werden sicher über Formspree gespeichert. Ein Spam-Schutz prüft Einsendungen automatisch.</p>
        {status && <p aria-live="polite" className="mt-4 rounded-2xl bg-mint p-4 font-bold text-forest">{status}</p>}
      </div>
    </form>
  );
}

export default function App() {
  return (
    <main>
      <Header />
      <Hero />

      <section id="problem" className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <SectionTitle eyebrow="Das Problem" title="Frische Lebensmittel verlieren schnell an Wert." copy="Jeden Tag bleiben in Bäckereien, Cafés und Restaurants Produkte übrig, die früher noch hätten verkauft werden können. Das Problem ist nicht nur Lebensmittelverschwendung. Es sind späte Entscheidungen." />
          <Timeline />
        </Reveal>
      </section>

      <section className="bg-ink px-5 py-24 text-white">
        <Reveal className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-leaf">Die Chance</p>
            <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">Verschwendung lässt sich oft verhindern, bevor sie entsteht.</h2>
          </div>
          <p className="text-lg leading-8 text-slate-300">Wenn die Nachfrage nachlässt oder der Tag sich dem Ende nähert, kann die richtige Aktion zum richtigen Zeitpunkt den Unterschied machen. Ein passendes Angebot kann Risiko in Umsatz verwandeln.</p>
        </Reveal>
      </section>

      <section id="solution" className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <SectionTitle eyebrow="Die DynoPrice-Lösung" title="DynoPrice hilft Teams, die nächste passende Aktion auszuwählen." copy="Lebensmittelbetriebe erhalten einfache Empfehlungen dazu, wann sie handeln, was sie anbieten und wo sie es veröffentlichen können. Das Team behält die Kontrolle und gibt jede Aktion frei." center />
          <Flow />
        </Reveal>
      </section>

      <section className="bg-slate-50 px-5 py-24">
        <Reveal className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Empfohlene Aktionen" title="Einfache Optionen für Produkte, die Aufmerksamkeit benötigen." center />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {actions.map(([title, copy]) => (
              <article key={title} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-xl font-black text-forest">+</span>
                <h3 className="mt-5 text-lg font-black text-ink">{title}</h3>
                <p className="mt-3 leading-7 text-slate">{copy}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <Reveal>
          <SectionTitle eyebrow="Verbundene Kanäle" title="Eine Empfehlung. Mehrere Kanäle." copy="Freigegebene Aktionen können für Angebote im Geschäft, Lieferplattformen, digitale Speisekarten oder lokale Aktionen vorbereitet werden. Ziel ist es, Kundinnen und Kunden dort zu erreichen, wo Nachfrage am wahrscheinlichsten entsteht." center />
          <div className="mt-12 flex flex-col items-center">
            <div className="rounded-3xl bg-forest px-7 py-5 font-black text-white shadow-lg">Freigegebene Empfehlung</div>
            <div className="h-12 w-px bg-green-200" />
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {channels.map(item => <div key={item} className="rounded-3xl border border-green-100 bg-mint p-6 text-center font-black text-forest">{item}</div>)}
            </div>
          </div>
        </Reveal>
      </section>

      <section id="impact" className="bg-mint/60 px-5 py-24">
        <Reveal className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Geschäftlicher Nutzen" title="Weniger Abfall. Besseres Timing. Mehr gesicherter Wert." center />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {impacts.map(([title, copy]) => <article key={title} className="rounded-3xl bg-white p-6 shadow-sm"><h3 className="font-black text-ink">{title}</h3><p className="mt-3 text-sm leading-6 text-slate">{copy}</p></article>)}
          </div>
        </Reveal>
      </section>

      <section id="pilot" className="bg-gradient-to-br from-forest to-ink px-5 py-24 text-white">
        <Reveal className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-black uppercase tracking-[0.24em] text-leaf">Pilotprogramm</p>
          <h2 className="text-3xl font-black tracking-[-0.035em] sm:text-5xl">Pilotprogramme sind für ausgewählte Betriebe verfügbar.</h2>
          <p className="mt-6 text-lg leading-8 text-green-50">Wir testen DynoPrice mit ausgewählten Lebensmittelbetrieben in klar begrenzten Pilotprojekten. Der Start kann mit einem Standort, einer Produktgruppe oder einem kleinen Teil der Speisekarte erfolgen.</p>
          <a href="#contact" className="mt-8 inline-flex rounded-full bg-white px-7 py-4 font-bold text-forest transition hover:-translate-y-0.5 hover:bg-mint">Für Pilotprojekt bewerben</a>
        </Reveal>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-24">
        <Reveal>
          <SectionTitle eyebrow="Gründer" title="Entwickelt von erfahrenen Produkt- und Betriebsexperten." center />
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {[['Arman Banihashemi', 'Mitgründer', 'Produktleiter mit Erfahrung in digitalen Produkten und betrieblichen Abläufen.'], ['Amir Mirmehrkar', 'Mitgründer', 'Erfahrener Produkt- und Plattformleiter mit Fokus auf skalierbare Systeme.']].map(([name, role, copy]) => (
              <article key={name} className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-black text-ink">{name}</h3><p className="mt-1 font-bold text-leaf">{role}</p><p className="mt-3 leading-7 text-slate">{copy}</p><a href="#" className="mt-4 inline-flex font-bold text-forest">LinkedIn-Platzhalter</a>
              </article>
            ))}
          </div>
        </Reveal>
      </section>

      <section id="contact" className="bg-slate-50 px-5 py-24">
        <Reveal className="mx-auto max-w-5xl">
          <SectionTitle eyebrow="Kontakt" title="Erzählen Sie uns von Ihrem Betrieb oder Ihrem Interesse." copy="Wir wählen derzeit Pilotpartner aus und sprechen mit potenziellen Kunden, Partnern und Investoren." center />
          <ContactForm />
        </Reveal>
      </section>

      <footer className="bg-ink px-5 py-12 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div><Logo inverse /><p className="mt-3 text-sm text-slate-300">Frühere Entscheidungen für weniger Lebensmittelverschwendung.</p></div>
          <div className="flex flex-wrap gap-5 text-sm font-bold text-slate-300">{navItems.map(([label, href]) => <a key={href} href={`#${href}`} className="hover:text-white">{label}</a>)}</div>
        </div>
      </footer>
    </main>
  );
}
