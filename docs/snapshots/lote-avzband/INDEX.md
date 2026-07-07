# Evidencia — pilote snippet `s_avz_band` (banda separadora editable)

Primer snippet del módulo **registrado en el Website Builder** (vs D4 t-call-only).
Diseño a medida + editable desde el editor. Full-width, puro CSS/SVG, sin JS.

Commits del lote: `a9d74dc` scaffold+registro · `dd164da` estilo+duotono ·
`cbe93de` foto default (Aner) · `8053a23` fix editabilidad (estructura canónica).

## Screenshots

| Archivo | Qué muestra |
|---|---|
| `01-panel-avanzosc-category.png` | Editor con el panel de snippets (categoría «Avanzosc»). |
| `01b-panel-zoom.png` | Zoom: «Avanzosc» primera categoría, thumbnail «Av» propio. |
| `02-scratch-editmode.png` | Página scratch editable en modo edición. |
| `03-add-dialog.png` | Diálogo «Inserte un bloque»: «Banda Avanzosc» bajo la categoría Avanzosc con su preview. |
| `04-placed-block.png` | Estado del diálogo de inserción. |
| `05-band-duotone-desktop.png` | Duotono sobre raster ARBITRARIO (rainbow → azul de marca) — desktop. |
| `05-band-duotone-mobile.png` | Ídem responsive 390px. |
| `06-band-real-image-duotone.png` | Duotono sobre la foto industrial real de Aner. |
| `07-band-after-editability-fix.png` | Render tras el fix de estructura canónica (idéntico visualmente). |
| `08-proxy-swap-duotone.png` | Proxy del swap de imagen: imagen NUEVA distinta también sale en duotono (el tratamiento sobrevive al cambio de src). |
| `09-editor-button-location.png` | Ubicación del botón «Editor» v18 (triángulo esquina sup-izq). |

## Notas técnicas clave (ver decisions-log / comentarios en código)

- **Duotono `#avz-duotone`**: filtro SVG (def global en `<head>`), aplicado vía clase
  `.avz-duotone` en un `<style>` EMBEBIDO del head (no el bundle SCSS: Blink resuelve
  `filter: url(#id)` de hoja externa contra la URL de la hoja → roto).
- **Editabilidad**: `<img>` en flujo con clases `img img-fluid` (patrón canónico core);
  la versión previa (img en div absoluto, sin clase `img`) no era editable.
- **Acceso editor**: `/@/<url>` o el triángulo esquina sup-izq (login admin).
- Rasters de prueba y scratch page eran temporales — NO versionados.
