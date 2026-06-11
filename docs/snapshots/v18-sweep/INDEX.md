# v18 Sweep visual — F14 (2026-06-11)

Set completo de screenshots de la migración v18 para validación visual humana.
Servidor: `odoo18_avanzosc_web` local (`:18069`), rama `feature/v18-migration` @ `dcbe5d8`.
Console errors durante TODO el sweep: **0**.

## Desktop full-page (1280×800)

| Archivo | Estado capturado |
|---|---|
| `desktop-home-full.png` | Homepage entera post-animación entrance (todas las secciones reveladas) |
| `desktop-conocenos-full.png` | /conocenos completa (valores + historia + equipo) |
| `desktop-contacto-full.png` | /contacto completa (hero letter-stagger completado + form) |
| `desktop-kit-consulting-full.png` | /kit-consulting completa (ES-only) |
| `desktop-industrial-full.png` | Sectorial Industrial completa |
| `desktop-distribucion-full.png` | Sectorial Distribución completa |
| `desktop-servicios-full.png` | Sectorial Servicios completa |
| `desktop-academias-full.png` | Sectorial Academias completa |
| `desktop-aviso-legal-full.png` | Legal: aviso legal (draft pendiente Q3) |
| `desktop-politica-privacidad-full.png` | Legal: privacidad (draft pendiente Q3) |
| `desktop-politica-cookies-full.png` | Legal: cookies (draft pendiente Q3) |
| `desktop-home-eu.png` | Homepage en euskera (/eu_ES) — sync JSONB meta + i18n |

## Homepage por sección (viewport 1280×800, post-animación)

| Archivo | Estado capturado |
|---|---|
| `desktop-home-hero.png` | §1 Hero: claim con Splitting chars + anotaciones CAD + grid blueprint |
| `desktop-home-pilares.png` | §2 Pilares: contador 17 completado + OCA + STEM |
| `desktop-home-sectores.png` | §3 Sectores: grid isométrico 1500 cells + 4 cards |
| `desktop-home-kit.png` | §4 CTA Kit Consulting |
| `desktop-home-contador.png` | §5 Contador: 600+ / 4 / 100% completados |
| `desktop-home-caso-exito.png` | §6 Caso de éxito: dashboard SVG con bars + donut |
| `desktop-home-timeline-pin.png` | §7 Timeline DENTRO del pin a progress 0.57 (scroll-jack activo) |
| `desktop-home-equipo.png` | §8 Equipo: grid 8 cards |
| `desktop-home-cta-contacto.png` | §9 CTA contacto final (glow pulse en botón) |

## Estados interactivos (viewport)

| Archivo | Estado capturado |
|---|---|
| `desktop-home-sectores-hover.png` | Hover sobre card Industrial + cell del grid lit |
| `desktop-home-equipo-hover-ceo.png` | Hover sobre card CEO (is-hovered + dim del resto) |
| `desktop-home-pilares-hover-oca.png` | Hover sobre acronym OCA |

## Mobile (390×844)

| Archivo | Estado capturado |
|---|---|
| `mobile-home-full.png` | Homepage entera mobile (sectores grid oculto per media query, timeline modo no-pin) |
| `mobile-overlay.png` | Overlay menú mobile abierto (hamburger → accordion + lang switcher) |
| `mobile-conocenos-full.png` | /conocenos mobile |
| `mobile-contacto-full.png` | /contacto mobile |

## Verificaciones programáticas del sweep (no screenshot)

- `/eu_ES/` (trailing slash) → **HTTP 301 → /eu_ES** (cierre re-test F9 `ir_http._dispatch`).
- `/eu_ES` meta title: `Avanzosc · Odoo aholkulari industriala Azkoitian` (euskera, sync JSONB F6).
- Mobile: sectores boxes `display: none`, hamburger visible, timeline sin pin (0 ScrollTriggers — gating DESKTOP_MIN=768).
- Console errors en todas las páginas y viewports: **0**.

## Flags para review humana (anomalías detectadas de pasada)

1. **Título legal duplica marca**: las 3 páginas legales sirven `<title>Avanzosc · Aviso Legal | Avanzosc</title>` (patrón `Avanzosc · X | Avanzosc`). En las demás páginas el title es limpio (`Conócenos · Avanzosc`). Probable composición distinta del site-name suffix en v18 sobre `website_meta_title` ya prefijado. Cosmético, no blocker.
