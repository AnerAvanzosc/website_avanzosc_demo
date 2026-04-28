# Cleanup operacional — Reconfiguración de idiomas del Website 1 a ES + EU

Fecha: 2026-04-28
Operación sobre BD `odoo14_community` (no afecta producción).

## Contexto

CLAUDE.md §11 «Idiomas» (D1): el website corporativo de Avanzosc opera
bilingüe ES + EU, con ES como idioma raíz (sin prefijo) y EU bajo `/eu/`.

Estado encontrado al iniciar Task 1.2 (header desktop + switcher idioma):
website 1 estaba configurado con **solo `en_US`** como único idioma. Demo
data residual de Odoo. Bloqueante para el switcher ES|EU del header.

## Acciones ejecutadas (orden)

Vía Odoo shell (no SQL crudo). Razón: Odoo gestiona constraints, side-effects
(menús traducidos, assets, etc.) que SQL crudo no dispara.

### 1. Activación de idiomas en `res.lang`

Estado pre:
- `en_US` (id=1): `active=True`.
- `es_ES` (id=77): `active=False`.
- `eu_ES` (id=5):  `active=False`.

```python
es_ES = env['res.lang'].with_context(active_test=False).search([('code', '=', 'es_ES')])
es_ES.write({'active': True})

eu_ES = env['res.lang'].with_context(active_test=False).search([('code', '=', 'eu_ES')])
eu_ES.write({'active': True})
```

### 2. `language_ids` del website 1 — añadir ES y EU

```python
website = env['website'].browse(1)
website.write({'language_ids': [(4, es_ES.id), (4, eu_ES.id)]})
```

Estado intermedio: `language_ids = [en_US, es_ES, eu_ES]`.

### 3. `default_lang_id` del website 1 — cambiar a es_ES

Cambio antes de quitar `en_US` para evitar dejar el campo en estado inválido.

```python
website.write({'default_lang_id': es_ES.id})
```

### 4. `language_ids` del website 1 — quitar en_US

```python
en_US = env['res.lang'].search([('code', '=', 'en_US')])
website.write({'language_ids': [(3, en_US.id)]})
env.cr.commit()
```

## Estado post-reconfiguración

```
website_lang_rel filtered website_id=1:
 lang_id |       name        | code  | active
---------+-------------------+-------+--------
      77 | Spanish / Español | es_ES | t
       5 | Basque / Euskara  | eu_ES | t
```

```
website default_lang:
 id |    name    | default_lang
----+------------+--------------
  1 | My Website | es_ES
```

`en_US` sigue `active=True` a nivel sistema (otros módulos / endpoints
admin lo usan), pero **ya no está vinculado al website 1** y por tanto
no aparecerá en el switcher de idioma del frontend.

Smoke verde tras la reconfiguración: `docs/smoke-tests/lang-cleanup.log`.

## Notas

- `en_US` permanece `active=True` en `res.lang` porque otros lugares de
  Odoo lo siguen usando (interfaz admin, módulos no relacionados con el
  website). Solo se ha desvinculado del website 1.
- Si en el futuro se decide reactivar `en_US` para el website (versión
  inglesa de la web), basta con `website.language_ids |= en_US`.
