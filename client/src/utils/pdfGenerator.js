import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

/**
 * Genera una ficha técnica PDF profesional para una clienta.
 * @param {object} client  - Datos de la clienta (name, phone, email, notes...)
 * @param {object} measure - Datos de la medición (upper, lower, fitType, ...)
 * @param {object} studio  - Datos del taller (name, logoUrl) — opcional
 */
export function generatePDF(client, measure, studio = {}) {
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const PAGE_W = doc.internal.pageSize.getWidth()
  const PAGE_H = doc.internal.pageSize.getHeight()
  const MARGIN = 20

  // Paleta oliva elegante
  const OLIVE  = [138, 125, 60]   // primary-500 oliva
  const GOLD   = [201, 122, 30]   // accent-500 dorado
  const DARK   = [31, 41, 55]     // gray-800
  const GRAY   = [107, 114, 128]  // gray-500
  const LIGHT  = [219, 210, 176]  // primary-200 oliva claro

  // ── CABECERA ───────────────────────────────────────────
  doc.setFillColor(...OLIVE)
  doc.rect(0, 0, PAGE_W, 38, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(studio.name || 'Atelier Elizabeth', MARGIN, 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Ficha Técnica de Medidas', MARGIN, 22)

  doc.setFontSize(9)
  doc.text(
    `Emitida el ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`,
    PAGE_W - MARGIN,
    22,
    { align: 'right' }
  )

  // Línea decorativa dorada
  doc.setFillColor(...GOLD)
  doc.rect(0, 38, PAGE_W, 3, 'F')

  // ── DATOS DEL CLIENTE/CLIENTA ──────────────────────────
  let y = 55
  doc.setTextColor(...DARK)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  
  // Título dinámico según género
  const clientTitle = client.gender === 'masculino' ? 'Datos del Cliente' : 'Datos de la Clienta'
  doc.text(clientTitle, MARGIN, y)

  y += 8
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)

  const genderLabel = { femenino: 'Femenino', masculino: 'Masculino', otro: 'Otro' }

  const clientFields = [
    ['Nombre:',   client.name || '—'],
    ...(client.gender ? [['Género:', genderLabel[client.gender] || client.gender]] : []),
    ['Teléfono:', client.phone || '—'],
    ['Email:',    client.email || '—'],
    ...(measure?.label ? [['Sesión:', measure.label]] : []),
    ...(measure?.fitType ? [['Ajuste:', measure.fitType]] : []),
    ...(measure?.fabricType ? [['Tela:', measure.fabricType]] : []),
    ...(measure?.suggestedSize ? [['Talla sugerida:', measure.suggestedSize]] : []),
  ]

  const COL1 = MARGIN, COL2 = MARGIN + 38
  clientFields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text(label, COL1, y)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...GRAY)
    doc.text(String(value), COL2, y)
    y += 6.5
  })

  y += 4

  // ── TABLA MEDIDAS DELANTERAS ───────────────────────────
  const upper = measure?.upper || {}
  const arms  = measure?.arms  || {}
  const pants = measure?.pants || {}
  const lower = measure?.lower || {}

  // Medidas Delanteras (sin brazos)
  const upperRows = [
    // Contornos del torso
    ['Contorno de cuello',     upper.contornoCuello     ? `${upper.contornoCuello} cm`     : '—'],
    ['Contorno sobre busto',   upper.contornoSobreBusto ? `${upper.contornoSobreBusto} cm` : '—'],
    ['Contorno de busto',      upper.contornoBusto      ? `${upper.contornoBusto} cm`      : '—'],
    ['Contorno de bajo busto', upper.contornoBajoBusto  ? `${upper.contornoBajoBusto} cm`  : '—'],
    ['Contorno de cintura',    upper.contornoCintura    ? `${upper.contornoCintura} cm`    : '—'],
    ['Contorno de cadera',     upper.contornoCadera     ? `${upper.contornoCadera} cm`     : '—'],
    // Anchos y alturas
    ['Hombros',                upper.hombros            ? `${upper.hombros} cm`            : '—'],
    ['Ancho de hombro',        upper.anchoHombro        ? `${upper.anchoHombro} cm`        : '—'],
    ['Caída de hombro',        upper.caidaHombro        ? `${upper.caidaHombro} cm`        : '—'],
    ['Ancho de busto',         upper.anchoBusto         ? `${upper.anchoBusto} cm`         : '—'],
    ['Altura de busto',        upper.alturaBusto        ? `${upper.alturaBusto} cm`        : '—'],
    ['Altura de cadera',       upper.alturaCapdera      ? `${upper.alturaCapdera} cm`      : '—'],
    // Largos del torso
    ['Largo de talle',         upper.largoTalle         ? `${upper.largoTalle} cm`         : '—'],
    ['Largo de talle centro',  upper.largoTalleCentro   ? `${upper.largoTalleCentro} cm`   : '—'],
  ]

  // Medidas de Brazo
  const armRows = [
    ['Largo de brazo',      arms.largoBrazo      ? `${arms.largoBrazo} cm`      : '—'],
    ['Contorno de bíceps',  arms.contornoBiceps  ? `${arms.contornoBiceps} cm`  : '—'],
    ['Bajo el brazo',       arms.bajoElBrazo     ? `${arms.bajoElBrazo} cm`     : '—'],
    ['Contorno de codo',    arms.contornoCodo    ? `${arms.contornoCodo} cm`    : '—'],
    ['Contorno de muñeca', arms.contornoMuneca  ? `${arms.contornoMuneca} cm`  : '—'],
    ['Contorno de puño',   arms.contornoPuno    ? `${arms.contornoPuno} cm`    : '—'],
  ]

  // Medidas de Pantalón o Falda
  const pantsRows = [
    ['Contorno de cintura', pants.contornoCintura ? `${pants.contornoCintura} cm` : '—'],
    ['Altura de cadera',    pants.alturaCadera    ? `${pants.alturaCadera} cm`    : '—'],
    ['Contorno de cadera',  pants.contornoCadera  ? `${pants.contornoCadera} cm`  : '—'],
    ['Altura de asiento',   pants.alturaAsiento   ? `${pants.alturaAsiento} cm`   : '—'],
    ['Largo de pantalón',   pants.largoPantalon   ? `${pants.largoPantalon} cm`   : '—'],
    ['Largo de falda',      pants.largoFalda      ? `${pants.largoFalda} cm`      : '—'],
  ]

  const lowerRows = [
    ['Largo de talle trasero',    lower.largoTalleTrasero     ? `${lower.largoTalleTrasero} cm`     : '—'],
    ['Ancho de hombros trasero',  lower.anchoHombrosTrasero   ? `${lower.anchoHombrosTrasero} cm`   : '—'],
    ['Largo centro trasero',      lower.largoCentroTrasero    ? `${lower.largoCentroTrasero} cm`    : '—'],
    ['Reboque de cuello', lower.reboqueCuelloTrasero  ? `${lower.reboqueCuelloTrasero} cm`  : '—'],
    ['Largo caída trasero',       lower.largoCaidaTrasero     ? `${lower.largoCaidaTrasero} cm`     : '—'],
    ['Ancho tórax trasero',       lower.anchoToraxTrasero     ? `${lower.anchoToraxTrasero} cm`     : '—'],
    ['Ancho omóplatos trasero',   lower.anchoOmoplatosTrasero ? `${lower.anchoOmoplatosTrasero} cm` : '—'],
    ['Ancho de cintura trasero',  lower.anchoCinturaTrasero   ? `${lower.anchoCinturaTrasero} cm`   : '—'],
  ]

  // Tabla superior (Medidas Delanteras)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('Medidas Delanteras', MARGIN, y)

  autoTable(doc, {
    startY: y + 4,
    head:   [['Medida', 'Valor']],
    body:   upperRows,
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize:    10,
      cellPadding: 4,
      textColor:   DARK,
      lineColor:   [229, 231, 235],
      lineWidth:   0.3,
    },
    headStyles: {
      fillColor: OLIVE,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign:    'left',
    },
    alternateRowStyles: { fillColor: [247, 246, 240] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  })

  y = doc.lastAutoTable.finalY + 10

  // Tabla de Medidas de Brazo
  const hasArmMeasures = armRows.some(([, value]) => value !== '—')
  if (hasArmMeasures) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text('Medidas de Brazo', MARGIN, y)

    autoTable(doc, {
      startY: y + 4,
      head:   [['Medida', 'Valor']],
      body:   armRows,
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        fontSize:    10,
        cellPadding: 4,
        textColor:   DARK,
        lineColor:   [229, 231, 235],
        lineWidth:   0.3,
      },
      headStyles: {
        fillColor: [59, 130, 246], // blue-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign:    'left',
      },
      alternateRowStyles: { fillColor: [239, 246, 255] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    })
    
    y = doc.lastAutoTable.finalY + 10
  }

  // Tabla de Medidas de Pantalón o Falda
  const hasPantsMeasures = pantsRows.some(([, value]) => value !== '—')
  if (hasPantsMeasures) {
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...DARK)
    doc.text('Medidas de Pantalón o Falda', MARGIN, y)

    autoTable(doc, {
      startY: y + 4,
      head:   [['Medida', 'Valor']],
      body:   pantsRows,
      margin: { left: MARGIN, right: MARGIN },
      styles: {
        fontSize:    10,
        cellPadding: 4,
        textColor:   DARK,
        lineColor:   [229, 231, 235],
        lineWidth:   0.3,
      },
      headStyles: {
        fillColor: [34, 197, 94], // green-500
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign:    'left',
      },
      alternateRowStyles: { fillColor: [240, 253, 244] },
      columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
    })
    
    y = doc.lastAutoTable.finalY + 10
  }

  // Tabla de Medidas Traseras
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...DARK)
  doc.text('Medidas Traseras', MARGIN, y)

  autoTable(doc, {
    startY: y + 4,
    head:   [['Medida', 'Valor']],
    body:   lowerRows,
    margin: { left: MARGIN, right: MARGIN },
    styles: {
      fontSize:    10,
      cellPadding: 4,
      textColor:   DARK,
      lineColor:   [229, 231, 235],
      lineWidth:   0.3,
    },
    headStyles: {
      fillColor: GOLD,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign:    'left',
    },
    alternateRowStyles: { fillColor: [253, 248, 240] },
    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
  })

  y = doc.lastAutoTable.finalY + 10

  // ── NOTAS TÉCNICAS ─────────────────────────────────────
  if (measure?.technicalNotes) {
    if (y > PAGE_H - 60) {
      doc.addPage()
      y = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...DARK)
    doc.text('Notas Técnicas', MARGIN, y)

    y += 6
    doc.setDrawColor(...LIGHT)
    doc.setFillColor(247, 246, 240)
    const boxH = 30
    doc.roundedRect(MARGIN, y, PAGE_W - MARGIN * 2, boxH, 3, 3, 'FD')

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(...GRAY)
    const splitNotes = doc.splitTextToSize(measure.technicalNotes, PAGE_W - MARGIN * 2 - 8)
    doc.text(splitNotes.slice(0, 5), MARGIN + 4, y + 8)
    y += boxH + 8
  }

  // ── PIE DE PÁGINA ──────────────────────────────────────
  const footerY = PAGE_H - 15
  doc.setDrawColor(...LIGHT)
  doc.setLineWidth(0.5)
  doc.line(MARGIN, footerY - 5, PAGE_W - MARGIN, footerY - 5)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...GRAY)
  
  // Línea principal con nombre del taller
  const studioInfo = studio.name || 'Atelier Elizabeth'
  const contactInfo = [
    studio.phone,
    studio.website?.replace(/^https?:\/\//, ''),
  ].filter(Boolean).join(' | ')
  
  doc.text(
    `${studioInfo} © ${new Date().getFullYear()} — Ficha técnica confidencial`,
    MARGIN,
    footerY
  )
  
  // Información de contacto (si existe)
  if (contactInfo) {
    doc.text(contactInfo, PAGE_W / 2, footerY, { align: 'center' })
  }
  
  doc.text(`Página 1`, PAGE_W - MARGIN, footerY, { align: 'right' })

  // ── DESCARGAR ──────────────────────────────────────────
  const filename = `ficha-${client.name?.replace(/\s+/g, '-').toLowerCase()}-${format(new Date(), 'ddMMyyyy')}.pdf`
  doc.save(filename)
}
