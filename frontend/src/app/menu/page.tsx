'use client';

import { useEffect } from 'react';

/* ── Menu data ─────────────────────────────────────────── */
const dishes = [
  {
    id: 'kaopad',
    name: 'KAOPAD',
    description: 'Riz sauté traditionnel aux légumes et aromates',
    image:
      'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=320&h=200&fit=crop&q=80',
    variants: [
      { name: 'Poulet', price: '10 €' },
      { name: 'Crevettes', price: '12 €' },
    ],
  },
  {
    id: 'kapao',
    name: 'KAPAO',
    description: 'Sauté au bœuf, basilic frais et piment',
    image:
      'https://images.unsplash.com/photo-1562802378-063ec186a863?w=320&h=200&fit=crop&q=80',
    variants: [{ name: 'Bœuf', price: '10 €' }],
  },
  {
    id: 'padthai',
    name: 'PAD THAI',
    description: 'Nouilles sautées, sauce tamarin et cacahuètes',
    image:
      'https://images.unsplash.com/photo-1559314809-0d155014e29e?w=320&h=200&fit=crop&q=80',
    variants: [
      { name: 'Poulet', price: '12 €' },
      { name: 'Crevettes', price: '14 €' },
    ],
  },
  {
    id: 'paneng',
    name: 'PANENG',
    description: 'Curry rouge crémeux au lait de coco',
    image:
      'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=320&h=200&fit=crop&q=80',
    variants: [{ name: 'Poulet', price: '10 €' }],
  },
  {
    id: 'massaman',
    name: 'MASSAMAN',
    description: 'Curry doux aux épices chaudes et cannelle',
    image:
      'https://images.unsplash.com/photo-1574484284002-952d92456975?w=320&h=200&fit=crop&q=80',
    variants: [{ name: 'Poulet', price: '12 €' }],
  },
  {
    id: 'padphak',
    name: 'PAD PHAK',
    description: 'Wok de légumes frais de saison',
    image:
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=320&h=200&fit=crop&q=80',
    variants: [
      { name: 'Légumes', price: '8 €' },
      { name: 'Crevettes', price: '10 €' },
    ],
  },
];

const starter = {
  name: 'SPRING ROLLS',
  description: 'Rouleaux croustillants aux légumes, sauce sucrée-piquante',
  image:
    'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=320&h=200&fit=crop&q=80',
  price: '5 €',
  note: '3 pièces',
};

/* ── Page ─────────────────────────────────────────────── */
export default function MenuPage() {
  useEffect(() => {
    document.title = 'Menu — Dark Kitchen Thaï';
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@400;600;700;800&display=swap');

        /* ── Screen wrapper ── */
        body { background: #2b2117 !important; }

        .menu-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 16px;
          gap: 16px;
        }

        .print-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 24px;
          background: #c9963a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-family: 'Montserrat', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.04em;
          transition: background 0.2s;
        }
        .print-btn:hover { background: #e0ab45; }
        .print-hint-text {
          color: #9e7a3a;
          font-size: 12px;
          margin-top: 8px;
          font-family: sans-serif;
          text-align: center;
        }

        /* ── A5 Paper sheet ── */
        .a5-sheet {
          width: 148mm;
          min-height: 210mm;
          background: #fff;
          box-shadow: 0 8px 40px rgba(0,0,0,0.5);
          font-family: 'Montserrat', sans-serif;
          color: #1c1410;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* ── Header ── */
        .menu-header {
          background: #1c1410;
          padding: 14px 20px 10px;
          text-align: center;
        }
        .menu-header::after {
          content: '';
          display: block;
          height: 3px;
          background: linear-gradient(90deg, transparent, #c9963a, transparent);
          margin-top: 10px;
        }
        .header-eyebrow {
          font-family: 'Cormorant Garamond', serif;
          font-size: 10px;
          letter-spacing: 0.3em;
          color: #c9963a;
          text-transform: uppercase;
          margin: 0 0 4px;
        }
        .header-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.12em;
          line-height: 1;
          margin: 0;
        }
        .header-subtitle {
          font-size: 8px;
          letter-spacing: 0.25em;
          color: #9e7a3a;
          text-transform: uppercase;
          margin: 5px 0 0;
        }
        .header-ornament {
          color: #c9963a;
          font-size: 14px;
          margin: 4px 0 0;
          letter-spacing: 8px;
        }

        /* ── Section divider ── */
        .section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px 6px;
        }
        .section-label span {
          font-size: 8px;
          font-weight: 800;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #9e7a3a;
          white-space: nowrap;
        }
        .section-label::before,
        .section-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e0d5c5;
        }

        /* ── Starter ── */
        .starter-section { padding: 0 14px 10px; }
        .starter-card {
          display: flex;
          gap: 10px;
          background: #fdf8f0;
          border: 1px solid #e8dcc8;
          border-radius: 8px;
          padding: 8px;
        }
        .starter-photo {
          width: 68px;
          height: 68px;
          object-fit: cover;
          border-radius: 6px;
          flex-shrink: 0;
        }
        .starter-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .starter-name {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          margin: 0 0 3px;
        }
        .starter-desc {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 9px;
          color: #7a6a58;
          margin: 0 0 5px;
          line-height: 1.3;
        }
        .starter-price-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .starter-note {
          font-size: 8px;
          color: #9e7a3a;
          font-weight: 600;
        }

        /* ── Dishes grid ── */
        .dishes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0;
          padding: 0 10px 10px;
          flex: 1;
        }
        .dish-card { padding: 5px; }
        .dish-photo {
          width: 100%;
          height: 74px;
          object-fit: cover;
          border-radius: 6px;
          display: block;
        }
        .dish-body { padding: 4px 2px 0; }
        .dish-name {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.18em;
          margin: 0 0 2px;
        }
        .dish-description {
          font-family: 'Cormorant Garamond', serif;
          font-size: 9px;
          color: #7a6a58;
          line-height: 1.3;
          margin: 0 0 4px;
          font-style: italic;
        }
        .dish-variants {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .variant-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 8.5px;
          font-weight: 600;
          color: #4a3a28;
        }
        .variant-price {
          background: #f5eede;
          color: #c9963a;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 8.5px;
        }

        /* ── Footer ── */
        .menu-footer {
          background: #1c1410;
          padding: 8px 20px;
          text-align: center;
          margin-top: auto;
        }
        .footer-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, #c9963a, transparent);
          margin-bottom: 7px;
        }
        .footer-text {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 9px;
          color: #9e7a3a;
          letter-spacing: 0.08em;
          margin: 0;
        }
        .footer-icons {
          font-size: 10px;
          margin: 4px 0 0;
          letter-spacing: 10px;
          color: #c9963a;
        }

        /* ── Print ── */
        @media print {
          body { background: #fff !important; margin: 0 !important; padding: 0 !important; }

          header, nav, footer,
          [class*="Header"], [class*="Footer"],
          [class*="header"], [class*="footer"] { display: none !important; }

          .print-btn, .print-hint-text { display: none !important; }

          .menu-wrapper {
            padding: 0 !important;
            gap: 0 !important;
            background: #fff !important;
            min-height: unset !important;
          }

          main {
            padding: 0 !important;
            margin: 0 !important;
            max-width: unset !important;
          }

          .a5-sheet {
            width: 148mm;
            min-height: 210mm;
            box-shadow: none !important;
            margin: 0 auto;
          }

          @page { size: A5 portrait; margin: 0; }
        }
      `}</style>

      <div className="menu-wrapper">
        {/* Screen-only controls */}
        <div>
          <button className="print-btn" onClick={() => window.print()}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" />
            </svg>
            Imprimer le menu (A5)
          </button>
          <p className="print-hint-text">
            Réglez l&apos;échelle à 100 % et choisissez le format A5 dans les options d&apos;impression
          </p>
        </div>

        {/* ── A5 Sheet ── */}
        <div className="a5-sheet">

          {/* Header */}
          <div className="menu-header">
            <p className="header-eyebrow">✦ Dark Kitchen ✦</p>
            <h1 className="header-title">THAI GARDEN</h1>
            <p className="header-subtitle">Cuisine Thaïlandaise Authentique</p>
            <p className="header-ornament">❧</p>
          </div>

          {/* Starter */}
          <div className="section-label"><span>Entrée</span></div>
          <div className="starter-section">
            <div className="starter-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={starter.image} alt={starter.name} className="starter-photo" />
              <div className="starter-body">
                <p className="starter-name">{starter.name}</p>
                <p className="starter-desc">{starter.description}</p>
                <div className="starter-price-row">
                  <span className="variant-price">{starter.price}</span>
                  <span className="starter-note">{starter.note}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main dishes */}
          <div className="section-label"><span>Plats</span></div>
          <div className="dishes-grid">
            {dishes.map((dish) => (
              <div key={dish.id} className="dish-card">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={dish.image} alt={dish.name} className="dish-photo" />
                <div className="dish-body">
                  <p className="dish-name">{dish.name}</p>
                  <p className="dish-description">{dish.description}</p>
                  <div className="dish-variants">
                    {dish.variants.map((v) => (
                      <span key={v.name} className="variant-pill">
                        {v.name}&nbsp;
                        <span className="variant-price">{v.price}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="menu-footer">
            <div className="footer-divider" />
            <p className="footer-text">
              Tous nos plats sont préparés à la commande · Bon appétit !
            </p>
            <p className="footer-icons">✦ ✦ ✦</p>
          </div>

        </div>
        {/* end a5-sheet */}
      </div>
    </>
  );
}
