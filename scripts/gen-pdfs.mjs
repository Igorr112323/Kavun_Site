/**
 * Генерация PDF: каталоги производителей и паспорта оборудования.
 * Шрифты лежат в scripts/fonts (сабсеты с кириллицей), поэтому сборка
 * воспроизводима на любой машине: node scripts/gen-pdfs.mjs
 */
import PDFDocument from 'pdfkit'
import fs from 'node:fs'
import path from 'node:path'

const FONTS = 'scripts/fonts'
const OUT = 'public/docs'
const INK = '#101310'
const PAPER = '#ece9e1'
const ACCENT = '#ff4d12'
const MUTED = '#6f746a'

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true })

function makeDoc() {
  const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true, info: { Title: 'Vip-service', Author: 'Vip-service' } })
  doc.registerFont('display', path.join(FONTS, 'OswaldSemi.ttf'))
  doc.registerFont('body', path.join(FONTS, 'OnestBook.ttf'))
  doc.registerFont('body-med', path.join(FONTS, 'OnestMed.ttf'))
  doc.registerFont('mono', path.join(FONTS, 'PlexMono-Medium.ttf'))
  return doc
}

const PAGE_W = 595.28
const PAGE_H = 841.89
const M = 48

function cover(doc, { brand, title, subtitle, meta, note }) {
  doc.rect(0, 0, PAGE_W, PAGE_H).fill(INK)

  // сетка
  doc.save()
  doc.strokeColor('#ffffff').opacity(0.05).lineWidth(0.5)
  for (let x = M; x < PAGE_W; x += 42) {
    doc.moveTo(x, 0).lineTo(x, PAGE_H).stroke()
  }
  doc.restore()

  doc.rect(M / 2, M / 2, PAGE_W - M, PAGE_H - M).lineWidth(0.7).strokeColor('#ffffff').opacity(0.18).stroke()
  doc.opacity(1)

  // знак
  const s = 22
  doc.save().translate(M, M + 4).lineWidth(1.4).strokeColor(PAPER)
  doc.rect(0, 0, s, s).stroke()
  doc.lineWidth(0.8).opacity(0.5).rect(s * 0.24, s * 0.24, s * 0.52, s * 0.52).stroke()
  doc.opacity(1).moveTo(s / 2, 0).lineTo(s / 2, s * 0.2).stroke()
  doc.moveTo(s / 2, s * 0.8).lineTo(s / 2, s).stroke()
  doc.strokeColor(ACCENT).moveTo(s * 0.72, s * 0.24).lineTo(s, s * 0.24).stroke()
  doc.moveTo(s * 0.72, 0).lineTo(s * 0.72, s * 0.24).stroke()
  doc.restore()

  doc.font('display').fontSize(15).fillColor(PAPER).text('VIP-SERVICE', M + 32, M + 6, { characterSpacing: 1.6 })
  doc.font('mono').fontSize(6.5).fillColor(MUTED).text('КРАСНОДАР · ПОЛЕВАЯ 43', M + 32, M + 24, { characterSpacing: 1.4 })

  doc.font('mono').fontSize(8).fillColor(MUTED).text('КАТАЛОГ ОБОРУДОВАНИЯ', M, 150, { characterSpacing: 2.4 })
  doc.moveTo(M, 166).lineTo(PAGE_W - M, 166).strokeColor('#ffffff').opacity(0.18).lineWidth(0.7).stroke()
  doc.opacity(1)

  let size = 64
  doc.font('display')
  while (doc.fontSize(size).widthOfString(brand) > PAGE_W - 2 * M && size > 26) size -= 2
  doc.fontSize(size).fillColor(PAPER).text(brand, M, 214, { characterSpacing: 0.5 })
  const bw = doc.widthOfString(brand)
  doc.rect(M, 214 + size * 0.82, bw, 3).fill(ACCENT)

  doc.font('mono').fontSize(9.5).fillColor(ACCENT).text(subtitle.toUpperCase(), M, 214 + size * 0.82 + 22, {
    characterSpacing: 1.6,
    width: PAGE_W - 2 * M,
  })

  doc.font('display').fontSize(41).fillColor(PAPER).text(title, M, 420, { lineGap: -6, width: PAGE_W - 2 * M })

  doc.moveTo(M, PAGE_H - 150).lineTo(PAGE_W - M, PAGE_H - 150).strokeColor('#ffffff').opacity(0.18).lineWidth(0.7).stroke()
  doc.opacity(1)
  doc.font('mono').fontSize(8).fillColor(MUTED).text(meta.join('   /   '), M, PAGE_H - 128, { characterSpacing: 1.4, width: PAGE_W - 2 * M })
  doc.font('body').fontSize(9).fillColor('#9aa094').text(note, M, PAGE_H - 104, { width: PAGE_W - 2 * M, lineGap: 2 })
}

function pageHead(doc, title, index) {
  doc.rect(0, 0, PAGE_W, 96).fill(INK)
  doc.font('display').fontSize(13).fillColor(PAPER).text('VIP-SERVICE', M, 34, { characterSpacing: 1.4 })
  doc.font('mono').fontSize(7).fillColor(MUTED).text('КРАСНОДАР · СТАРОКОРСУНСКАЯ · ПОЛЕВАЯ 43', M, 56, { characterSpacing: 1.2 })
  doc.font('mono').fontSize(8).fillColor(ACCENT).text(index, PAGE_W - M - 60, 38, { characterSpacing: 1.6, width: 60, align: 'right' })

  doc.font('display').fontSize(24).fillColor(INK).text(title, M, 132, { width: PAGE_W - 2 * M })
  doc.moveTo(M, 172).lineTo(PAGE_W - M, 172).strokeColor('#d8d4c8').lineWidth(0.8).stroke()
}

function specTable(doc, rows, y) {
  let cursor = y
  rows.forEach(([label, value], i) => {
    if (i % 2 === 0) doc.rect(M, cursor - 4, PAGE_W - 2 * M, 22).fill('#f4f2ec')
    doc.font('body').fontSize(9).fillColor(MUTED).text(label, M + 8, cursor + 2, { width: 300 })
    doc.font('mono').fontSize(8.5).fillColor(INK).text(value, PAGE_W - M - 220, cursor + 2, { width: 212, align: 'right' })
    cursor += 22
    doc.moveTo(M, cursor - 4).lineTo(PAGE_W - M, cursor - 4).strokeColor('#e2ded2').lineWidth(0.5).stroke()
  })
  return cursor
}

function paragraph(doc, text, y, opts = {}) {
  doc.font('body').fontSize(opts.size ?? 10).fillColor('#2a2e27').text(text, M, y, {
    width: opts.width ?? PAGE_W - 2 * M,
    lineGap: 4,
    align: 'left',
  })
  return doc.y
}

function contactsFooter(doc) {
  doc.moveTo(M, PAGE_H - 130).lineTo(PAGE_W - M, PAGE_H - 130).strokeColor('#d8d4c8').lineWidth(0.8).stroke()
  doc.font('mono').fontSize(7.5).fillColor(MUTED).text('VIP-SERVICE · ПРОМЫШЛЕННОЕ ОБОРУДОВАНИЕ ДЛЯ АЛЮМИНИЯ И ПВХ', M, PAGE_H - 112, { characterSpacing: 1 })
  doc.font('body-med').fontSize(12).fillColor(INK).text('+7 (988) 000-00-00', M, PAGE_H - 92)
  doc.font('body').fontSize(8.5).fillColor(MUTED).text('zakaz@vip-service23.ru · г. Краснодар, ст. Старокорсунская, ул. Полевая, 43', M, PAGE_H - 74)
  doc.font('mono').fontSize(7).fillColor('#9aa094').text('Документ сформирован автоматически и носит информационный характер. Не является публичной офертой.', M, PAGE_H - 56, { width: PAGE_W - 2 * M, characterSpacing: 0.3 })
}

async function writeDoc(doc, file) {
  const stream = fs.createWriteStream(path.join(OUT, file))
  doc.pipe(stream)
  doc.end()
  await new Promise((resolve) => stream.on('finish', resolve))
  const size = fs.statSync(path.join(OUT, file)).size
  console.log('pdf:', file, Math.round(size / 1024) + ' КБ')
}

/* ---------------- каталоги ---------------- */

const catalogs = [
  {
    file: 'catalog-elumatec-aluminium.pdf',
    brand: 'elumatec',
    subtitle: 'Оборудование для алюминия',
    title: 'Профиль. Точность. Серия.',
    meta: ['180 страниц', 'Редакция 2025', 'Русский'],
    note: 'Выборка по обрабатывающим центрам SBZ, пилам DG и прессовому инструменту. Полные технические таблицы — в разделах 3 и 4.',
    sections: [
      {
        title: 'Обрабатывающие центры SBZ',
        rows: [
          ['SBZ 122/75 · рабочая длина', '3 851 мм'],
          ['SBZ 122/75 · ход X / Y / Z', '4 176 / 1 040 / 540 мм'],
          ['SBZ 122/75 · поворот A / C', '±120° / ±220°, RTCP'],
          ['SBZ 122/75 · шпиндель', '7 кВт S1, 20 000 об/мин'],
          ['SBZ 140 · длины обработки', '4,2 / 7,6 / 9,7 м'],
          ['SBZ 140 · шпиндель', '11 кВт S1, 24 000 об/мин'],
          ['Точность позиционирования', '±0,1 мм'],
          ['Конус инструмента', 'HSK-F63 / HSK-63F'],
        ],
        text:
          'Серия SBZ закрывает окно целиком: паз под фурнитуру, отверстия под крепёж, дренаж, вентиляция и торцы под 45° за один установ. Поворотные оси работают одновременно с интерполяцией RTCP, поэтому наклонный паз не требует перестановки заготовки. Зажимы с линейными направляющими запоминают положение под каждую систему профиля.',
      },
      {
        title: 'Пилы DG и раскрой',
        rows: [
          ['DG 244 · диаметр диска', '550 мм'],
          ['DG 244 · мощность', '2 × 4 кВт'],
          ['DG 244 · частота вращения', '2 250 об/мин'],
          ['DG 244 · поворот голов', '90°–45° пневматически'],
          ['DG 244 · варианты длины реза', '4 500 / 6 000 мм'],
          ['DG 244/02 · подача', 'автоматическая'],
          ['Минимальная длина при 45°', '375 мм'],
          ['Масса', '1 850 кг'],
        ],
        text:
          'Двухголовые пилы для серийного раскроя. Пневматический поворот на 45°, промежуточные углы — по цифровой индикации с револьверным упором. Импульсная подача СОЖ: смазки хватает на смену, стружка не уходит в поддон вместе с эмульсией.',
      },
    ],
  },
  {
    file: 'catalog-elumatec-pvc.pdf',
    brand: 'elumatec',
    subtitle: 'Оборудование для ПВХ',
    title: 'Сварка. Зачистка. Линия.',
    meta: ['96 страниц', 'Редакция 2025', 'Русский'],
    note: 'Участок сварки и зачистки: от двухголового станка до автоматической линии с разгрузкой.',
    sections: [
      {
        title: 'Сварка ПВХ',
        rows: [
          ['Двухголовый станок', 'рамы до 2 000 × 1 900 мм'],
          ['Четырёхголовый станок', 'рамы до 3 050 × 2 490 мм'],
          ['Управление', 'ПК, Windows, база рецептов'],
          ['Оснастка', 'быстросменная, под профиль'],
          ['Опция', 'сварка с выборкой (notched)'],
          ['Интеграция', 'в линию сварки и зачистки'],
        ],
        text:
          'Профиль зажимается со всех сторон, нагрев и осадка идут по программе. Оператор выбирает систему профиля из базы, а не крутит параметры вручную — поэтому результат не зависит от смены.',
      },
      {
        title: 'Зачистка угла',
        rows: [
          ['Тип', 'стационарная, 4 оси'],
          ['Производительность', 'до 120 углов в час'],
          ['Инструмент', 'дисковые фрезы, сменные'],
          ['Подача', 'автоматическая, конвейер'],
        ],
        text:
          'Зачистка снимает шов до плоскости без «подпалин» и рисок. Сменный инструмент и настройка по шаблону: переход на другую систему профиля — 20–30 минут.',
      },
    ],
  },
  {
    file: 'catalog-emmegi-satellite-xte.pdf',
    brand: 'Emmegi',
    subtitle: 'Портальные центры Satellite XTE',
    title: 'Длинные заготовки без перехвата.',
    meta: ['32 страницы', 'Редакция 2025', 'Русский'],
    note: 'Планировки для 7,8 / 10,5 / 15,5 м, требования к фундаменту и примеры компоновки цеха.',
    sections: [
      {
        title: 'Satellite XTE',
        rows: [
          ['Ход X', '7 800 / 10 500 / 15 500 мм'],
          ['Ход Y / Z', '1 100 / 655 мм'],
          ['Поворот B / C', '0°–90° / 0°–360°'],
          ['Электрошпиндель', '15 кВт S1, 24 000 об/мин'],
          ['Конус', 'HSK-63F, момент 12 Нм'],
          ['Магазин на портале', '24 инструмента'],
          ['Скорость X / Y / Z', '75 / 60 / 40 м/мин'],
          ['Пильный диск', 'до 500 мм'],
        ],
        text:
          'Портал едет по рейке, заготовка стоит неподвижно: точность не зависит от длины профиля. Шпиндель 15 кВт держит фрезу Ø 80 мм и диск 500 мм — резка и обработка в одном цикле. Магазин закреплён на портале и едет вместе с ним, смена инструмента не останавливает цикл.',
      },
    ],
  },
  {
    file: 'catalog-stuertz-welding.pdf',
    brand: 'Stürtz',
    subtitle: 'Линии сварки и зачистки для ПВХ',
    title: 'Сварка до 3 050 миллиметров.',
    meta: ['64 страницы', 'Редакция 2025', 'Русский'],
    note: 'Сварочные станки HSM, автоматические линии, зачистка угла. Расчёт производительности под выпуск.',
    sections: [
      {
        title: 'Сварочные станки HSM',
        rows: [
          ['HSM-20/19-CDS · размер рамы', 'до 2 000 × 1 900 мм'],
          ['HSM-30/25-PDS · размер рамы', 'до 3 050 × 2 490 мм'],
          ['Мин. размер рамы', '305 × 305 мм'],
          ['Управление', 'ПК, Windows, база рецептов'],
          ['Оснастка', 'быстросменная, под профиль'],
          ['Опция', 'разгрузочный конвейер'],
          ['Интеграция', 'в линию сварки и зачистки'],
        ],
        text:
          'Горизонтальная четырёхголовая сварка под рамы и створки. Нагрев, осадка и остывание идут по программе; переход между системами профиля — замена оснастки за 20–30 минут. При необходимости станок стыкуется с зачисткой и разгрузкой: линия без ручных перегрузок.',
      },
    ],
  },
  {
    file: 'catalog-haffner-pvc.pdf',
    brand: 'Haffner',
    subtitle: 'Оборудование для ПВХ',
    title: 'Центры SBA. Сварка. Прессы.',
    meta: ['120 страниц', 'Редакция 2024', 'Русский'],
    note: 'Практичный выбор под объём: обрабатывающие центры, сварочные станки, прессы для армирования.',
    sections: [
      {
        title: 'Обрабатывающие центры SBA',
        rows: [
          ['Обрабатываемая длина', 'до 6 500 мм'],
          ['Сечение профиля', 'до 130 × 140 мм'],
          ['Мин. заготовка', '500 мм'],
          ['Установленная мощность', '15 кВт, 40 А'],
          ['Питание', '400 В, 3~'],
          ['Магазин заготовок', '10 профилей'],
          ['Операций за один проход', 'раскрой, дренаж, фурнитура'],
        ],
        text:
          'Станок заменяет три операции и снимает зависимость размера от оператора: раскрой идёт по программе. Подходит для цехов, которые собирают несколько систем профиля и не хотят держать три отдельных станка.',
      },
    ],
  },
]

for (const cat of catalogs) {
  const doc = makeDoc()
  cover(doc, cat)

  cat.sections.forEach((section, i) => {
    doc.addPage()
    pageHead(doc, section.title, String(i + 1).padStart(2, '0'))
    let y = paragraph(doc, section.text, 196)
    y = Math.max(y + 24, 320)
    const end = specTable(doc, section.rows, y)
    const boxY = Math.min(end + 26, PAGE_H - 240)
    doc.rect(M, boxY, PAGE_W - 2 * M, 74).fill('#f4f2ec')
    doc.rect(M, boxY, 3, 74).fill(ACCENT)
    doc.font('body-med').fontSize(9).fillColor(INK).text('Что уточнить перед заказом', M + 16, boxY + 14)
    doc
      .font('body')
      .fontSize(8.5)
      .fillColor(MUTED)
      .text(
        'Систему профиля, программу выпуска и размер цеха. По этим трём пунктам подбирается комплектация: зажимы, оснастка, магазин инструмента. Пришлите их — посчитаем конфигурацию и срок.',
        M + 16,
        boxY + 30,
        { width: PAGE_W - 2 * M - 32, lineGap: 2 }
      )
    contactsFooter(doc)
  })

  doc.addPage()
  pageHead(doc, 'Как мы поставляем', '03')
  paragraph(
    doc,
    'Станок приезжает на склад в Краснодаре, мы принимаем его, проверяем комплектацию и запускаем до передачи. Пусконаладка, обучение оператора и гарантия включены в стоимость. Поставка под заказ — от 12 до 18 недель в зависимости от модели; срок фиксируется в договоре.',
    196
  )
  doc.font('display').fontSize(13).fillColor(INK).text('ЭТАПЫ', M, 300, { characterSpacing: 1.2 })
  const steps = [
    ['01', 'Подбор', 'Считаем окупаемость по вашей программе выпуска и системе профиля.'],
    ['02', 'Договор', 'Фиксируем модель, комплектацию, срок и стоимость доставки.'],
    ['03', 'Приёмка', 'Проверяем комплектацию на складе, запускаем, снимаем параметры.'],
    ['04', 'Монтаж', 'Доставка, выставление по уровню, подключение, тестовая деталь.'],
  ]
  steps.forEach(([num, title, text], i) => {
    const yy = 326 + i * 62
    doc.font('mono').fontSize(9).fillColor(ACCENT).text(num, M, yy, { characterSpacing: 1 })
    doc.font('display').fontSize(13).fillColor(INK).text(title.toUpperCase(), M + 42, yy - 2, { characterSpacing: 0.6 })
    doc.font('body').fontSize(9).fillColor(MUTED).text(text, M + 42, yy + 16, { width: PAGE_W - 2 * M - 42 })
  })
  contactsFooter(doc)
  await writeDoc(doc, cat.file)
}

/* ---------------- паспорта оборудования ---------------- */

const passports = [
  {
    file: 'elumatec-sbz-122-75-passport.pdf',
    title: 'elumatec SBZ 122/75',
    subtitle: 'Паспорт и протокол приёмки',
    condition: 'Новое оборудование, 2025 год',
    rows: [
      ['Рабочая длина без торцевой обработки', '3 851 мм'],
      ['Ход по осям X / Y / Z', '4 176 / 1 040 / 540 мм'],
      ['Поворот оси A / C', '±120° / ±220°, RTCP'],
      ['Шпиндель', '7 кВт S1, 20 000 об/мин, HSK-F63'],
      ['Магазин инструмента', '12 позиций, автосмена'],
      ['Точность позиционирования', '±0,1 мм'],
      ['Питание', '400 В, 3~, 50 Гц, 25 А'],
      ['Габариты / масса', '7 643 × 2 171 × 3 000 мм / 3 800 кг'],
    ],
    note:
      'Станок новый, в пломбах. Приёмка на складе в Краснодаре: проверена комплектация, шпиндель запущен на холостом ходу, ошибок ЧПУ нет. Пусконаладка и обучение оператора включены в стоимость.',
    checks: [
      ['Комплектность', 'соответствует описи'],
      ['Шпиндель, холостой ход', 'без замечаний'],
      ['Пневматика', 'утечек нет'],
      ['Журнал ЧПУ', 'ошибок нет'],
    ],
  },
  {
    file: 'elumatec-dg-244-passport.pdf',
    title: 'elumatec DG 244',
    subtitle: 'Паспорт и протокол приёмки',
    condition: 'Новое оборудование, 2025 год',
    rows: [
      ['Диаметр пильного диска', '550 мм'],
      ['Частота вращения', '2 250 об/мин'],
      ['Мощность двигателей', '2 × 4 кВт'],
      ['Пневматический поворот', '90°–45°'],
      ['Варианты длины реза', '4 500 / 6 000 мм'],
      ['Минимальная длина при 45°', '375 мм'],
      ['Питание', '230/400 В, 3~, 50 Гц'],
      ['Масса', '1 850 кг'],
    ],
    note:
      'Проверена геометрия реза на профиле заказчика, углы 45° и 90° выставлены по поверочному угольнику. В комплекте два новых диска и один рабочий.',
    checks: [
      ['Геометрия реза', 'в допуске'],
      ['Углы 45° / 90°', 'выставлены'],
      ['Пневматика', 'утечек нет'],
      ['Охлаждение', 'подача равномерная'],
    ],
  },
  {
    file: 'emmegi-comet-r4-passport.pdf',
    title: 'Emmegi Comet R4',
    subtitle: 'Паспорт и протокол приёмки',
    condition: 'Новое оборудование, 2025 год',
    rows: [
      ['Ход X / Y / Z', '3 950 / 1 000 / 450 мм'],
      ['Поворот B / C', '−15°…+90° / ±360°'],
      ['Электрошпиндель', '8,5 кВт S1 / 10 кВт S6'],
      ['Частота вращения', 'до 24 000 об/мин'],
      ['Конус', 'HSK-63F, автосмена'],
      ['Длина заготовки', 'до 4 000 мм'],
      ['Питание', '400 В, 3~, 50 Гц'],
      ['Масса', '4 200 кг'],
    ],
    note:
      'Станок в кабине, подключён к вытяжке. Проверена обработка с пяти сторон за один установ на тестовом профиле. Демонстрация в работе — по записи.',
    checks: [
      ['Обработка 5 сторон', 'тест пройден'],
      ['Теплообменник шпинделя', 'в норме'],
      ['Кабина и блокировки', 'работают'],
      ['Геометрия после прогрева', 'в допуске'],
    ],
  },
  {
    file: 'emmegi-phantomatic-t3a-2019-passport.pdf',
    title: 'Emmegi Phantomatic T3 A, 2019',
    subtitle: 'Паспорт и протокол проверки б/у',
    condition: 'Б/У, 2019 год, 6 400 моточасов',
    rows: [
      ['Ход X / Y / Z', '4 300 / 270 / 300 мм'],
      ['Шпиндель', '5,5 кВт S1, 20 000 об/мин'],
      ['Конус', 'HSK-63F'],
      ['Магазин инструмента', '8 позиций'],
      ['Резьба', 'до M10'],
      ['Пневмозажимы', '4 шт.'],
      ['Биение шпинделя', '0,008 мм (допуск 0,01)'],
      ['Масса', '1 900 кг'],
    ],
    note:
      'Один владелец, работал на оконном профиле. Перед продажей заменены два пневмоцилиндра зажима и уплотнения, откалиброван люнет, обновлён софт, заменено масло в редукторах. Скол краски на правой стойке. Гарантия на механику — 3 месяца с даты передачи.',
    checks: [
      ['Биение шпинделя', '0,008 мм — норма'],
      ['Люфт осей', 'в допуске'],
      ['ШВП и направляющие', 'смазаны, износ равномерный'],
      ['Тестовая деталь', 'паз, дренаж, торец — норма'],
    ],
  },
  {
    file: 'emmegi-comet-r4-2018-passport.pdf',
    title: 'Emmegi Comet R4, 2018',
    subtitle: 'Паспорт и протокол проверки б/у',
    condition: 'Б/У, 2018 год, 11 200 моточасов',
    rows: [
      ['Ход X / Y / Z', '3 950 / 1 000 / 450 мм'],
      ['Поворот B / C', '−15°…+90° / ±360°'],
      ['Электрошпиндель', '8,5 кВт S1'],
      ['Частота вращения', '24 000 об/мин'],
      ['Конус', 'HSK-63F'],
      ['Сервисная книжка', 'есть, регламент соблюдён'],
      ['Точность после прогрева', '±0,1 мм'],
      ['Масса', '4 200 кг'],
    ],
    note:
      'Снят с производства из-за перехода цеха на портальный центр, не из-за поломки. Заменены уплотнения пневматики и два датчика положения, откалиброваны зажимы, обновлено ПО, заменены фильтры и теплообменник шпинделя. Протокол под нагрузкой: 6 часов фрезеровки, геометрия в допуске.',
    checks: [
      ['Нагрузочный тест', '6 часов — норма'],
      ['Геометрия после прогрева', '±0,1 мм'],
      ['Пневматика', 'перебрана'],
      ['Журнал ЧПУ', 'ошибок нет'],
    ],
  },
  {
    file: 'elumatec-sbz-140-2016-passport.pdf',
    title: 'elumatec SBZ 140, 2016, 4,2 м',
    subtitle: 'Паспорт и протокол проверки б/у',
    condition: 'Б/У, 2016 год',
    rows: [
      ['Длина обработки', '4 200 мм'],
      ['Ход X / Y / Z', '4 320 / 845 / 620 мм'],
      ['Ось A', '−90°…+90°'],
      ['Шпиндель', '11 кВт S1, 24 000 об/мин'],
      ['Конус', 'HSK-63F'],
      ['Магазин инструмента', '8 позиций'],
      ['Точность по концевой мере', '0,07 мм на 4 м'],
      ['Масса', '3 900 кг'],
    ],
    note:
      'Обслуживался нашей сервисной службой последние четыре года, история работ есть в базе. Заменены кабель-канал оси X, направляющие каретки и два концевых выключателя, отрегулирована смена инструмента. Требует замены уплотнения на левом зажиме — входит в цену.',
    checks: [
      ['Биение шпинделя', '0,006 мм'],
      ['Точность по концевой мере', '0,07 мм / 4 м'],
      ['Смена инструмента', 'отрегулирована'],
      ['Тестовая деталь', 'геометрия в допуске'],
    ],
  },
  {
    file: 'haffner-sba-4-passport.pdf',
    title: 'Haffner SBA 4',
    subtitle: 'Паспорт и протокол приёмки',
    condition: 'Новое оборудование, 2025 год',
    rows: [
      ['Обрабатываемая длина', 'до 6 500 мм'],
      ['Сечение профиля', 'до 130 × 140 мм'],
      ['Мин. длина заготовки', '500 мм'],
      ['Установленная мощность', '15 кВт, 40 А'],
      ['Питание', '400 В, 3~, 50 Гц'],
      ['Магазин заготовок', '10 профилей'],
      ['Пила', 'Ø 500 мм'],
      ['Масса', '3 200 кг'],
    ],
    note:
      'Станок на складе в Краснодаре, демонстрация в работе по записи. Приёмка: проверены три фрезерных узла, пила, автоматическая подача и магазин заготовок.',
    checks: [
      ['Подача заготовок', 'без заеданий'],
      ['Три узла фрезеровки', 'в норме'],
      ['Пила Ø 500', 'диск выставлен'],
      ['Журнал ЧПУ', 'ошибок нет'],
    ],
  },
]

for (const p of passports) {
  const doc = makeDoc()
  cover(doc, {
    brand: p.title,
    subtitle: p.subtitle,
    title: p.condition,
    meta: ['Протокол проверки', 'Краснодар', 'Полевая 43'],
    note: 'Документ подготовлен сервисной службой Vip-service. Содержит фактические параметры на дату проверки.',
  })

  doc.addPage()
  pageHead(doc, 'Технические характеристики', '01')
  specTable(doc, p.rows, 196)
  contactsFooter(doc)

  doc.addPage()
  pageHead(doc, 'Заключение механика', '02')
  paragraph(doc, p.note, 196)
  doc.font('display').fontSize(13).fillColor(INK).text('ЧТО ПРОВЕРЕНО', M, 330, { characterSpacing: 1.2 })
  p.checks.forEach(([label, value], i) => {
    const yy = 356 + i * 34
    doc.font('body').fontSize(9.5).fillColor(MUTED).text(label, M, yy)
    doc.font('mono').fontSize(8.5).fillColor(INK).text(value, PAGE_W - M - 240, yy, { width: 240, align: 'right' })
    doc.moveTo(M, yy + 20).lineTo(PAGE_W - M, yy + 20).strokeColor('#e2ded2').lineWidth(0.5).stroke()
  })
  doc.font('body').fontSize(8.5).fillColor(MUTED).text(
    'Подпись механика: ____________________     Дата: ____________     Печать сервисной службы',
    M,
    356 + p.checks.length * 34 + 28
  )
  contactsFooter(doc)
  await writeDoc(doc, p.file)
}
