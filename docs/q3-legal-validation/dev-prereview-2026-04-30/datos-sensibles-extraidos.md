# Datos sensibles extraídos de los templates legales

**Fecha de extracción**: 2026-04-30
**Fuente**: `views/pages/legal_aviso.xml`, `views/pages/legal_privacidad.xml`, `views/pages/legal_cookies.xml`
**Propósito**: pre-revisión del dev (Aner / orquestador). Confirmar uno por uno si los valores son CORRECTOS antes de mandar el paquete a asesoría legal externa.

## Datos identificativos de la empresa

| Dato | Valor encontrado | Aparece en | Verificar |
|------|------------------|------------|-----------|
| Razón social | `Avanzosc S.L.` | aviso §1 (titular), aviso §3 (condiciones uso), aviso §4 (propiedad intelectual), aviso §5 (responsabilidad), privacidad §1 (responsable), privacidad §2 (datos), privacidad §3 (finalidad), privacidad §6 (destinatarios), cookies §4 (cambios futuros) | ☐ |
| CIF | `B20875340` | aviso §1, privacidad §1 | ☐ |
| Domicilio | `Av. Julio Urkijo 34 bajo, 20720 Azkoitia, Gipuzkoa` | aviso §1, privacidad §1 | ☐ |
| Teléfono | `943 026 902` | aviso §1 | ☐ |
| Email contacto general | `comercial@avanzosc.es` | aviso §1, privacidad §1 (como email DPO de facto), privacidad §7 (canal ARCO+) | ☐ |
| Jurisdicción | `Tribunales de Azkoitia o Donostia (Gipuzkoa)` | aviso §6 | ☐ |
| AEPD URL | `https://www.aepd.es` | privacidad §7 | ☐ (ahora apunta a www.aepd.es; verificar si está canónica o si Avanzosc prefiere `aepd.es` sin www) |

## Datos NO encontrados que la asesoría puede pedir

| Dato | Estado | Comentario interno |
|------|--------|--------------------|
| Registro Mercantil (tomo, folio, hoja) | **NO presente** | Una S.L. típicamente lo incluye en aviso legal §1. La asesoría puede exigirlo. |
| Email DPO específico (ej. `dpo@avanzosc.es`) | **NO presente** | El comentario XML de `legal_aviso.xml:14` y `legal_privacidad.xml:11` lo marca como «placeholder hasta confirmar». Render usa `comercial@avanzosc.es`. La asesoría decide si Avanzosc requiere DPO formal según volumen y categorías de tratamiento. |
| Nombre del DPO | **NO presente** | Si se confirma DPO, normalmente se publica el nombre o departamento responsable. |

## Cookies declaradas

| Cookie | Tipo | Caducidad declarada | Aparece en | Verificar |
|--------|------|---------------------|------------|-----------|
| `session_id` | Técnica (Odoo, sesión) | 90 días, HttpOnly | cookies §2 | ☐ Caducidad coincide con curl real (`Max-Age=7776000s`)? |
| `frontend_lang` | Técnica (Odoo, idioma) | sesión (sin Expires) | cookies §2 | ☐ Verificar comportamiento real con curl en sesión limpia |
| `visitor_uuid` | Análisis propio agregado (Odoo `website.visitor`) | 1 año | cookies §2 | ☐ **Punto sensible**: la AEPD considera análisis propio sujeto a consentimiento informado salvo configuraciones específicas. La asesoría debe pronunciarse: opt-out, banner, o eximir |

## Enlaces externos a configuraciones de navegador

| Navegador | URL declarada | Verificar |
|-----------|---------------|-----------|
| Google Chrome | `https://support.google.com/chrome/answer/95647` | ☐ |
| Mozilla Firefox | `https://support.mozilla.org/es/kb/proteccion-mejorada-rastreo-firefox-ordenador` | ☐ |
| Apple Safari | `https://support.apple.com/es-es/guide/safari/sfri11471/mac` | ☐ |
| Microsoft Edge | `https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09` | ☐ |

## Marcos normativos referenciados

| Norma | Referencia exacta | Verificar |
|-------|-------------------|-----------|
| LSSI-CE | `Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico` (aviso §1) | ☐ |
| RGPD | `Reglamento UE 2016/679` (header XML) y referencia genérica «RGPD» en privacidad §subtítulo + §6 (art. 28) | ☐ |
| LOPDGDD | `Ley Orgánica 3/2018` (header XML, no en render) | ☐ Falta cita literal en el render del template (solo está en comentario XML) — la asesoría puede pedir que se añada al subtítulo o sección 1 |
| LSSI art. 22.2 | `Conforme al artículo 22.2 LSSI-CE...` (cookies §2) | ☐ |
| RGPD art. 28 | `...conforme al artículo 28 del RGPD` (privacidad §6) | ☐ |

## Cosas que el dev puede arreglar SIN asesoría

Detectadas durante la extracción. Anotadas para que el dev evalúe si vale la pena fixearlas antes de mandar a asesoría:

1. **LOPDGDD solo en comentario XML, no en render**. Privacidad §subtítulo dice «conforme al RGPD y la LOPDGDD» pero la cita literal de `Ley Orgánica 3/2018` solo aparece en el comentario interno. Considerar añadirla al subtítulo o sección 1.

2. **Política de Cookies sin tabla estructurada**. Las 3 cookies se listan en `<ul>` con bullets, no en tabla. Algunas asesorías prefieren tabla `<table>` con columnas Cookie / Tipo / Finalidad / Caducidad. No es obligatorio pero estructura mejor.

3. **`/politica-cookies` referenciada con texto plano «(ver Política de Cookies)»** en privacidad §2. No es link `<a href="/politica-cookies">`. Mejor convertirlo en link clickable.

4. **Email contacto sin `mailto:` en aviso §1** vs privacidad §7 que sí lo tiene como `<a href="mailto:...">`. Coherencia visual: añadir mailto en aviso §1.

## Cosas que SOLO la asesoría puede decidir

5. **Decisión sobre DPO**: necesario o no, qué email/persona, si se publica.
6. **Inclusión Registro Mercantil**: sí/no según obligación legal de Avanzosc.
7. **Status legal `visitor_uuid`**: opt-out, banner consentimiento, o eximir.
8. **Cláusula de menores**: no presente; aplicable solo si Avanzosc trata datos de menores 14 años.
9. **Transferencias internacionales**: no presentes; aplicable solo si Avanzosc usa proveedores fuera EEE (e.g., AWS US, GCP US).
10. **Plazo conservación 12 meses**: privacidad §5 dice «máximo 12 meses desde último contacto». La asesoría debe confirmar si encaja con la actividad real de Avanzosc.

---

**Cuando termines de revisar**: marcar las casillas ☐ con ✅ y abrir incidencia (issue interno) por cada fila con problemas detectados. Devolver este MD junto al XLSX al equipo dev.
