import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Genera una ficha técnica PDF profesional con las 4 secciones de medidas.
 * Secciones: Delanteras · Brazo · Pantalón/Falda · Traseras
 * Optimizado para caber en una sola página A4 cuando sea posible.
 * 
 * @version 2.0.0 - Layout optimizado 2 columnas, pageBreak avoid, secciones vacías ocultas
 * @updated 2026-02-17
 * @param {object} client  - Datos del cliente (name, phone, email, gender...)
 * @param {object} measure - Datos de la medición (upper, arms, pants, lower, fitType, ...)
 * @param {object} studio  - Datos del taller (name, phone, website) — opcional
 */
export function generatePDF(client, measure, studio = {}) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const PAGE_W = doc.internal.pageSize.getWidth()
  const PAGE_H = doc.internal.pageSize.getHeight()
  const MARGIN = 14

  // ── Paleta de colores ──────────────────────────────────
  const OLIVE   = [138, 125, 60]
  const GOLD    = [201, 122, 30]
  const BLUE    = [59, 130, 246]
  const GREEN   = [34, 150, 80]
  const DARK    = [31, 41, 55]
  const GRAY    = [107, 114, 128]
  const LIGHT   = [219, 210, 176]
  const WHITE   = [255, 255, 255]

  let pageCount = 1
  const FOOTER_ZONE = 18 // espacio reservado para el pie

  // ── Helpers ────────────────────────────────────────────
  function drawFooter(pageNum) {
    const footerY = PAGE_H - 10
    doc.setDrawColor(...LIGHT)
    doc.setLineWidth(0.3)
    doc.line(MARGIN, footerY - 3, PAGE_W - MARGIN, footerY - 3)

    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)

    const studioName = studio.name || 'Atelier Elizabeth'
    doc.text(
      `${studioName} © ${new Date().getFullYear()} — Ficha técnica confidencial`,
      MARGIN, footerY
    )
    doc.text(`Página ${pageNum}`, PAGE_W - MARGIN, footerY, { align: 'right' })
  }

  function ensureSpace(needed) {
    if (y > PAGE_H - needed - FOOTER_ZONE) {
      drawFooter(pageCount)
      doc.addPage()
      pageCount++
      y = 15
    }
  }

  /** Convierte array de [label, value] a filas de 4 columnas (2 pares por fila) */
  function toDoubleRows(rows) {
    const result = []
    for (let i = 0; i < rows.length; i += 2) {
      const left  = rows[i]     || ['', '']
      const right = rows[i + 1] || ['', '']
      result.push([left[0], left[1], right[0], right[1]])
    }
    return result
  }

  /** Comprueba si una sección tiene al menos un valor */
  function hasData(rows) {
    return rows.some(([, v]) => v !== '—')
  }

  // Estilo compartido compacto para tablas de medidas
  const tableStyles = (accentColor, altBg) => ({
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: PAGE_W - MARGIN * 2,
    pageBreak: 'avoid',              // ← NUNCA partir tabla
    showHead:  'firstPage',
    styles: {
      fontSize:    8,
      cellPadding: { top: 2, bottom: 2, left: 3, right: 3 },
      textColor:   DARK,
      lineColor:   [229, 231, 235],
      lineWidth:   0.2,
      overflow:    'ellipsize',
    },
    headStyles: {
      fillColor:   accentColor,
      textColor:   WHITE,
      fontStyle:   'bold',
      halign:      'left',
      fontSize:    7.5,
      cellPadding: { top: 2.5, bottom: 2.5, left: 3, right: 3 },
    },
    alternateRowStyles: { fillColor: altBg },
    columnStyles: {
      0: { cellWidth: (PAGE_W - MARGIN * 2) * 0.30 },
      1: { cellWidth: (PAGE_W - MARGIN * 2) * 0.15, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: (PAGE_W - MARGIN * 2) * 0.35 },
      3: { cellWidth: (PAGE_W - MARGIN * 2) * 0.20, halign: 'center', fontStyle: 'bold' },
    },
  })

  /** Renderiza sección completa: barra de color + tabla */
  function renderSection(number, title, rows, color, altBg) {
    if (!hasData(rows)) return // Omitir secciones sin datos

    ensureSpace(28)

    // Barra de sección compacta
    const barH = 6
    doc.setFillColor(...color)
    doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, barH, 1.5, 1.5, 'F')
    doc.setFontSize(8.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...WHITE)
    doc.text(`${number}. ${title}`, MARGIN + 3, y + 4.2)
    y += barH + 2

    // Tabla
    autoTable(doc, {
      startY: y,
      head:   [['Medida', 'Valor', 'Medida', 'Valor']],
      body:   toDoubleRows(rows),
      ...tableStyles(color, altBg),
    })
    y = doc.lastAutoTable.finalY + 3 // Reducido de 5 a 3 para mejor spacing
  }

  // ══════════════════════════════════════════════════════
  //  CABECERA
  // ══════════════════════════════════════════════════════
  doc.setFillColor(...OLIVE)
  doc.rect(0, 0, PAGE_W, 28, 'F')

  doc.setTextColor(...WHITE)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(studio.name || 'Atelier Elizabeth', MARGIN, 12)

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Ficha Técnica de Medidas', MARGIN, 18)

  doc.setFontSize(8)
  doc.text(
    format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es }),
    PAGE_W - MARGIN, 18, { align: 'right' }
  )

  // Línea dorada
  doc.setFillColor(...GOLD)
  doc.rect(0, 28, PAGE_W, 2, 'F')

  // ══════════════════════════════════════════════════════
  //  DATOS DEL CLIENTE (tabla compacta)
  // ══════════════════════════════════════════════════════
  let y = 36

  const genderLabel = { femenino: 'Fem.', masculino: 'Masc.', otro: 'Otro' }

  // Preparar datos para una auto-table de 4 columnas
  const infoLeft = [
    ['Nombre', client.name || '—'],
    ['Teléfono', client.phone || '—'],
    ['Email', client.email || '—'],
  ]
  const infoRight = [
    ...(measure?.fitType       ? [['Ajuste', measure.fitType]] : []),
    ...(measure?.suggestedSize ? [['Talla', measure.suggestedSize]] : []),
    ...(measure?.fabricType    ? [['Tela', measure.fabricType]] : []),
    ...(measure?.label         ? [['Sesión', measure.label]] : []),
    ...(client.gender          ? [['Género', genderLabel[client.gender] || client.gender]] : []),
  ]

  const maxInfo = Math.max(infoLeft.length, infoRight.length)
  const infoBody = []
  for (let i = 0; i < maxInfo; i++) {
    const l = infoLeft[i]  || ['', '']
    const r = infoRight[i] || ['', '']
    infoBody.push([l[0], l[1], r[0], r[1]])
  }

  autoTable(doc, {
    startY: y,
    body:   infoBody,
    margin: { left: MARGIN, right: MARGIN },
    tableWidth: PAGE_W - MARGIN * 2,
    showHead: false,
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 1.8, bottom: 1.8, left: 3, right: 3 },
      textColor: GRAY,
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: (PAGE_W - MARGIN * 2) * 0.14, fontStyle: 'bold', textColor: DARK },
      1: { cellWidth: (PAGE_W - MARGIN * 2) * 0.36 },
      2: { cellWidth: (PAGE_W - MARGIN * 2) * 0.14, fontStyle: 'bold', textColor: DARK },
      3: { cellWidth: (PAGE_W - MARGIN * 2) * 0.36 },
    },
    alternateRowStyles: { fillColor: [250, 249, 245] },
  })
  y = doc.lastAutoTable.finalY + 4

  // ══════════════════════════════════════════════════════
  //  SECCIONES DE MEDIDAS
  // ══════════════════════════════════════════════════════
  const upper = measure?.upper || {}
  const arms  = measure?.arms  || {}
  const pants = measure?.pants || {}
  const lower = measure?.lower || {}

  // 1 ─ Medidas Delanteras
  const upperRows = [
    ['Contorno de cuello',      upper.contornoCuello     ? `${upper.contornoCuello} cm`     : '—'],
    ['Contorno sobre busto',    upper.contornoSobreBusto ? `${upper.contornoSobreBusto} cm` : '—'],
    ['Contorno de busto',       upper.contornoBusto      ? `${upper.contornoBusto} cm`      : '—'],
    ['Contorno bajo busto',     upper.contornoBajoBusto  ? `${upper.contornoBajoBusto} cm`  : '—'],
    ['Contorno de cintura',     upper.contornoCintura    ? `${upper.contornoCintura} cm`    : '—'],
    ['Contorno de cadera',      upper.contornoCadera     ? `${upper.contornoCadera} cm`     : '—'],
    ['Hombros',                 upper.hombros            ? `${upper.hombros} cm`            : '—'],
    ['Ancho de hombro',         upper.anchoHombro        ? `${upper.anchoHombro} cm`        : '—'],
    ['Caída de hombro',         upper.caidaHombro        ? `${upper.caidaHombro} cm`        : '—'],
    ['Ancho de busto',          upper.anchoBusto         ? `${upper.anchoBusto} cm`         : '—'],
    ['Altura de busto',         upper.alturaBusto        ? `${upper.alturaBusto} cm`        : '—'],
    ['Altura de cadera',        upper.alturaCapdera      ? `${upper.alturaCapdera} cm`      : '—'],
    ['Largo de talle',          upper.largoTalle         ? `${upper.largoTalle} cm`         : '—'],
    ['Largo talle centro',      upper.largoTalleCentro   ? `${upper.largoTalleCentro} cm`   : '—'],
  ]
  renderSection('1', 'Medidas Delanteras', upperRows, OLIVE, [247, 246, 240])

  // 2 ─ Medidas de Brazo
  const armRows = [
    ['Largo de brazo',      arms.largoBrazo     ? `${arms.largoBrazo} cm`     : '—'],
    ['Contorno de bíceps',  arms.contornoBiceps ? `${arms.contornoBiceps} cm` : '—'],
    ['Bajo el brazo',       arms.bajoElBrazo    ? `${arms.bajoElBrazo} cm`    : '—'],
    ['Contorno de codo',    arms.contornoCodo   ? `${arms.contornoCodo} cm`   : '—'],
    ['Contorno de muñeca',  arms.contornoMuneca ? `${arms.contornoMuneca} cm` : '—'],
    ['Contorno de puño',    arms.contornoPuno   ? `${arms.contornoPuno} cm`   : '—'],
  ]
  renderSection('2', 'Medidas de Brazo', armRows, BLUE, [239, 246, 255])

  // 3 ─ Medidas de Pantalón / Falda
  const pantsRows = [
    ['Contorno de cintura',  pants.contornoCintura ? `${pants.contornoCintura} cm` : '—'],
    ['Altura de cadera',     pants.alturaCadera    ? `${pants.alturaCadera} cm`    : '—'],
    ['Contorno de cadera',   pants.contornoCadera  ? `${pants.contornoCadera} cm`  : '—'],
    ['Altura de asiento',    pants.alturaAsiento   ? `${pants.alturaAsiento} cm`   : '—'],
    ['Largo de pantalón',    pants.largoPantalon   ? `${pants.largoPantalon} cm`   : '—'],
    ['Largo de falda',       pants.largoFalda      ? `${pants.largoFalda} cm`      : '—'],
  ]
  renderSection('3', 'Pantalón / Falda', pantsRows, GREEN, [240, 253, 244])

  // 4 ─ Medidas Traseras
  const lowerRows = [
    ['Largo talle trasero',      lower.largoTalleTrasero     ? `${lower.largoTalleTrasero} cm`     : '—'],
    ['Ancho hombros trasero',    lower.anchoHombrosTrasero   ? `${lower.anchoHombrosTrasero} cm`   : '—'],
    ['Largo centro trasero',     lower.largoCentroTrasero    ? `${lower.largoCentroTrasero} cm`    : '—'],
    ['Reboque de cuello',        lower.reboqueCuelloTrasero  ? `${lower.reboqueCuelloTrasero} cm`  : '—'],
    ['Largo caída trasero',      lower.largoCaidaTrasero     ? `${lower.largoCaidaTrasero} cm`     : '—'],
    ['Ancho tórax trasero',      lower.anchoToraxTrasero     ? `${lower.anchoToraxTrasero} cm`     : '—'],
    ['Ancho omóplatos trasero',  lower.anchoOmoplatosTrasero ? `${lower.anchoOmoplatosTrasero} cm` : '—'],
    ['Ancho cintura trasero',    lower.anchoCinturaTrasero   ? `${lower.anchoCinturaTrasero} cm`   : '—'],
  ]
  renderSection('4', 'Medidas Traseras', lowerRows, GOLD, [253, 248, 240])

  // ══════════════════════════════════════════════════════
  //  RESUMEN
  // ══════════════════════════════════════════════════════
  const allRows = [upperRows, armRows, pantsRows, lowerRows]
  const totalMeasures = allRows.flat().filter(([, v]) => v !== '—').length

  ensureSpace(10)
  y -= 4 // Acercar más el resumen a la última sección
  
  doc.setFillColor(247, 246, 240)
  doc.setDrawColor(...LIGHT)
  const sw = PAGE_W - MARGIN * 2
  doc.roundedRect(MARGIN, y, sw, 8, 1.5, 1.5, 'FD')

  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...OLIVE)

  const bits = [
    `Medidas: ${totalMeasures}/34`,
    measure?.fitType       ? `Ajuste: ${measure.fitType}` : null,
    measure?.suggestedSize ? `Talla: ${measure.suggestedSize}` : null,
    measure?.fabricType    ? `Tela: ${measure.fabricType}` : null,
  ].filter(Boolean)

  const spacing = sw / (bits.length + 1)
  bits.forEach((txt, i) => {
    doc.text(txt, MARGIN + spacing * (i + 1), y + 5.2, { align: 'center' })
  })
  y += 8

  // ══════════════════════════════════════════════════════
  //  NOTAS TÉCNICAS
  // ══════════════════════════════════════════════════════
  if (measure?.technicalNotes) {
    ensureSpace(22)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.setTextColor(...DARK)
    doc.text('Notas Técnicas', MARGIN, y)
    y += 4

    doc.setDrawColor(...LIGHT)
    doc.setFillColor(250, 249, 245)
    const noteLines = doc.splitTextToSize(measure.technicalNotes, PAGE_W - MARGIN * 2 - 8)
    const boxH = Math.max(12, Math.min(noteLines.length * 4 + 6, 40))
    doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, boxH, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...GRAY)
    doc.text(noteLines.slice(0, 7), MARGIN + 4, y + 5)
    y += boxH + 4
  }

  // ══════════════════════════════════════════════════════
  //  PIE DE PÁGINA
  // ══════════════════════════════════════════════════════
  drawFooter(pageCount)

  // ══════════════════════════════════════════════════════
  //  DESCARGAR
  // ══════════════════════════════════════════════════════
  const safeName = (client.name || 'cliente').replace(/\s+/g, '-').toLowerCase()
  const filename = `ficha-${safeName}-${format(new Date(), 'ddMMyyyy')}.pdf`
  doc.save(filename)
}
