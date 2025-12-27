// Adjusted Reports.js to make the donut chart and legend cover 93% of the container
document.addEventListener('DOMContentLoaded', function() {
    // Remove page header if present (try id and class — header in `reports.html` uses class="reports-header")
    let hdr = document.getElementById('reports-header');
    if (!hdr) hdr = document.querySelector('.reports-header');
    if (hdr) hdr.remove();

    // Build the same report UI found in `teachers.js` so reports page has generate + download
    const chartContainer = document.getElementById('reportsChartContainer');

    // Load classroom snapshot from localStorage (keeps compatibility with teachers)
    const students = JSON.parse(localStorage.getItem('currentClassStudents') || '[]');
    const tasks = JSON.parse(localStorage.getItem('currentClassTasks') || '[]');
    const classroomName = localStorage.getItem('currentClassName') || '';

    // Create modal-like report area (inline on the reports page)
    const controls = document.createElement('div');
    // use the existing `.reports-controls` styles defined in `reports.css`
    controls.className = 'reports-controls';

    // Student select
    const sel = document.createElement('select');
    sel.id = 'repStu';
    sel.className = 'report-select';
    const emptyOpt = document.createElement('option'); emptyOpt.value = ''; emptyOpt.textContent = 'Select student'; sel.appendChild(emptyOpt);
    (students || []).forEach(s => { try { const o = document.createElement('option'); o.value = s.id || ''; o.textContent = s.name || '(unnamed)'; sel.appendChild(o); } catch (e) {} });
    controls.appendChild(sel);

    // From / To date inputs
    const fromInput = document.createElement('input');
    fromInput.id = 'repFrom';
    fromInput.type = 'date';
    fromInput.placeholder = 'From';
    fromInput.className = 'report-input';
    controls.appendChild(fromInput);
    const toInput = document.createElement('input');
    toInput.id = 'repTo';
    toInput.type = 'date';
    toInput.placeholder = 'To';
    toInput.className = 'report-input';
    controls.appendChild(toInput);

    // Generate + Download controls
    const genBtn = document.createElement('button');
    genBtn.id = 'gen';
    genBtn.className = 'action-btn small-btn';
    genBtn.type = 'button';
    genBtn.textContent = 'Generate';
    controls.appendChild(genBtn);

    const downloadBtn = document.createElement('button');
    downloadBtn.id = 'downloadPdf';
    // combine small-btn for size and modern style for PDF appearance; start hidden
    downloadBtn.className = 'small-btn modern-pdf-btn hidden';
    downloadBtn.type = 'button';
    downloadBtn.textContent = 'Download PDF';
    controls.appendChild(downloadBtn);

    // area where report will be rendered
    const area = document.createElement('div'); area.id = 'repArea';

    // append controls + area into provided container
    if (chartContainer) {
      chartContainer.innerHTML = ''; // clear
      chartContainer.appendChild(controls);
      chartContainer.appendChild(area);
    }

    // same insights generator used in teachers.js
    function generateInsights(entries, hist) {
      const totalPts = entries.reduce((s, e) => s + e.points, 0);
      const totalEvents = hist.length;
      const top = entries.slice().sort((a, b) => b.points - a.points)[0];
      const bottom = entries.slice().sort((a, b) => a.points - b.points)[0];
      const avgPerEvent = totalEvents ? (totalPts / totalEvents).toFixed(2) : 0;
      const sentences = [];
      sentences.push(`This report summarizes ${totalEvents} recorded events totaling ${totalPts} points.`);
      if (top) sentences.push(`Top contributor: "${top.label}" with ${top.points} points.`);
      if (bottom && bottom !== top) sentences.push(`Lowest contributor: "${bottom.label}" with ${bottom.points} points.`);
      sentences.push(`On average each recorded event contributed ${avgPerEvent} points.`);
      return sentences.join(' ');
    }

    genBtn.onclick = () => {
      const sid = sel.value;
      if (!sid) { alert('Choose student'); return; }
      const st = (students || []).find(x => x.id === sid);
      if (!st) return;
      area.innerHTML = '';

      // date filters
      const fromVal = (fromInput && fromInput.value) ? fromInput.value : null;
      const toVal = (toInput && toInput.value) ? toInput.value : null;
      const fromTs = fromVal ? new Date(fromVal + 'T00:00:00').getTime() : null;
      const toTs = toVal ? new Date(toVal + 'T23:59:59.999').getTime() : null;

      const histRaw = st.history || [];
      const hist = (histRaw || []).filter(h => {
        try {
          if (!h) return false;
          let t = null;
          if (typeof h.ts === 'number') t = Number(h.ts);
          else if (typeof h.ts === 'string') t = (isNaN(h.ts) ? Date.parse(h.ts) : Number(h.ts));
          if (!t) return false;
          if (fromTs && t < fromTs) return false;
          if (toTs && t > toTs) return false;
          return true;
        } catch (e) { return false; }
      });
      if (!hist || hist.length === 0) { area.innerHTML = '<div style="color:#666">No history for selected date range</div>'; downloadBtn.classList.add('hidden'); return; }

      // Build donut + legend using same approach as teachers.js
      const colors = ['#4CCFF9', '#8FB3FF', '#FFD166', '#8DE7A6', '#C78CFF', '#F86DA0', '#FFB3A7', '#A7FFD1'];
      const map = {};
      (tasks || []).forEach(t => { try { map[t.label] = { label: t.label, points: 0, count: 0 }; } catch (e) {} });
      hist.forEach(h => { try { const key = h.task || h.label || 'unknown'; if (!map[key]) map[key] = { label: key, points: 0, count: 0 }; map[key].points += (h.points || 0); map[key].count = (map[key].count || 0) + 1; } catch (e) {} });
      const entries = Object.keys(map).map(k => ({ label: map[k].label, points: map[k].points, count: map[k].count }));
      const filtered = entries.filter(e => Math.abs(e.points) > 0 || e.count > 0);
      if (!filtered || !filtered.length) { area.innerHTML = '<div style="color:#666">No scored events</div>'; downloadBtn.classList.add('hidden'); return; }
      filtered.sort((a,b) => Math.abs(b.points) - Math.abs(a.points));
      const total = Math.max(1, filtered.reduce((s,e)=> s + Math.abs(e.points), 0));

      const VIEW = 720; const cx = VIEW/2, cy = VIEW/2; const radius = Math.round(VIEW * 0.36); const innerR = Math.round(radius * 0.48);
      const svg = document.createElementNS('http://www.w3.org/2000/svg','svg'); svg.setAttribute('viewBox', `0 0 ${VIEW} ${VIEW}`); svg.style.width = '100%'; svg.style.maxWidth = '560px'; svg.style.height = 'auto'; svg.style.display = 'block'; svg.style.borderRadius = '10px'; svg.style.boxShadow = '0 18px 44px rgba(0,0,0,0.10)';

      function polarToCartesian(cx, cy, r, angleDeg) { const rad = angleDeg * Math.PI/180; return { x: cx + Math.cos(rad)*r, y: cy + Math.sin(rad)*r }; }
      let angleAcc = -90;
      filtered.forEach((e,i) => {
        const v = Math.abs(e.points); const angle = (v/total)*360; if (angle <= 0) return;
        const startA = angleAcc; const endA = angleAcc + angle;
        const start = polarToCartesian(cx,cy,radius,endA); const end = polarToCartesian(cx,cy,radius,startA);
        const largeArc = angle > 180 ? 1 : 0;
        const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
        const p = document.createElementNS('http://www.w3.org/2000/svg','path'); p.setAttribute('d', d); p.setAttribute('fill', colors[i % colors.length]); svg.appendChild(p);
        try {
          const innerS = polarToCartesian(cx, cy, innerR, startA); const outerS = polarToCartesian(cx, cy, radius, startA);
          const l1 = document.createElementNS('http://www.w3.org/2000/svg','line'); l1.setAttribute('x1', innerS.x); l1.setAttribute('y1', innerS.y); l1.setAttribute('x2', outerS.x); l1.setAttribute('y2', outerS.y); l1.setAttribute('stroke','#fff'); l1.setAttribute('stroke-width', String(Math.max(8, Math.round(radius*0.04)))); l1.setAttribute('stroke-linecap','butt'); svg.appendChild(l1);
          const innerE = polarToCartesian(cx, cy, innerR, endA); const outerE = polarToCartesian(cx, cy, radius, endA);
          const l2 = document.createElementNS('http://www.w3.org/2000/svg','line'); l2.setAttribute('x1', innerE.x); l2.setAttribute('y1', innerE.y); l2.setAttribute('x2', outerE.x); l2.setAttribute('y2', outerE.y); l2.setAttribute('stroke','#fff'); l2.setAttribute('stroke-width', String(Math.max(8, Math.round(radius*0.04)))); l2.setAttribute('stroke-linecap','butt'); svg.appendChild(l2);
        } catch (err) { }
        const midA = startA + angle/2; const midRad = midA * Math.PI/180; const labelR = innerR + (radius-innerR)*0.55;
        const lx = cx + Math.cos(midRad)*labelR; const ly = cy + Math.sin(midRad)*labelR; const pct = Math.round((v/total)*100);
        if (angle >= 7) {
          const txt = document.createElementNS('http://www.w3.org/2000/svg','text'); txt.setAttribute('x', lx); txt.setAttribute('y', ly+6); txt.setAttribute('text-anchor','middle'); txt.setAttribute('font-weight','800'); txt.setAttribute('font-size', Math.max(12, Math.round(18*(Math.min(1, angle/60))))); txt.setAttribute('fill','#fff'); txt.textContent = pct + '%'; svg.appendChild(txt);
        }
        angleAcc += angle;
      });

      const hole = document.createElementNS('http://www.w3.org/2000/svg','circle'); hole.setAttribute('cx', cx); hole.setAttribute('cy', cy); hole.setAttribute('r', innerR-2); hole.setAttribute('fill','#fff'); svg.appendChild(hole);
      const pos = filtered.reduce((s,e)=> s + (e.points>0?e.points:0),0); const neg = filtered.reduce((s,e)=> s + (e.points<0?Math.abs(e.points):0),0);
      const pctPos = (pos+neg)>0 ? Math.round(100 * pos / (pos+neg)) : 0;
      const t1 = document.createElementNS('http://www.w3.org/2000/svg','text'); t1.setAttribute('x', cx); t1.setAttribute('y', cy-8); t1.setAttribute('text-anchor','middle'); t1.setAttribute('font-weight','800'); t1.setAttribute('font-size','48'); t1.setAttribute('fill','#222'); t1.textContent = pctPos + '%'; svg.appendChild(t1);
      const t2 = document.createElementNS('http://www.w3.org/2000/svg','text'); t2.setAttribute('x', cx); t2.setAttribute('y', cy+30); t2.setAttribute('text-anchor','middle'); t2.setAttribute('font-weight','700'); t2.setAttribute('font-size','14'); t2.setAttribute('fill','#666'); t2.textContent = 'positive'; svg.appendChild(t2);

      const wrap = document.createElement('div'); wrap.style.display = 'flex'; wrap.style.gap = '18px'; wrap.style.alignItems = 'flex-start'; wrap.style.width = '100%';
      const svgWrap = document.createElement('div'); svgWrap.style.flex = '1'; svgWrap.style.display = 'flex'; svgWrap.style.justifyContent = 'center'; svgWrap.style.position = 'relative'; svgWrap.appendChild(svg);
      const legend = document.createElement('div'); legend.style.width = '320px'; legend.style.boxSizing = 'border-box'; legend.style.padding = '6px 12px'; legend.style.display = 'flex'; legend.style.flexDirection = 'column'; legend.style.gap = '18px';
      filtered.forEach((e,i) => {
        const row = document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='12px';
        // color swatch that matches the slice color
        const sw = document.createElement('div'); sw.className = 'color-box'; sw.style.background = colors[i % colors.length]; sw.style.flex = '0 0 auto'; sw.style.width = '34px'; sw.style.height = '34px'; sw.style.borderRadius = '6px';
        const col = document.createElement('div'); col.style.flex='1'; col.style.display='flex'; col.style.flexDirection='column';
        const title = document.createElement('div'); title.textContent = e.label || 'Label'; title.style.fontWeight='700'; title.style.color='#222';
        const desc = document.createElement('div'); desc.textContent = `${Math.round(100 * Math.abs(e.points) / total)}% · ${e.points} pts · ${e.count} events`; desc.style.color = '#666'; desc.style.fontSize = '12px';
        col.appendChild(title); col.appendChild(desc); row.appendChild(sw); row.appendChild(col); legend.appendChild(row);
      });

      svgWrap.style.minWidth = '420px'; wrap.appendChild(svgWrap); wrap.appendChild(legend); area.appendChild(wrap);

      const printLegend = document.createElement('div'); printLegend.style.display = 'none'; filtered.forEach((e, i) => { const p = document.createElement('div'); p.textContent = `${e.label} — ${e.points} pts · ${e.count} events`; printLegend.appendChild(p); });

      const insights = document.createElement('div'); insights.style.marginTop = '12px'; insights.style.color = '#333'; insights.style.fontSize = '14px'; insights.style.lineHeight = '1.5'; insights.textContent = generateInsights(filtered, hist);
      area.appendChild(insights);

      downloadBtn.classList.remove('hidden');

      // toggle compact class on narrow viewports (styling is provided via CSS)
      const _applyCompactDownloadBtn = () => {
        try {
          if (window.innerWidth <= 560) downloadBtn.classList.add('compact');
          else downloadBtn.classList.remove('compact');
        } catch (e) { }
      };

      _applyCompactDownloadBtn();
      const _dlResizeHandler = () => { try { _applyCompactDownloadBtn(); } catch (e) { } };
      window.addEventListener('resize', _dlResizeHandler);
      const _cleanupOnClose = () => { try { window.removeEventListener('resize', _dlResizeHandler); document.removeEventListener('modal:maybeClosed', _cleanupOnClose); } catch (e) { } };
      document.addEventListener('modal:maybeClosed', _cleanupOnClose);

      downloadBtn.onclick = () => {
        try {
          const chartSvg = svg;
          if (!chartSvg) throw new Error('No chart available');
          const serializer = new XMLSerializer();
          let svgStr = serializer.serializeToString(chartSvg);
          if (!svgStr.match(/^<svg[^>]+xmlns="http/)) svgStr = svgStr.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
          const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const img = new Image();
          img.onload = () => {
            try {
              const canvasOut = document.createElement('canvas');
              const vb = chartSvg.viewBox && chartSvg.viewBox.baseVal && chartSvg.viewBox.baseVal.width ? chartSvg.viewBox.baseVal : { width: VIEW, height: VIEW };
              canvasOut.width = vb.width; canvasOut.height = vb.height;
              const ctx = canvasOut.getContext('2d');
              ctx.fillStyle = '#fff'; ctx.fillRect(0,0,canvasOut.width,canvasOut.height);
              ctx.drawImage(img, 0, 0, canvasOut.width,canvasOut.height);
              const imgData = canvasOut.toDataURL('image/png');
              const printWin = window.open('', '_blank');
              const title = `${classroomName || 'Class'} — ${st.name} Report`;
              const printedOn = new Date().toLocaleString();
              const html = `<!doctype html><html><head><meta charset='utf-8'><title>${title}</title><style>body{font-family:system-ui;padding:28px;color:#111;background:#fff}.card{max-width:900px;margin:0 auto}h1{font-size:22px;margin:0 0 6px 0}.meta{color:#666;font-size:13px;margin-bottom:12px}.insights{margin-top:18px;font-size:15px;color:#333;line-height:1.5}img.chart{width:100%;border-radius:8px;box-shadow:0 18px 44px rgba(0,0,0,0.10)}@media print{ body{padding:12mm} .card{max-width:100%} }</style></head><body><div class='card'><h1>${title}</h1><div class='meta'>Generated: ${printedOn}</div><div style='max-width:900px;margin:0 auto'><img class='chart' src='${imgData}'/></div><div class='insights'>${generateInsights(filtered, hist)}</div></div></body></html>`;
              printWin.document.open(); printWin.document.write(html); printWin.document.close(); setTimeout(() => { try { printWin.focus(); printWin.print(); } catch (e) { try { printWin.print(); } catch (_) { } } }, 450);
            } finally { URL.revokeObjectURL(url); }
          };
          img.onerror = () => { URL.revokeObjectURL(url); alert('Unable to create printable image from chart'); };
          img.src = url;
        } catch (e) { alert('Unable to open print dialog: ' + String(e)); }
      };
    };

    // Pre-fill class info if present on page
    const nameEl = document.getElementById('reportsClassName'); if (nameEl) nameEl.textContent = classroomName || 'Classroom';
    const countsEl = document.getElementById('reportsClassCounts'); if (countsEl) countsEl.textContent = `${(students||[]).length} students · ${(tasks||[]).length} tasks`;
  });
