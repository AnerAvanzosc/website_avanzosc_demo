# Q3 fase 2 — additions pendientes por Plausible Analytics (D25)

**Origen**: D25 (sesión 2026-05-04) — instalación de Plausible Cloud
hosted EU como solución analytics. Este archivo documenta los puntos
que el aviso legal y la política de privacidad **deben** incorporar
antes del envío a la asesoría legal externa (Fase 2 del flujo Q3).

## Contexto técnico (resumen para asesoría)

- **Producto**: Plausible Analytics Cloud (`plausible.io`).
- **Hosted**: EU (Frankfurt).
- **Cookies**: NO se establecen cookies en el navegador del visitante.
- **localStorage**: NO se usa.
- **Datos personales identificables**: NO se recogen (sin user IDs, sin
  fingerprinting individual; agregación por hash diario rotativo).
- **Datos recogidos**: URL de página, referrer, user-agent string,
  resolución de pantalla, código de país (no IP almacenada). Todos
  agregados en métricas anónimas.
- **Base legal RGPD**: interés legítimo (Art. 6.1.f) — análisis de
  audiencia agregada para mejorar la web sin afectar derechos del
  visitante. NO requiere consentimiento previo per opinión EDPB y
  posición CNIL/AEPD sobre analytics privacy-friendly.
- **Política de Plausible**: <https://plausible.io/data-policy>.

## Implementación en el módulo

- **Script**: inyectado en `<head>` desde `views/assets.xml`
  (`<template id="head_plausible" inherit_id="web.layout">`):
  `<script defer data-domain="avanzosc.es" src="https://plausible.io/js/script.404.outbound-links.js"></script>`.
- **Goal "Contact Form Submission"**: inline `<script>` en
  `views/pages/contacto_gracias.xml` que dispara `plausible('Contact Form Submission')`
  en `DOMContentLoaded`. Sólo se alcanza tras submit válido del form
  (post-redirect-get desde `/contacto/submit`).
- **Auto-tracking**: outbound-links (clicks a dominios externos) +
  404 (página /404 si en futuro se sirve una custom).

## Cambios pendientes en textos legales (Q3 fase 2)

### `/aviso-legal`

- Mencionar el uso de Plausible Analytics como herramienta de medición
  agregada de audiencia, hosted en la UE, sin cookies de tracking.

### `/politica-privacidad`

Dos puntos:

1. **Sección "Datos recogidos automáticamente"** (o equivalente — la
   estructura actual la decide la asesoría):
   - Añadir párrafo describiendo que la web utiliza Plausible Analytics
     para análisis agregado de audiencia.
   - Listar los datos recogidos: URL de página, referrer, código de
     país, user-agent (browser + OS), resolución de pantalla.
   - Aclarar explícitamente que NO se recogen datos personales
     identificables, NO se establecen cookies de tracking, NO se hace
     fingerprinting individual.
   - Indicar la base legal: interés legítimo (Art. 6.1.f RGPD).
   - Linkar a la política de datos de Plausible:
     <https://plausible.io/data-policy>.

2. **Posible sección "Encargado del tratamiento"** (decisión asesoría):
   - Plausible Insights OÜ (Estonia) actúa como encargado del
     tratamiento per Art. 28 RGPD. Hay un DPA estándar disponible en
     <https://plausible.io/dpa>.
   - Decidir si hace falta firmar el DPA explícitamente o si la
     adhesión por uso (Standard DPA Plausible) es suficiente per
     opinión legal.

### `/politica-cookies`

- **Confirmar que NO se añade Plausible a la tabla de cookies** —
  Plausible explícitamente no establece cookies. La tabla actual
  (sólo `visitor_uuid` per analytics propio agregado) no debería
  cambiar. Si la asesoría exige mencionarlo igualmente para
  transparencia, añadir nota textual «No se utilizan cookies para
  analytics; el medidor de audiencia (Plausible) opera sin cookies».

## Decisiones que sólo la asesoría puede tomar

- ¿Es suficiente el interés legítimo o exige consentimiento explícito
  para Plausible? La posición mainstream europea (CNIL, AEPD por
  alineación) es que analytics privacy-friendly sin cookies y sin
  fingerprinting individual NO requiere consentimiento. Confirmar.
- ¿Hace falta firma de DPA explícita con Plausible Insights OÜ o basta
  con el DPA estándar adherido por uso?
- Wording exacto para los 3 textos — la asesoría tiene la última palabra.

## Trigger de Q4 reapertura

Si en 6 meses post-switchover Plausible no aporta datos suficientes
para decisiones de negocio, D25 prevé añadir GA4 con consent banner
como segunda capa. Esa decisión reabriría también las implicaciones
legales (cookies, transferencia USA) — gate Q3' nuevo.
