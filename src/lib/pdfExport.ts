import { jsPDF } from 'jspdf';
import type { AIResult } from './schema';
import type { ScoreResult } from './scoring';
import type { RevenueCheckResult } from './revenueCheck';

// Minimal price shape — compatible with StoredPrice + FallbackPriceResult
interface PDFPriceRow {
  avg: number;
  min: number;
  max: number;
  count: number;
  unit?: string;
  source: 'olx' | 'fallback';
}

/**
 * Exports the business plan to a PDF.
 * Uses jsPDF with built-in helvetica font — for full Uzbek character support
 * (O', G', o', g'), you should replace with a Unicode TTF font:
 *
 * 1. Download Roboto-Regular.ttf from Google Fonts
 * 2. Place it in public/fonts/Roboto-Regular.ttf
 * 3. Convert to base64: https://www.base64-font.com/
 * 4. Call doc.addFileToVFS('Roboto.ttf', base64string)
 *    and doc.addFont('Roboto.ttf', 'Roboto', 'normal')
 *    then doc.setFont('Roboto')
 *
 * For the hackathon, the default font works for most content.
 * Special chars (O', G') will render as O, G — acceptable for MVP.
 */

const PAGE_MARGIN = 20;
const PAGE_WIDTH = 210;
const CONTENT_WIDTH = PAGE_WIDTH - PAGE_MARGIN * 2;

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function addSection(
  doc: jsPDF,
  title: string,
  content: string,
  yPos: number
): number {
  // Check if we need a new page
  if (yPos > 260) {
    doc.addPage();
    yPos = PAGE_MARGIN;
  }

  // Section heading
  doc.setFillColor(15, 23, 42); // slate-950
  doc.rect(PAGE_MARGIN, yPos - 4, CONTENT_WIDTH, 10, 'F');
  doc.setTextColor(16, 185, 129); // emerald-500
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), PAGE_MARGIN + 3, yPos + 3);
  yPos += 10;

  // Content
  doc.setTextColor(200, 200, 200);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  yPos = addWrappedText(doc, content, PAGE_MARGIN, yPos, CONTENT_WIDTH, 5);
  yPos += 6;

  return yPos;
}

function fmtPrice(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} mln`;
  if (n >= 1_000)     return `${Math.round(n / 1_000)} ming`;
  return String(n);
}

/**
 * Draws the "Joriy Bozor Narxlari" table + revenue verdict onto the PDF.
 * Returns the new Y position after drawing.
 */
function addPriceTable(
  doc: jsPDF,
  prices: Record<string, PDFPriceRow>,
  revenueCheck: RevenueCheckResult,
  startY: number,
): number {
  let y = startY;
  const entries = Object.entries(prices);
  if (entries.length === 0) return y;

  // ── Section header ──
  doc.setFillColor(15, 23, 42);
  doc.rect(PAGE_MARGIN, y - 4, CONTENT_WIDTH, 10, 'F');
  doc.setTextColor(16, 185, 129);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');

  const isLive = entries.some(([, p]) => p.source === 'olx');
  const srcLabel = isLive ? 'OLX.uz — JONLI' : 'OFFLINE MA\'LUMOT';
  doc.text('6. JORIY BOZOR NARXLARI', PAGE_MARGIN + 3, y + 3);
  doc.setTextColor(isLive ? 16 : 245, isLive ? 185 : 158, isLive ? 129 : 11);
  doc.setFontSize(7);
  doc.text(srcLabel, PAGE_MARGIN + CONTENT_WIDTH - doc.getTextWidth(srcLabel) - 3, y + 3);
  y += 12;

  // ── Column headers ──
  const C = {
    name:  PAGE_MARGIN,
    avg:   PAGE_MARGIN + 80,
    range: PAGE_MARGIN + 120,
    count: PAGE_MARGIN + 158,
  };

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('MAHSULOT',    C.name,  y);
  doc.text("O'RTACHA",   C.avg,   y);
  doc.text('DIAPAZON',   C.range, y);
  doc.text("TA'DOD",     C.count, y);
  y += 2;

  // Divider
  doc.setDrawColor(30, 41, 59);
  doc.setLineWidth(0.3);
  doc.line(PAGE_MARGIN, y, PAGE_MARGIN + CONTENT_WIDTH, y);
  y += 4;

  // ── Rows ──
  const rowH = 7;
  entries.slice(0, 8).forEach(([query, p], i) => {
    if (y > 265) { doc.addPage(); y = PAGE_MARGIN; }

    // Alternating row background
    if (i % 2 === 0) {
      doc.setFillColor(22, 30, 46);
      doc.rect(PAGE_MARGIN, y - 3, CONTENT_WIDTH, rowH, 'F');
    }

    const unit = p.unit
      ? p.unit.replace(/^\d+\s*/, '').replace(/\s*\(.*?\)$/, '').split(/\s+/)[0]
      : '';
    const unitSuffix = unit ? `/${unit}` : '';

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(query.slice(0, 28), C.name, y + 1);

    doc.setTextColor(16, 185, 129);
    doc.setFont('helvetica', 'bold');
    doc.text(`${fmtPrice(p.avg)} so'm${unitSuffix}`, C.avg, y + 1);

    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(`${fmtPrice(p.min)} – ${fmtPrice(p.max)}`, C.range, y + 1);

    doc.text(String(p.count), C.count, y + 1);

    y += rowH;
  });

  y += 4;

  // ── Revenue check verdict ──
  if (y > 255) { doc.addPage(); y = PAGE_MARGIN; }

  const verdictColors: Record<RevenueCheckResult['status'], [number, number, number]> = {
    ok:           [16, 185, 129],
    ok_high:      [245, 158, 11],
    too_low:      [245, 158, 11],
    too_high:     [239, 68, 68],
    unverifiable: [100, 116, 139],
  };
  const vc = verdictColors[revenueCheck.status];

  // Simulate 12% opacity by blending status color with slate-800 background (30,41,59)
  const bg = [30, 41, 59];
  const blended: [number, number, number] = [
    Math.round(vc[0] * 0.12 + bg[0] * 0.88),
    Math.round(vc[1] * 0.12 + bg[1] * 0.88),
    Math.round(vc[2] * 0.12 + bg[2] * 0.88),
  ];
  doc.setFillColor(...blended);
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 20, 2, 2, 'F');

  doc.setDrawColor(...vc);
  doc.setLineWidth(0.4);
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 20, 2, 2, 'S');

  // Status label
  const statusLabel: Record<RevenueCheckResult['status'], string> = {
    ok:           'REALISTIK',
    ok_high:      'BIROZ YUQORI',
    too_low:      'JUDA PAST',
    too_high:     'JUDA YUQORI',
    unverifiable: 'TEKSHIRILMADI',
  };

  doc.setTextColor(...vc);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text(`DAROMAD TEKSHIRUVI: ${statusLabel[revenueCheck.status]}`, PAGE_MARGIN + 3, y + 6);

  if (revenueCheck.ratio !== 1) {
    doc.text(`${revenueCheck.ratio.toFixed(1)}x`, PAGE_MARGIN + CONTENT_WIDTH - 14, y + 6);
  }

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  const msgLines = doc.splitTextToSize(revenueCheck.message, CONTENT_WIDTH - 8);
  doc.text(msgLines.slice(0, 2), PAGE_MARGIN + 3, y + 12);

  y += 26;
  return y;
}

export async function exportToPDF(
  result: AIResult,
  score: ScoreResult,
  prices?: Record<string, PDFPriceRow>,
  revenueCheck?: RevenueCheckResult,
): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const now = new Date().toLocaleDateString('uz-UZ');

  let y = PAGE_MARGIN;

  // ---- HEADER ----
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, PAGE_WIDTH, 35, 'F');

  doc.setTextColor(16, 185, 129);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('BIZNES-REJA', PAGE_MARGIN, 12);

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.text(result.facts.business_type, PAGE_MARGIN, 20);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(9);
  doc.text(`${result.facts.region}  •  ${now}`, PAGE_MARGIN, 27);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.text('BiznesPlan AI  •  O\'zbekiston Savdo-sanoat palatasi hamkori', PAGE_MARGIN, 32);

  y = 45;

  // ---- SCORE BOX ----
  const scoreColor: [number, number, number] = score.color === 'green' ? [16, 185, 129]
    : score.color === 'amber' ? [245, 158, 11]
    : [239, 68, 68];

  doc.setFillColor(30, 41, 59); // slate-800
  doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 28, 3, 3, 'F');

  doc.setTextColor(...scoreColor);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(String(score.total), PAGE_MARGIN + 8, y + 18);

  doc.setFontSize(9);
  doc.text('/ 100', PAGE_MARGIN + 22, y + 18);

  doc.setFontSize(11);
  doc.text(score.band, PAGE_MARGIN + 35, y + 12);

  doc.setTextColor(203, 213, 225);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const adviceLines = doc.splitTextToSize(score.advice, CONTENT_WIDTH - 40);
  doc.text(adviceLines, PAGE_MARGIN + 35, y + 19);

  y += 34;

  // ---- SCORE BREAKDOWN ----
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('KREDIT TAYYORGARLIK TAFSILOTI', PAGE_MARGIN, y);
  y += 5;

  for (const comp of score.breakdown) {
    // Bar background
    doc.setFillColor(30, 41, 59);
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, 6, 'F');
    // Bar fill
    const pct = comp.points / comp.max;
    const barColor: [number, number, number] = pct >= 0.7 ? [16, 185, 129]
      : pct >= 0.4 ? [245, 158, 11]
      : [239, 68, 68];
    doc.setFillColor(...barColor);
    doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH * pct, 6, 'F');
    // Label
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text(`${comp.label}: ${comp.points}/${comp.max}`, PAGE_MARGIN + 2, y + 4.5);
    y += 8;
  }

  y += 6;

  // ---- BUSINESS PLAN SECTIONS ----
  y = addSection(doc, '1. Rezyume (Executive Summary)', result.business_plan.executive_summary, y);
  y = addSection(doc, '2. Bozor tahlili', result.business_plan.market_analysis, y);
  y = addSection(doc, '3. Marketing va ishlab chiqarish rejasi', result.business_plan.marketing_production_plan, y);
  y = addSection(doc, '4. Moliyaviy prognoz (3 yil)', result.business_plan.financial_forecast, y);
  y = addSection(doc, '5. Risklar va yechimlar', result.business_plan.risk_assessment, y);

  // New page for market prices + banks + checklist
  doc.addPage();
  y = PAGE_MARGIN;

  // ---- MARKET PRICES TABLE (when available) ----
  if (prices && revenueCheck && Object.keys(prices).length > 0) {
    y = addPriceTable(doc, prices, revenueCheck, y);
    y += 6;
  }

  // ---- BANK RECOMMENDATIONS ----
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('BANK TAVSIYALARI', PAGE_MARGIN, y);
  y += 6;

  result.bank_recommendations.forEach((rec, i) => {
    if (y > 250) { doc.addPage(); y = PAGE_MARGIN; }

    doc.setFillColor(22, 30, 46);
    doc.roundedRect(PAGE_MARGIN, y, CONTENT_WIDTH, 3, 1, 1, 'F');

    doc.setTextColor(16, 185, 129);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${i + 1}. ${rec.bank}`, PAGE_MARGIN + 3, y + 6);
    y += 10;

    doc.setTextColor(203, 213, 225);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    y = addWrappedText(doc, rec.why_fit, PAGE_MARGIN + 3, y, CONTENT_WIDTH - 6, 4.5);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7);
    y = addWrappedText(doc, rec.likely_requirements, PAGE_MARGIN + 3, y + 2, CONTENT_WIDTH - 6, 4);
    y += 8;
  });

  // ---- CHECKLIST ----
  if (y > 230) { doc.addPage(); y = PAGE_MARGIN; }

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.text('BANKGA BORISHDAN OLDIN TAYYORLANG', PAGE_MARGIN, y);
  y += 6;

  result.readiness_checklist.forEach((item, i) => {
    if (y > 275) { doc.addPage(); y = PAGE_MARGIN; }
    doc.setFillColor(30, 41, 59);
    doc.rect(PAGE_MARGIN, y, 5, 5, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(String(i + 1), PAGE_MARGIN + 1.5, y + 3.8);
    doc.setTextColor(203, 213, 225);
    y = addWrappedText(doc, item, PAGE_MARGIN + 8, y + 3.8, CONTENT_WIDTH - 8, 4.5);
    y += 2;
  });

  // ---- FOOTER on all pages ----
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setTextColor(71, 85, 105);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `BiznesPlan AI  •  biznesplan.uz  •  Sahifa ${p}/${totalPages}`,
      PAGE_MARGIN,
      295
    );
  }

  // Save
  const filename = `BiznesReja_${result.facts.business_type.replace(/\s+/g, '_')}_${now.replace(/\./g, '-')}.pdf`;
  doc.save(filename);
}
