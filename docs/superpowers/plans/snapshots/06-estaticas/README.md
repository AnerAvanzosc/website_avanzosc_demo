# Estáticas snapshots — Phase 6

Inicial: 2026-04-29. Capturas tras Phase 6 (7 páginas estáticas
restantes: `/conocenos`, `/trabaja-con-nosotros`, `/contacto`,
`/kit-consulting`, `/aviso-legal`, `/politica-privacidad`,
`/politica-cookies`). 7 ES + 1 EU de muestra (Conócenos) para
verificar el patrón i18n. Las legales bloquean switchover hasta
gate Q3 (revisión por asesoría legal Avanzosc); marcadas como
LEGAL DRAFT en el template.

**Artefactos del screenshot capture (transientes, NO afectan render real):**

- Override temporal de `overflow: hidden` en html/body/#wrapwrap a
  `visible` para que `fullPage` de Playwright capture el documento
  entero (sin esto queda clamped al primer viewport per Odoo's setup).
- Force `is-revealed` class en todos los `[data-avanzosc-reveal]`
  para neutralizar el initial-hidden state que IO toggle al scrollear.

Estos overrides son SOLO para la captura visual; el render en sesión
real funciona correctamente con sus IO observers naturales.

---

## conocenos-1280-es.png

**What it represents:** página `/conocenos` en castellano (lang `es_ES`).
Captura full-page con:

- Hero: claim «Implantamos Odoo en empresas industriales y de
  servicios, desde 2008.» + subtítulo «Sin teatros. Con resultados
  medibles.» + 2 CTAs («Ver valores» → `#valores`, «Hablar con
  nosotros» → `/contacto`).
- Sección Valores: grid 2×2 con los 4 valores definidos en sesión
  Phase 6 (Honestidad técnica, Comunidad OCA, Equipo STEM mayoritariamente
  femenino, Local pero conectado).
- Sección Historia: párrafo único no redundante con la timeline de la home.
- Sección Equipo: párrafo + link «Conoce al equipo →» con `href="/#equipo"`
  (anchor a `s_avanzosc_equipo` en home, que en Phase 6 incorpora
  `id="equipo"` para resolver este anchor).
- CTA Contacto: bloque dark `s_avanzosc_cta_contacto` reutilizado de Phase 4.

- **URL:** `http://localhost:14070/conocenos`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública (sin login)
- **Module commit:** Phase 6 closure HEAD (ver `git log`)
- **Date:** 2026-04-29

---

## conocenos-1280-eu.png

**What it represents:** página `/eu_ES/conocenos` en euskera. Mismo
layout que `conocenos-1280-es.png`. Las traducciones DRAFT añadidas
en Phase 6 a `i18n/eu.po` se aplican: claim, subtítulo, 4 CTAs/labels,
4 valores con título y texto, párrafo historia y bloque equipo + link
«Ezagutu taldea →». Footer y navbar también traducidos (Phase 1 + 2).

**Limitación conocida — slugs URL EU**: `/eu/ezagutu-gaitzazu` no
matchea en routing (mismo patrón que sectoriales). La captura usa
`/eu_ES/conocenos` (slug source-lang + prefix EU) que es la forma
actualmente accesible. Aliasing real diferido a Phase 7.

- **URL:** `http://localhost:14070/eu_ES/conocenos`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública
- **Module commit:** Phase 6 closure HEAD
- **Date:** 2026-04-29

---

## empleo-1280-es.png

**What it represents:** página `/trabaja-con-nosotros` en castellano.
Slug interno «trabaja-con-nosotros» preservado per CLAUDE.md §2 (label
del navbar es «Empleo» pero URL no cambia). Captura full-page con:

- Hero: «Trabaja con nosotros» + subtítulo + CTAs «Ver perfiles» (anchor
  `#perfiles`) y «Enviar CV» (mailto:comercial@avanzosc.es).
- Sección Por qué Avanzosc: 1 párrafo con el copy decidido en sesión.
- Sección Perfiles que buscamos siempre: lista de 5 perfiles con
  label en `<strong>` + descripción 1 línea (Odoo Python, funcional
  industrial, funcional distribución, soporte L2, prácticas STEM).
- Sección Vacantes activas: placeholder + inline mailto.

D1+D2 combinado per decisión sesión 2026-04-29 — perfiles abstractos
+ honestidad sobre estado de vacantes formales.

- **URL:** `http://localhost:14070/trabaja-con-nosotros`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública
- **Module commit:** Phase 6 closure HEAD
- **Date:** 2026-04-29

---

## contacto-1280-es.png

**What it represents:** página `/contacto` en castellano. Decisión
C3 (sin form) per sesión 2026-04-29 — solo CTAs directos y mapa.

- Hero: «¿Hablamos?» + subtítulo «Cuéntanos tu caso técnicamente.
  Respondemos en 24h laborables.».
- 3 canales en grid:
  - Email: `mailto:comercial@avanzosc.es`
  - Teléfono: `tel:+34943026902` con label «943 026 902»
  - Dirección: Av. Julio Urkijo 34 bajo, 20720 Azkoitia, Gipuzkoa
- Sección Cómo llegar: iframe OpenStreetMap embed centrado en
  Azkoitia (bbox aprox de Av. Julio Urkijo 34 bajo) + link «Ver mapa
  más grande en OpenStreetMap». NO Google Maps por GDPR.

- **URL:** `http://localhost:14070/contacto`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública
- **Module commit:** Phase 6 closure HEAD
- **Date:** 2026-04-29

---

## kit-consulting-1280-es.png

**What it represents:** página `/kit-consulting` en castellano.
**ES-only per D5** — el programa Red.es es estatal, audiencia
hispanohablante, contenido temporal. NO se traduce.

Estructura: hero + sección «El programa» (descripción genérica) +
sección «Requisitos generales» (5 bullets + disclaimer link a
kitconsulting.es) + CTA único «Hablar con Avanzosc» → `/contacto`.

NO se enlaza desde el navbar principal (CLAUDE.md §2: «Fuera del menú
principal»); el snippet `s_avanzosc_cta_kit_consulting` en home dirige
a esta página.

**Comportamiento al pedir EU**: `/eu_ES/kit-consulting` devuelve 200
con contenido ES como fallback (no hay msgid en eu.po para esta
página). Aceptado per D5: el contenido del programa Red.es se
mantiene en castellano aunque el lang cookie sea EU.

- **URL:** `http://localhost:14070/kit-consulting`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública
- **Module commit:** Phase 6 closure HEAD
- **Date:** 2026-04-29

---

## aviso-legal-1280-es.png

**What it represents:** página `/aviso-legal` en castellano.
**LEGAL DRAFT — REVIEW NEEDED BY LEGAL ADVISOR.**

Borrador inicial basado en plantilla estándar S.L. española (AEPD
adaptada). 6 secciones:
1. Titular del sitio (datos reales: Avanzosc S.L., CIF B20875340,
   domicilio, teléfono, email).
2. Finalidad del sitio.
3. Condiciones de uso.
4. Propiedad intelectual e industrial.
5. Responsabilidad.
6. Legislación aplicable y jurisdicción (Tribunales Azkoitia/Donostia).

Gate Q3: NO switchover sin revisión por asesoría legal. El texto
puede requerir adaptación a la actividad real contratada (datos
sobre formación regulada, condiciones de contratación electrónica
si se activan formularios, etc.).

- **URL:** `http://localhost:14070/aviso-legal`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública
- **Module commit:** Phase 6 closure HEAD
- **Date:** 2026-04-29

---

## privacidad-1280-es.png

**What it represents:** página `/politica-privacidad` en castellano.
**LEGAL DRAFT — REVIEW NEEDED BY LEGAL ADVISOR.**

Borrador inicial RGPD (Reglamento UE 2016/679) y LOPDGDD (Ley
Orgánica 3/2018) basado en plantilla AEPD adaptada. 7 secciones:
1. Responsable del tratamiento (datos reales).
2. Datos que tratamos (formulario / logs servidor / cookies técnicas).
3. Finalidad del tratamiento.
4. Base legal (consentimiento + interés legítimo + ejecución contrato).
5. Conservación (12 meses tras último contacto).
6. Destinatarios (no se ceden, art. 28 RGPD para encargados).
7. Derechos de los interesados (ARCO+ ejercicio + AEPD).

Gate Q3: NO switchover sin revisión legal. La descripción de
tratamientos puede requerir actualización si se activan formularios
CRM, newsletters o mecanismos analytics.

- **URL:** `http://localhost:14070/politica-privacidad`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública
- **Module commit:** Phase 6 closure HEAD
- **Date:** 2026-04-29

---

## cookies-1280-es.png

**What it represents:** página `/politica-cookies` en castellano.
**LEGAL DRAFT — REVIEW NEEDED BY LEGAL ADVISOR.**

Captura actualizada en sesión 2026-04-29 tras fix de la lista de
cookies para alinearla con la realidad técnica verificada (`curl -I
http://localhost:14070/`). Sin GA4 / Plausible / Matomo (decisión
[?] #4 spec aún pendiente, no bloqueante). 4 secciones:
1. Qué es una cookie.
2. Cookies utilizadas en este sitio: `session_id` (técnica, 90 días,
   `HttpOnly`), `frontend_lang` (técnica, sesión), `visitor_uuid`
   (análisis propio agregado emitido por `addons/website/models/
   website_visitor.py`, 1 año, identificador anónimo, sin perfilado
   individual). `fileToken` declarado en versión inicial Phase 6 fue
   eliminado por NO emitirse en sesión pública anónima.
3. Configuración por parte del usuario (links a navegadores).
4. Cambios futuros (frase «se actualizará si se incorporan herramientas
   no estrictamente técnicas»).

Gate Q3 + Gate [?] #4: NO switchover sin revisión legal. Atención
especial al status legal de `visitor_uuid` — la AEPD considera cookies
de análisis propio sujetas a consentimiento informado salvo
configuraciones específicas. Si la asesoría exige opt-out o desactivación,
requeriría intervención técnica (monkey-patch `_handle_webpage_dispatch`
o config Odoo) — fuera de scope v1.

- **URL:** `http://localhost:14070/politica-cookies`
- **Viewport:** 1280×800 px (fullPage extended)
- **Sesión:** pública
- **Module commit:** Phase 6 closure HEAD
- **Date:** 2026-04-29
