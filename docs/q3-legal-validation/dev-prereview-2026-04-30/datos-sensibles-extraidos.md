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
| AEPD URL | `https://www.aepd.es/` | privacidad §7 | ✅ canónica verificada — `aepd.es` redirige 301 a `www.aepd.es/` (curl HEAD). Aplicado en commit del fix dev (ver sección «Aplicado» abajo). |

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

## Aplicado en commit (fix dev pre-asesoría)

Los 5 issues fixeables sin asesoría detectados en la pre-revisión inicial se resolvieron en un commit posterior `[IMP] q3: apply 5 dev-fixable legal issues identified in pre-review`. Mantenidos aquí como histórico de lo aplicado:

1. ✅ **LOPDGDD añadida al body de privacidad §1**. Párrafo introductorio antes del listado de datos del responsable: «En cumplimiento del Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo, de 27 de abril de 2016... y de la Ley Orgánica 3/2018, de 5 de diciembre, de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD), se informa de que el responsable del tratamiento es:».

2. ✅ **Política de Cookies §2: `<ul>` reemplazado por `<table class="table table-striped">`** con columnas Nombre / Propósito / Duración / Tipo. Fila `visitor_uuid` lleva comentario QWeb interno indicando que su clasificación (Análisis propio agregado) está pendiente decisión asesoría Q3 — gate explícito si la asesoría exige re-clasificación o consentimiento.

3. ✅ **Link clickable a /politica-cookies en privacidad §2**: `(ver Política de Cookies)` → `(ver <a href="/politica-cookies">Política de Cookies</a>)`.

4. ✅ **mailto: en aviso §1**: `comercial@avanzosc.es` → `<a href="mailto:comercial@avanzosc.es">comercial@avanzosc.es</a>`. Coherencia con privacidad §7.

5. ✅ **AEPD URL canónica**: `https://www.aepd.es` → `https://www.aepd.es/` (con barra final). Verificación previa: `curl -I https://aepd.es` → 301 → `https://www.aepd.es/`. La canónica per redirect oficial es la versión con `www` y barra final.

### Strings nuevas no en `i18n/eu.po` todavía

Los fixes 1 y 2 introducen strings nuevas en los templates QWeb que NO están en el `.po` actual (ni el script genérico Odoo las extrajo en `-u`). Lista de strings nuevas pendientes de extraer en una próxima fase de preparación del paquete asesoría (Q3 fase 2):

- Párrafo «En cumplimiento del Reglamento (UE) 2016/679... LOPDGDD...».
- Cabeceras tabla cookies: `Nombre`, `Propósito`, `Duración`, `Tipo`.
- Reorganización del cuerpo de las 3 filas de cookies (textos similares al `<ul>` previo pero recortados en celdas).
- Valores `Técnica`, `Análisis propio agregado`, `90 días`, `1 año`, `Sesión (se elimina al cerrar el navegador)`.

Estas strings serán visibles en los PDFs regenerados (fuente principal para el dev en esta fase). Para el XLSX prereview Q3 actual (23 entries del `.po`) se mantiene el conteo previo. Cuando se prepare el paquete formal a asesoría (Q3 fase 2), ejecutar `i18n_export` o añadirlas manualmente al `.po` con marker `LEGAL DRAFT - REVIEW NEEDED` y regenerar XLSX.

## Cosas que SOLO la asesoría puede decidir

1. **Decisión sobre DPO**: necesario o no, qué email/persona, si se publica.
2. **Inclusión Registro Mercantil**: sí/no según obligación legal de Avanzosc.
3. **Status legal `visitor_uuid`**: opt-out, banner consentimiento, o eximir. La tabla de cookies §2 ya marca esa fila como «Análisis propio agregado» pendiente de validación, con comentario QWeb interno indicando el gate.
4. **Cláusula de menores**: no presente; aplicable solo si Avanzosc trata datos de menores 14 años.
5. **Transferencias internacionales**: no presentes; aplicable solo si Avanzosc usa proveedores fuera EEE (e.g., AWS US, GCP US).
6. **Plazo conservación 12 meses**: privacidad §5 dice «máximo 12 meses desde último contacto». La asesoría debe confirmar si encaja con la actividad real de Avanzosc.

---

**Cuando termines de revisar**: marcar las casillas ☐ con ✅ y abrir incidencia (issue interno) por cada fila con problemas detectados. Devolver este MD junto al XLSX al equipo dev.
