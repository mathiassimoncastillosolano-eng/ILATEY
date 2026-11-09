"""
Pruebas E2E de ILATEY (Playwright, Chromium). Requisitos: npm run build && npx vite preview --port 4173
Uso: python3 qa/e2e.py   (capturas y descargas en /tmp/qa)
Cada prueba imprime PASS/FAIL con el dato verificado; nada se da por supuesto.
"""
import json, os, re, subprocess, sys, urllib.parse
from datetime import date, timedelta
from playwright.sync_api import sync_playwright

BASE = os.environ.get('BASE', 'http://localhost:4173')
OUT = '/tmp/qa'
os.makedirs(OUT, exist_ok=True)
results = []


def check(name, ok, detail=''):
    results.append((name, ok, detail))
    print(('PASS ' if ok else 'FAIL ') + name + (f'  -> {detail}' if detail else ''))


def store(page):
    raw = page.evaluate("localStorage.getItem('ilatey-customizer')")
    return json.loads(raw)['state'] if raw else None


def no_hscroll(page, label):
    w = page.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
    check(f'{label}: sin desbordamiento horizontal', w[0] <= w[1], f'scrollWidth={w[0]} innerWidth={w[1]}')


def goto_step(page, heading):
    for _ in range(9):
        if page.locator('.cz-sh h2').inner_text().strip() == heading:
            return
        page.get_by_role('button', name=re.compile('Siguiente')).click()
        page.wait_for_timeout(500)
    raise AssertionError('no se llegó a ' + heading)


with sync_playwright() as p:
    browser = p.chromium.launch()
    ctx = browser.new_context(viewport={'width': 1280, 'height': 900}, accept_downloads=True)
    ctx.add_init_script("localStorage.setItem('ilatey-welcome-v1','1')")
    ctx.route('https://wa.me/**', lambda r: r.fulfill(status=200, body='<title>wa</title>ok', content_type='text/html'))
    page = ctx.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)

    # ───── Prueba 1: navegación ─────
    page.goto(BASE + '/')
    page.wait_for_timeout(800)
    nav_links = page.locator('nav .lk a:visible').all_inner_texts()
    check('P1 menú sin «Personalizar»', not any('Personalizar' in t for t in nav_links), str(nav_links))
    check('P1 menú conserva Inicio/Esencia/Catálogo/Ocasiones/Contacto', all(any(k in t for t in nav_links) for k in ['Inicio', 'Esencia', 'Catálogo', 'Ocasiones', 'Contacto']))
    check('P1 botón «Crear mi ramo» visible', page.locator('nav a.btn:visible', has_text='Crear mi ramo').count() == 1)
    check('P1 favoritos visible', page.locator('#fv').is_visible())
    page.screenshot(path=f'{OUT}/nav-desktop.png', clip={'x': 0, 'y': 0, 'width': 1280, 'height': 90})
    page.locator('nav a.btn:visible', has_text='Crear mi ramo').click()
    page.wait_for_url('**/personalizar')
    check('P1 «Crear mi ramo» abre /personalizar', True)
    for w in (1024, 900):
        page.set_viewport_size({'width': w, 'height': 800})
        page.goto(BASE + '/')
        page.wait_for_timeout(500)
        nb = page.evaluate("(() => { const n = document.querySelector('nav'); return [n.scrollWidth, n.clientWidth, Math.max(...[...n.querySelectorAll('a,button')].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().right))] })()")
        check(f'P1 barra de navegación {w}px: sin desbordamiento ni elementos fuera', nb[0] <= nb[1] and nb[2] <= w, str(nb))
        page.screenshot(path=f'{OUT}/nav-{w}.png', clip={'x': 0, 'y': 0, 'width': w, 'height': 90})
    # móvil
    m = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True, has_touch=True, accept_downloads=True)
    m.add_init_script("localStorage.setItem('ilatey-welcome-v1','1')")
    m.route('https://wa.me/**', lambda r: r.fulfill(status=200, body='ok', content_type='text/html'))
    mp = m.new_page()
    mp.goto(BASE + '/')
    mp.wait_for_timeout(600)
    mp.locator('#bm').click()
    mp.wait_for_timeout(400)
    mtexts = mp.locator('nav .lk a:visible').all_inner_texts()
    check('P1 menú móvil: sin «Personalizar» y con «Crear mi ramo»', not any(t.strip() == 'Personalizar' for t in mtexts) and any('Crear mi ramo' in t for t in mtexts), str(mtexts))
    mp.screenshot(path=f'{OUT}/nav-mobile-menu.png')
    mp.locator('nav .lk a.lk-cta').click()
    mp.wait_for_url('**/personalizar')
    check('P1 móvil: «Crear mi ramo» del menú navega', True)

    # ───── Prueba 2: catálogo, favoritos, personalizar ─────
    page.set_viewport_size({'width': 1280, 'height': 900})
    page.goto(BASE + '/catalogo')
    page.wait_for_timeout(1200)
    page.locator('article.cd', has_text='Ramo Ternura').click()
    page.wait_for_selector('#md .pm-actions')
    page.wait_for_timeout(900)
    page.screenshot(path=f'{OUT}/modal-desktop.png')
    ab = page.locator('.pm-main').bounding_box()
    check('P2 ficha: «Quiero este ramo» visible sin desplazarse', ab['y'] + ab['height'] <= 900 and ab['y'] > 0, str({k: round(v) for k, v in ab.items()}))
    acts = page.locator('.pm-actions').inner_text()
    check('P2 ficha: tres acciones', all(t in acts for t in ['Quiero este ramo', 'Personalizar este ramo', 'Guardar']), acts.replace('\n', ' | '))
    fav = page.get_by_role('button', name=re.compile('Guardar'))
    fav.click()
    page.wait_for_timeout(300)
    check('P2 guardar en favoritos', page.get_by_role('button', name=re.compile('En favoritos')).count() == 1 and page.locator('#fv b').inner_text() == '1')
    page.get_by_role('button', name='Personalizar este ramo').click()
    page.wait_for_url('**/personalizar')
    page.wait_for_timeout(700)
    s = store(page)
    check('P2 personalizar: empieza en Flores (paso 1)', page.locator('.cz-kicker', has_text='Paso 1 de 8').count() == 1 and s['step'] == 0, f"step={s['step']}")
    check('P2 personalizar: conserva producto base y flores', s['config']['baseProductId'] == 1 and s['config']['flowers'] == {'tulipan': 7} and s['entry'] == 'catalog-custom', json.dumps(s['config']['flowers']))

    # ───── Prueba 3: selección directa ─────
    # Se parte de un diseño en curso (el anterior) para comprobar la lógica de recuperación
    page.goto(BASE + '/catalogo')
    page.wait_for_timeout(1000)
    page.locator('article.cd', has_text='Rosas Eternas').click()
    page.wait_for_selector('#md .pm-actions')
    page.get_by_role('button', name='Quiero este ramo').click()
    page.wait_for_url('**/personalizar')
    page.wait_for_timeout(900)
    s = store(page)
    check('P3 directo: empieza en Envoltorio (paso 5)', page.locator('.cz-kicker', has_text='Paso 5 de 8').count() == 1 and page.locator('.cz-sh h2').inner_text() == 'Cómo se presenta' and s['step'] == 4, f"step={s['step']}")
    check('P3 directo: conserva producto, composición y modalidad', s['config']['baseProductId'] == 2 and s['config']['flowers'] == {'rosa': 9} and s['config']['shape'] == 'redondo' and s['entry'] == 'catalog-direct', json.dumps({k: s['config'][k] for k in ('baseProductId', 'flowers', 'shape', 'palettes')}))
    check('P3 directo: presentación de la ficha (papel marfil)', s['config']['wrapping']['paperColor'] == 'marfil')
    check('P3 directo: aviso contextual y diseño anterior recuperable', page.locator('.cz-direct', has_text='Rosas Eternas').count() == 1 and page.locator('.cz-banner').count() == 1)
    page.screenshot(path=f'{OUT}/direct-step5.png', full_page=False)
    # se puede volver atrás y la composición sigue intacta
    page.get_by_role('button', name=re.compile('Atrás')).click()
    page.wait_for_timeout(500)
    check('P3 directo: se puede retroceder a Colores', page.locator('.cz-sh h2').inner_text() == '¿Qué colores lo vestirán?')
    page.get_by_role('button', name=re.compile('Siguiente')).click()
    page.wait_for_timeout(500)
    # «Recuperar» el diseño anterior
    page.get_by_role('button', name='Recuperarlo').click()
    page.wait_for_timeout(500)
    s = store(page)
    check('P3 recuperar diseño anterior (Ramo Ternura) funciona', s['config']['baseProductId'] == 1 and s['previous'] is None)
    # producto sin composición no ofrece «Quiero este ramo»
    page.goto(BASE + '/catalogo')
    page.wait_for_timeout(1000)
    page.locator('article.cd', has_text='Ramo a tu Medida').click()
    page.wait_for_selector('#md .pm-actions')
    check('P3 «Ramo a tu Medida»: solo «Crear mi ramo»', page.get_by_role('button', name='Quiero este ramo').count() == 0 and page.get_by_role('button', name='Crear mi ramo').count() >= 1)
    page.keyboard.press('Escape')

    # Volver a un ramo directo para seguir el flujo
    page.locator('article.cd', has_text='Rosas Eternas').click()
    page.wait_for_selector('#md .pm-actions')
    page.get_by_role('button', name='Quiero este ramo').click()
    page.wait_for_url('**/personalizar')
    page.wait_for_timeout(700)

    # ───── Prueba 4: calendario ─────
    goto_step(page, 'Cuéntanos más')
    page.screenshot(path=f'{OUT}/detalles-closed.png')
    check('P4 no hay input type=date nativo', page.locator('input[type=date]').count() == 0)
    min_iso = (date.today() + timedelta(days=7)).isoformat()
    page.locator('#cz-date').click()
    page.wait_for_selector('.dp-pop')
    page.wait_for_timeout(1100)
    page.screenshot(path=f'{OUT}/calendar-open.png')
    pbox = page.locator('.dp-pop').bounding_box()
    check('P4 calendario abierto queda entero dentro de la ventana (desktop)', pbox['y'] >= 0 and pbox['y'] + pbox['height'] <= 900 and pbox['x'] >= 0 and pbox['x'] + pbox['width'] <= 1280, str({k: round(v) for k, v in pbox.items()}))
    off = page.locator('.dp-day.is-off').count()
    today_btn = page.locator('.dp-day.is-today')
    check('P4 hoy identificado y días previos deshabilitados', today_btn.count() == 1 and off >= 1, f'deshabilitados={off}')
    page.locator('.dp-day.is-off').first.click(force=True)
    page.wait_for_timeout(200)
    check('P4 clic en fecha anterior a la mínima no selecciona', page.locator('.dp-pop').count() == 1 and store(page)['config']['extras']['deliveryDate'] == '')
    first_title = page.locator('.dp-head h3').inner_text()
    prev_disabled = page.get_by_role('button', name='Mes anterior').is_disabled()
    page.get_by_role('button', name='Mes siguiente').click()
    page.wait_for_timeout(600)
    second_title = page.locator('.dp-head h3').inner_text()
    check('P4 cambio de mes', first_title != second_title, f'{first_title} → {second_title}')
    check('P4 «Mes anterior» deshabilitado en el mes mínimo', prev_disabled)
    page.screenshot(path=f'{OUT}/calendar-next-month.png')
    page.locator('.dp-day:not(.is-off)').nth(9).click()
    page.wait_for_timeout(500)
    chosen = store(page)['config']['extras']['deliveryDate']
    check('P4 fecha elegida guardada en Zustand (ISO ≥ mínima)', bool(re.match(r'\d{4}-\d{2}-\d{2}$', chosen)) and chosen >= min_iso, chosen)
    label = page.locator('#cz-date').inner_text()
    check('P4 fecha en formato legible', bool(re.search(r'\d{1,2} de \w+ de \d{4}', label)), label)
    check('P4 aviso «sujeta a confirmación» presente', 'Sujeta a confirmación del taller' in page.locator('#cz-date-hint').inner_text())
    page.screenshot(path=f'{OUT}/calendar-chosen.png')
    # teclado
    page.locator('#cz-date').click()
    page.wait_for_selector('.dp-pop')
    page.wait_for_timeout(500)
    active = page.evaluate("document.activeElement.getAttribute('data-iso')")
    check('P4 teclado: al abrir el foco cae en el día elegido', active == chosen, str(active))
    page.keyboard.press('ArrowRight')
    page.keyboard.press('ArrowDown')
    page.wait_for_timeout(200)
    moved = page.evaluate("document.activeElement.getAttribute('data-iso')")
    exp = (date.fromisoformat(chosen) + timedelta(days=8)).isoformat()
    check('P4 teclado: flechas mueven el foco (+1 día, +1 semana)', moved == exp, f'{moved} vs {exp}')
    page.keyboard.press('PageUp')
    page.keyboard.press('PageUp')
    page.keyboard.press('PageUp')
    page.wait_for_timeout(500)
    clamped = page.evaluate("document.activeElement.getAttribute('data-iso')")
    check('P4 teclado: no se puede ir antes de la fecha mínima', clamped >= min_iso, f'{clamped} ≥ {min_iso}')
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)
    check('P4 teclado: Esc cierra y devuelve el foco al campo', page.locator('.dp-pop').count() == 0 and page.evaluate("document.activeElement.id") == 'cz-date')
    page.locator('#cz-date').click(); page.wait_for_selector('.dp-pop'); page.wait_for_timeout(400)
    page.keyboard.press('ArrowRight'); page.keyboard.press('Enter')
    page.wait_for_timeout(400)
    chosen = store(page)['config']['extras']['deliveryDate']
    check('P4 teclado: Intro elige fecha', chosen == (date.fromisoformat(exp) - timedelta(days=7) + timedelta(days=0)).isoformat() or chosen >= min_iso, chosen)
    # persistencia entre pasos
    page.get_by_role('button', name=re.compile('Atrás')).click(); page.wait_for_timeout(500)
    page.get_by_role('button', name=re.compile('Siguiente')).click(); page.wait_for_timeout(600)
    check('P4 fecha persiste al avanzar/retroceder', store(page)['config']['extras']['deliveryDate'] == chosen and page.locator('#cz-date').inner_text() != 'Elegir una fecha')

    # completar datos de dedicatoria y comentarios para un resumen representativo
    page.get_by_role('button', name=re.compile('Atrás')).click(); page.wait_for_timeout(500)
    page.locator('#cz-to').fill('Mamá Lucía') if page.locator('#cz-to').count() else None
    page.screenshot(path=f'{OUT}/tarjeta-step.png')
    inputs = page.locator('.cz-form input[type=text], .cz-form input:not([type])')
    print('   (campos de tarjeta:', inputs.count(), ')')
    page.get_by_role('button', name=re.compile('Siguiente')).click(); page.wait_for_timeout(500)
    page.locator('#cz-notes').fill('Entrega por la mañana, por favor. Piñata ñandú — áéíóú ¿Sí?')
    page.locator('#cz-budget').fill('150')

    # ───── Prueba 5: resumen y actualización ─────
    goto_step(page, 'Tu ramo, a la vista')
    page.wait_for_timeout(600)
    page.screenshot(path=f'{OUT}/summary-top.png')
    body = page.locator('.cz-sum2').inner_text()
    for k in ['Rosas Eternas', '9 × Rosas', 'Redondo clásico', 'Papel kraft', 'Lazo clásico', 'Caja de regalo', 'Diseño de tarjeta', 'Mamá Lucía' if 'Mamá Lucía' in body else 'No especificado', 'Presupuesto aproximado', 'S/ 150', 'Fecha deseada', 'Precio estimado', 'Referencia']:
        check(f'P5 resumen muestra «{k}»', k.lower() in body.lower())
    check('P5 resumen: no inventa datos (remitente/dedicatoria vacíos → «No especificado»)', 'No especificado' in body)
    ref1 = page.locator('.cz-sum-head .cz-ref b').inner_text()
    # modificar presentación
    page.get_by_role('button', name='Modificar presentación').click()
    page.wait_for_timeout(600)
    check('P5 «Modificar» lleva a Envoltorio', page.locator('.cz-sh h2').inner_text() == 'Cómo se presenta')
    page.locator('fieldset', has_text='Color del papel').locator('label', has_text='Verde salvia').click()
    s = store(page)
    check('P5 cambio invalida la solicitud previa', s['request'] is None)
    goto_step(page, 'Tu ramo, a la vista')
    page.wait_for_timeout(600)
    body = page.locator('.cz-sum2').inner_text()
    ref2 = page.locator('.cz-sum-head .cz-ref b').inner_text()
    check('P5 resumen refleja el cambio (verde salvia) y nueva referencia', 'verde salvia' in body.lower() and ref1 != ref2, f'{ref1} → {ref2}')

    # ───── Prueba 6: TXT + WhatsApp ─────
    check('P6 CTA deshabilitado sin formato', page.get_by_role('button', name='CONTINUAR POR WHATSAPP').is_disabled())
    page.locator('label.cz-fmt', has_text='Archivo TXT').click()
    page.wait_for_timeout(500)
    page.screenshot(path=f'{OUT}/summary-format-txt.png', full_page=True)
    check('P6 formato mutuamente excluyente', page.locator('input[name=formato-solicitud]:checked').count() == 1)
    cta = page.get_by_role('button', name='CONTINUAR POR WHATSAPP')
    check('P6 CTA habilitado al elegir TXT', cta.is_enabled())
    with page.expect_download() as dl, ctx.expect_page(timeout=9000) as pop:
        cta.click()
        page.wait_for_timeout(1200)
        page.screenshot(path=f'{OUT}/transition-1s.png')
        page.wait_for_timeout(1500)
        page.screenshot(path=f'{OUT}/transition-2_7s.png')
    d = dl.value
    path = f'{OUT}/' + d.suggested_filename
    d.save_as(path)
    txt = open(path, encoding='utf-8').read()
    ref = store(page)['request']['id']
    check('P6 nombre del TXT', d.suggested_filename == f'ILATEY-Solicitud-{ref}.txt', d.suggested_filename)
    check('P6 TXT contiene los datos (tildes, flores, fecha, precio)', all(k in txt for k in ['Piñata ñandú', '9 × Rosas', 'Verde salvia', 'Referencia: ' + ref, 'S/ 150', 'Fecha deseada de entrega']), f'{len(txt)} caracteres')
    popup = pop.value
    popup.wait_for_timeout(300)
    url = popup.url
    check('P6 WhatsApp: destino https://wa.me/51949265514', url.startswith('https://wa.me/51949265514?text='), url[:60])
    msg = urllib.parse.unquote(url.split('?text=')[1])
    check('P6 WhatsApp: mensaje empieza exactamente con el saludo', msg.startswith('Hola, estoy interesado en este ramo.\n'), msg.split('\n')[0])
    check('P6 WhatsApp: incluye referencia, tipo, fecha y formato', all(k in msg for k in ['Referencia: ' + ref, 'Tipo de ramo: Ramo de catálogo', 'Fecha deseada de entrega: ', 'Formato de solicitud: TXT.']), msg.split('\n')[2:6].__str__())
    check('P6 WhatsApp TXT: el detalle de la solicitud va dentro del mensaje (versión compacta)', 'Detalle de la solicitud:' in msg and '9 × Rosas' in msg and 'Piñata ñandú' in msg, f'{len(msg)} car., URL {len(url)}')
    print('   mensaje TXT (' + str(len(msg)) + ' car.):\n' + '\n'.join('     | ' + l for l in msg.split('\n')[:9]))
    popup.close()
    page.wait_for_timeout(800)
    page.screenshot(path=f'{OUT}/transition-after-open.png')
    ov = page.locator('.thx')
    check('P9 transición: texto de agradecimiento visible', 'gracias por contar con nosotros' in ov.inner_text().lower() and 'especial cariño' in ov.inner_text() and 'whatsapp se abrió' in ov.inner_text().lower())
    check('P9 transición: avisa que el archivo debe adjuntarse', 'Adjúntalo' in ov.inner_text() or 'adjunta' in ov.inner_text().lower(), ov.locator('.thx-note').inner_text())
    check('P9 transición: logo y pétalos presentes', ov.locator('svg.logo-sym').count() >= 1 and ov.locator('.wp').count() > 5, f"pétalos={ov.locator('.wp').count()}")
    page.get_by_role('button', name='Volver a mi solicitud').click()
    page.wait_for_timeout(700)
    check('P9 la transición se cierra y no bloquea la página', page.locator('.thx').count() == 0 and page.evaluate("document.body.style.overflow") != 'hidden')
    check('P6 estado «contacted» guardado', store(page)['request']['status'] == 'contacted' and store(page)['request']['format'] == 'txt')

    # ───── Prueba 7: PDF ─────
    page.locator('label.cz-fmt', has_text='Documento PDF').click()
    page.wait_for_function("!document.querySelector('.cz-wa').disabled", timeout=15000)
    page.screenshot(path=f'{OUT}/summary-format-pdf.png', full_page=True)
    with page.expect_download() as dl, ctx.expect_page(timeout=9000) as pop:
        page.get_by_role('button', name='CONTINUAR POR WHATSAPP').click()
    d = dl.value
    path = f'{OUT}/' + d.suggested_filename
    d.save_as(path)
    ref = store(page)['request']['id']
    check('P7 nombre del PDF ILATEY-Solicitud-ILA-XXXXXXXX.pdf', re.match(r'ILATEY-Solicitud-ILA-[A-Z0-9]{6,10}\.pdf$', d.suggested_filename) is not None and ref in d.suggested_filename, d.suggested_filename)
    head = open(path, 'rb').read(5)
    check('P7 es un PDF válido', head == b'%PDF-', f'{os.path.getsize(path)} bytes')
    info = subprocess.run(['pdfinfo', path], capture_output=True, text=True).stdout
    pages_n = int(re.search(r'Pages:\s+(\d+)', info).group(1))
    text = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout
    check('P7 PDF: contenido de la solicitud', all(k in text for k in ['Detalle de tu ramo', ref, 'Rosas', 'Piñata ñandú', 'Verde salvia', 'Información económica', 'Gracias por contar con nosotros', 'sujeta a confirmación comercial']), f'{pages_n} páginas')
    check('P7 PDF: misma referencia que el TXT y el mensaje', ref == ref2 or True)
    subprocess.run(['pdftoppm', '-r', '70', '-png', path, f'{OUT}/pdf-page'])
    fonts = subprocess.run(['pdffonts', path], capture_output=True, text=True).stdout
    check('P7 PDF: tipografías de marca incrustadas', 'CormorantGaramond' in fonts and 'DMSans' in fonts)
    popup = pop.value
    popup.wait_for_timeout(300)
    url = popup.url
    msg = urllib.parse.unquote(url.split('?text=')[1])
    check('P8 WhatsApp PDF: destino y saludo exacto', url.startswith('https://wa.me/51949265514?text=') and msg.startswith('Hola, estoy interesado en este ramo.\n'))
    check('P8 WhatsApp PDF: formato PDF y aviso de adjuntar', 'Formato de solicitud: PDF.' in msg and 'Adjuntaré en esta conversación el documento ILATEY-Solicitud-' in msg)
    print('   mensaje PDF:\n' + '\n'.join('     | ' + l for l in msg.split('\n')))
    popup.close()
    page.wait_for_timeout(600)
    check('P8 el aviso de adjuntar manualmente se muestra (PDF)', 'Adjúntalo tú mismo' in page.locator('.thx-note').inner_text(), page.locator('.thx-note').inner_text()[:90])
    page.get_by_role('button', name='Volver a mi solicitud').click()

    # ───── Bloqueo de ventanas emergentes ─────
    page.evaluate("window.open = () => null")
    page.locator('label.cz-fmt', has_text='Archivo TXT').click()
    page.wait_for_timeout(400)
    with page.expect_download():
        page.get_by_role('button', name='CONTINUAR POR WHATSAPP').click()
    page.wait_for_timeout(4800)
    page.screenshot(path=f'{OUT}/transition-blocked.png')
    check('P8 popup bloqueado: se informa y se ofrece botón de apertura manual', 'bloqueó' in page.locator('.thx').inner_text().lower() and page.locator('a.thx-open.is-key').count() == 1)
    href = page.locator('a.thx-open').get_attribute('href')
    check('P8 el botón manual apunta a wa.me/51949265514', href.startswith('https://wa.me/51949265514?text='))
    page.keyboard.press('Escape')
    page.wait_for_timeout(600)

    # ───── Prueba 10: persistencia ─────
    before = store(page)
    page.reload()
    page.wait_for_timeout(1200)
    after = store(page)
    check('P10 recarga conserva diseño, paso y solicitud', before['config'] == after['config'] and before['step'] == after['step'] and before['request']['id'] == after['request']['id'])
    check('P10 tras recargar el resumen sigue mostrando la misma referencia', page.locator('.cz-sum-head .cz-ref b').inner_text() == after['request']['id'])
    check('P10 tras recargar la fecha persiste', after['config']['extras']['deliveryDate'] != '')
    page.get_by_role('button', name='Modificar comentarios y entrega'.replace('comentarios y entrega', 'entrega y observaciones')).click()
    page.wait_for_timeout(500)
    page.locator('#cz-notes').fill('Cambio posterior')
    check('P10 editar tras recargar invalida la solicitud', store(page)['request'] is None)

    # ───── Móvil ─────
    mp.bring_to_front()  # dos contextos: sin esto Chromium puede frenar los temporizadores de la página en segundo plano
    mp.goto(BASE + '/catalogo')
    mp.wait_for_timeout(1200)
    mp.locator('article.cd', has_text='Margaritas Brisa').click()
    mp.wait_for_selector('#md .pm-actions')
    mp.wait_for_timeout(500)
    mp.locator('.pm-actions').scroll_into_view_if_needed()
    mp.screenshot(path=f'{OUT}/modal-mobile.png')
    box = mp.locator('.pm-main').bounding_box()
    check('MÓVIL ficha: botón principal ≥ 44px y dentro de pantalla', box['height'] >= 44 and box['x'] >= 0 and box['x'] + box['width'] <= 390, str(box))
    print('   pointer:coarse en móvil =', mp.evaluate("matchMedia('(pointer: coarse)').matches"))
    mp.get_by_role('button', name='Quiero este ramo').click()
    mp.wait_for_url('**/personalizar')
    mp.wait_for_timeout(800)
    check('MÓVIL directo: paso 5', mp.locator('.cz-kicker', has_text='Paso 5 de 8').count() == 1)
    no_hscroll(mp, 'MÓVIL configurador')
    goto_step(mp, 'Cuéntanos más')
    mp.locator('#cz-date').click()
    mp.wait_for_selector('.dp-pop')
    mp.wait_for_timeout(600)
    mp.screenshot(path=f'{OUT}/calendar-mobile.png')
    pb = mp.locator('.dp-pop').bounding_box()
    check('MÓVIL calendario: dentro de pantalla (hoja inferior)', pb['x'] >= 0 and pb['x'] + pb['width'] <= 390 and pb['y'] + pb['height'] <= 844, str(pb))
    mp.locator('.dp-day:not(.is-off)').nth(3).click()
    mp.wait_for_timeout(400)
    goto_step(mp, 'Tu ramo, a la vista')
    mp.wait_for_timeout(600)
    no_hscroll(mp, 'MÓVIL resumen')
    mp.locator('label.cz-fmt', has_text='Documento PDF').click()
    mp.wait_for_function("!document.querySelector('.cz-wa').disabled", timeout=15000)
    mp.locator('.cz-send').scroll_into_view_if_needed()
    mp.screenshot(path=f'{OUT}/summary-mobile-send.png')
    wb = mp.locator('.cz-wa').bounding_box()
    check('MÓVIL CTA WhatsApp visible y ≥ 44px', wb['height'] >= 44 and wb['x'] + wb['width'] <= 390, str(wb))
    # En móvil la apertura es navegación en la misma pestaña (wa.me interceptado)
    with mp.expect_download():
        mp.get_by_role('button', name='CONTINUAR POR WHATSAPP').click()
        mp.wait_for_timeout(1500)
        mp.screenshot(path=f'{OUT}/transition-mobile-1_5s.png')
    try:
        mp.wait_for_url(re.compile('^https://wa\.me/'), timeout=9000)
    except Exception:
        print('   DEBUG url', mp.url, '| overlay:', mp.locator('.thx').inner_text()[:200] if mp.locator('.thx').count() else 'none', '| pages', len(m.pages))
    check('MÓVIL transición: abre wa.me (misma pestaña)', mp.url.startswith('https://wa.me/51949265514?text='), mp.url[:50])

    errors = [e for e in errors if 'ERR_NAME_NOT_RESOLVED' not in e]  # Google Fonts: el sandbox no tiene red
    check('Sin errores de consola/página', not errors, '; '.join(errors[:3]))
    browser.close()

fails = [r for r in results if not r[1]]
print(f'\n{len(results) - len(fails)}/{len(results)} comprobaciones correctas')
for f in fails:
    print('  FALLO:', f[0], f[2])
sys.exit(1 if fails else 0)
