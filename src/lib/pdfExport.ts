/**
 * pdfExport.ts — Render a BusinessPlan to a downloadable PDF (jsPDF).
 *
 * Uzbek Latin is ASCII + apostrophes, which the built-in helvetica handles once
 * we normalize the various apostrophe/quote code points to ASCII.
 */

import { jsPDF } from 'jspdf';
import type { BusinessPlan } from './businessPlan';

/** Normalize typographic apostrophes/quotes so helvetica renders o' / g' correctly. */
function uz(s: string): string {
  return (s ?? '')
    .replace(/[ʻʼ‘’′`´]/g, "'")
    .replace(/[“”«»]/g, '"');
}

export interface PlanMeta { owner?: string; business?: string; date: string }

export function downloadPlanPdf(plan: BusinessPlan, meta: PlanMeta): void {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  const CW = W - M * 2;
  let y = M;
  let page = 1;

  const footer = () => {
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(150);
    doc.text(uz(`BiznesPlan AI · ${meta.date}`), M, H - 24);
    doc.text(String(page), W - M, H - 24, { align: 'right' });
    doc.setTextColor(20);
  };
  const newPage = () => { footer(); doc.addPage(); page += 1; y = M; };
  const need = (h: number) => { if (y + h > H - 48) newPage(); };

  // ── Title band ──
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, W, 92, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(20);
  doc.text(doc.splitTextToSize(uz(plan.title || 'Biznes reja'), CW), M, 44);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
  const sub = [meta.business, meta.owner, meta.date].filter(Boolean).join('   ·   ');
  if (sub) doc.text(uz(sub), M, 74);
  doc.setTextColor(20, 20, 20);
  y = 124;

  // ── Sections ──
  for (const sec of plan.sections) {
    need(46);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(15, 110, 85);
    for (const l of doc.splitTextToSize(uz(sec.heading), CW)) { need(18); doc.text(l, M, y); y += 18; }
    y += 5;

    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor(35, 35, 35);
    for (const para of uz(sec.body).split('\n')) {
      if (!para.trim()) { y += 6; continue; }
      const bullet = /^\s*[•\-*]\s+/.test(para);
      const text = para.replace(/^\s*[•\-*]\s+/, '');
      const indent = bullet ? 14 : 0;
      const lines = doc.splitTextToSize(text, CW - indent);
      lines.forEach((l: string, i: number) => {
        need(15);
        if (bullet && i === 0) doc.text('•', M, y);
        doc.text(l, M + indent, y);
        y += 15;
      });
      y += 4;
    }
    y += 12;
  }

  footer();
  const slug = (meta.business || 'plan').replace(/[^a-z0-9]+/gi, '-').toLowerCase();
  doc.save(`biznes-reja-${slug}.pdf`);
}
