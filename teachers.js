// Simple proxy server code (Node.js) you can host in China
// This would run on your China server
 // Replace with same values used in landing.html
const SUPABASE_URL = 'https://cnjmvgkvbhlcruwuqubk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuam12Z2t2YmhsY3J1d3VxdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTQwNDUsImV4cCI6MjA4MTIzMDA0NX0.zkDZK7lhSoO38bxb-nQ-x9QVdeyk7RDDDqHPGyuYGyk';
// China-friendly API configuration for LOCALHOST development
const CHINA_MODE = navigator.language.includes('zh') || 
                  window.location.hostname.includes('china') ||
                  ['zh', 'zh-CN', 'zh-TW'].includes(navigator.language) ||
                  window.location.hostname === 'localhost'; // Always use fallback on localhost

const API_CONFIG = {
  primary: 'https://cnjmvgkvbhlcruwuqubk.supabase.co/rest/v1',
  apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuam12Z2t2YmhsY3J1d3VxdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTQwNDUsImV4cCI6MjA4MTIzMDA0NX0.zkDZK7lhSoO38bxb-nQ-x9QVdeyk7RDDDqHPGyuYGyk'
};

// Enhanced fetch wrapper with retry logic - works on localhost
async function chinaSafeFetch(url, options = {}) {
  const endpoints = [API_CONFIG.primary];
  
  // For localhost development, add a simple retry mechanism
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch(`${endpoints[0]}${url}`, {
        ...options,
        headers: {
          'apikey': API_CONFIG.apiKey,
          'Content-Type': 'application/json',
          ...options.headers
        },
        // Add timeout for localhost development
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (response.ok) return response;
      
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      if (attempt === 2) throw error; // Throw on final attempt
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1))); // Exponential backoff
    }
  }
  
  throw new Error('All API attempts failed');
}
// open a small modal to pick a student and give the selected task
async function openTaskGiveModal(classId, task) {
  let snap = loadClassroom(classId);
  if (!snap) {
    try { showToast('Loading class…', { type: 'default' }); snap = await ensureClassLoaded(classId); } catch (e) { }
    if (!snap) { showToast('Failed to load class', { type: 'error' }); return; }
  }
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  const ptsLabel = (task.points > 0) ? ('+' + task.points) : String(task.points);
  let html = `<div class='modal' style='max-width:520px'><h3>Give "${task.label}" (${ptsLabel})</h3><div style='margin-top:8px'><select id='giveStu'><option value=''>Select student</option>`;
  (snap.students || []).forEach(s => html += `<option value='${s.id}'>${s.name} (${s.total || 0} pts)</option>`);
  html += `</select></div><div class='actions'><button id='giveCancel' class='btn-muted'>Cancel</button><button id='giveConfirm' class='action-btn'>Give</button></div></div>`;
  mb.innerHTML = html; document.body.appendChild(mb);
  attachModalBehavior(mb, '#giveStu');
  mb.querySelector('#giveCancel').onclick = () => closeModal(mb);
  mb.querySelector('#giveConfirm').onclick = async () => {
    const sid = mb.querySelector('#giveStu').value; if (!sid) { showFieldError(mb, '#giveStu', 'Select student'); return; }
    const st = (snap.students || []).find(x => x.id === sid); if (!st) { showToast('Student not found', { type: 'error' }); return; }
    // update snapshot (local state) immediately
    st.total = (st.total || 0) + (task.points || 1);
    st.history = st.history || []; st.history.push({ task: task.label, points: task.points || 1, ts: Date.now() });
// REAL-TIME UI UPDATES - Optimistic updates with visual feedback
const card = document.querySelector('.child-card[data-student-id="' + studentId + '"]');
if (card) {
  // 1. Update the main points display element (this is what was missing)
  const pointsDisplay = card.querySelector('.points-display');
  if (pointsDisplay) {
    pointsDisplay.textContent = student.total;
    // Add visual feedback animation
    pointsDisplay.classList.add('points-updated');
    setTimeout(() => pointsDisplay.classList.remove('points-updated'), 500);
  }
  
  // 2. Update mailbox badge (you already had this)
  const mbEl = card.querySelector('.mailbox');
  if (mbEl) {
    const badge = mbEl.querySelector('.mailbox-points');
    if (badge) badge.textContent = '⭐ ' + student.total;
    try { showMailboxCard(mbEl, pts); } catch (e) { }
  }
  
  // // 3. Show instant toast notification for feedback
  // showToast(`+${pts} points awarded to ${student.name}!`, { 
  //   type: 'success', 
  //   duration: 1500 
  // });
  // Determine if points are positive or negative
const isPositive = pts > 0;
const displayPoints = isPositive ? `+${pts}` : `${pts}`;
const toastType = isPositive ? 'success' : 'error';
const message = isPositive 
  ? `${displayPoints} points to ${student.name}!` 
  : `${displayPoints} points from ${student.name}`;

showToast(message, { type: toastType, duration: 1500 });
}

try { animateClassList(pts, studentId); } catch (e) { }

// 4. Save to database in BACKGROUND - don't block UI
setTimeout(async () => {
  try {
    await saveClassroom(classId, snap);
  } catch (err) {
    console.warn('save reward failed', err);
    showToast('Sync failed — changes saved locally', { 
      type: 'warning' 
    });
  }
}, 100);

// 5. Close modal immediately
closeModal(mb);

// REMOVE THIS LINE COMPLETELY - IT'S CAUSING THE DELAY AND REFRESH:
// try { openClass(classId); } catch (e) { }
  };
}

// open class-level tasks editor (uses classroom snapshot)
function openClassTasksEditor(classId) {
  const snap = loadClassroom(classId) || { tasks: [] };
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  mb.innerHTML = `
    <div class='modal' style='max-width:820px'>
      <div style='display:flex;align-items:center;justify-content:space-between'>
        <h3 style='margin:0;padding:0'>🛠 Class Tasks</h3>
        <div style='display:flex;gap:8px;align-items:center'>
          <button id='tasksTabBtn' class='small-btn' style='padding:8px 10px;background:#fff;border:1px solid #eef2f8;color:#222'>Tasks</button>
          <button id='importTabBtn' class='small-btn' style='padding:8px 10px'>Import tasks</button>
        </div>
      </div>
      <div style='margin-top:10px;display:flex;gap:12px;flex-direction:column'>
        <div id='tasksPane' style='display:block'>
          <div id='classTaskArea' style='display:grid;gap:10px;margin-top:8px;max-height:48vh;overflow:auto'></div>
          <div style='display:flex;gap:8px;margin-top:12px;align-items:center'>
            <input id='ctLabel' placeholder='Label' style='flex:1;padding:8px;border-radius:8px;border:1px solid #e6e9ef'/>
            <input id='ctPoints' type='number' inputmode='numeric' step='1' min='0' placeholder='Points' style='width:90px;padding:8px;border-radius:8px;border:1px solid #e6e9ef'/>
            <select id='ctCategory' style='width:140px;padding:8px;border-radius:8px;border:1px solid #e6e9ef'>
              <option value='positive'>Positive</option>
              <option value='needs'>Needs work</option>
            </select>
            <button id='ctAdd' class='small-btn' style='padding:8px 12px'>Add</button>
          </div>
        </div>
        <div id='importPane' style='display:none'>
          <div style='display:flex;gap:8px;align-items:center;margin-top:6px'>
            <label style='font-weight:700;margin-right:8px'>From class:</label>
            <select id='importClassSelect' class='modern-select' style='flex:1;padding:8px;border-radius:8px;border:1px solid #e6e9ef'></select>
            <button id='importAllBtn' class='action-btn' style='padding:8px 12px;border-radius:10px'>Import all</button>
          </div>
          <div id='importTaskArea' style='display:grid;gap:10px;margin-top:10px;max-height:46vh;overflow:auto'></div>
          <div style='display:flex;justify-content:space-between;gap:8px;margin-top:10px'>
            <div><!-- Choose another class removed --></div>
            <div style='display:flex;gap:8px'><button id='importCancel' class='btn-muted'>Cancel</button></div>
          </div>
        </div>
      </div>
      <div class='actions' style='margin-top:12px'></div>
    </div>`;
  document.body.appendChild(mb);
  const area = mb.querySelector('#classTaskArea');
  const tasksPane = mb.querySelector('#tasksPane');
  const importPane = mb.querySelector('#importPane');
  const importSelect = mb.querySelector('#importClassSelect');
  const importTaskArea = mb.querySelector('#importTaskArea');
  function refresh() {
    area.innerHTML = '';
    (snap.tasks || []).forEach((t, i) => {
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:10px;background:#fff;border:1px solid #f0f0f0';
      const left = document.createElement('div');
      const title = document.createElement('div'); title.style.fontWeight = '800';
      const labelSpan = document.createElement('span'); labelSpan.className = 'task-label'; labelSpan.textContent = t.label;
      const metaSpan = document.createElement('span'); metaSpan.style.fontSize = '12px'; metaSpan.style.color = '#888'; metaSpan.style.marginLeft = '8px'; metaSpan.textContent = `( ${(t.points || 0) < 0 ? 'Needs work' : 'Positive'} )`;
      title.appendChild(labelSpan); title.appendChild(metaSpan);
      const ptsDiv = document.createElement('div'); ptsDiv.style.fontSize = '13px'; ptsDiv.style.color = '#666'; ptsDiv.textContent = 'Points: ' + ((t.points > 0) ? ('+' + t.points) : String(t.points));
      left.appendChild(title); left.appendChild(ptsDiv);

      const right = document.createElement('div'); right.style.display = 'flex'; right.style.gap = '8px';
      const edit = document.createElement('button'); edit.className = 'small-btn'; edit.textContent = 'Edit';
      const del = document.createElement('button'); del.className = 'small-btn'; del.textContent = 'Del'; del.style.background = '#e66';

      // inline edit: replace labelSpan with input when editing
      edit.onclick = () => {
        if (edit.dataset.editing === '1') return;
        edit.dataset.editing = '1';
        const orig = t.label;
        const input = document.createElement('input'); input.type = 'text'; input.value = orig; input.style.cssText = 'padding:6px;border-radius:8px;border:1px solid #e6e9ef;font-weight:800';
        try { input.setAttribute('data-gramm', 'false'); input.setAttribute('data-gramm_editor', 'false'); input.setAttribute('data-enable-grammarly', 'false'); input.setAttribute('spellcheck', 'false'); input.setAttribute('autocomplete', 'off'); input.setAttribute('autocorrect', 'off'); input.setAttribute('autocapitalize', 'off'); } catch (e) { }
        labelSpan.style.display = 'none';
        title.insertBefore(input, metaSpan);
        try { safeFocusEl(input); } catch (e) { }
        // switch edit to Save and add Cancel
        edit.textContent = 'Save';
        const cancel = document.createElement('button'); cancel.className = 'btn-muted'; cancel.textContent = 'Cancel';
        right.insertBefore(cancel, del);

        const finish = async (save) => {
          edit.dataset.editing = '0';
          if (save) { const v = (input.value || '').trim(); if (!v) { showInlineInputError(input, 'Label cannot be empty'); return; } t.label = v; try { await saveClassroom(classId, snap); } catch (e) { console.warn('saveClassroom failed', e); } }
          // cleanup and refresh
          refresh();
        };

        cancel.onclick = () => finish(false);
        edit.onclick = async () => { await finish(true); };
      };

      del.onclick = async () => {
        try {
          const ok = await openConfirm('Delete task?'); if (!ok) return;
          snap.tasks.splice(i, 1);
          try { await saveClassroom(classId, snap); } catch (e) { console.warn('saveClassroom failed', e); }
          refresh();
        } catch (e) { console.warn('delete task failed', e); }
      };

      right.appendChild(edit); right.appendChild(del); card.appendChild(left); card.appendChild(right); area.appendChild(card);
    });
  }

  // populate import class list
  function refreshImportList() {
    importSelect.innerHTML = '';
    const classes = listClassrooms().filter(c => c.id !== classId);
    if (!classes.length) {
      const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No other classes found'; importSelect.appendChild(opt); return;
    }
    const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Select a class to preview tasks'; importSelect.appendChild(placeholder);
    classes.forEach(c => {
      const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name + ' — ' + (c.tasks || 0) + ' tasks'; importSelect.appendChild(opt);
    });
  }

  async function renderImportTasksFor(classIdToLoad) {
    importTaskArea.innerHTML = '';
    if (!classIdToLoad) { importTaskArea.innerHTML = `<div style='color:#666;padding:12px;border-radius:8px;background:#fff;border:1px solid #f0f0f0'>Choose a class to see its tasks.</div>`; return; }
    let other = loadClassroom(classIdToLoad);
    if (!other) {
      try { other = await ensureClassLoaded(classIdToLoad); } catch (e) { other = null; }
    }
    if (!other || !other.tasks || !other.tasks.length) { importTaskArea.innerHTML = `<div style='color:#666;padding:12px;border-radius:8px;background:#fff;border:1px solid #f0f0f0'>No tasks found in that class.</div>`; return; }
    (other.tasks || []).forEach((t, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:10px;background:#fff;border:1px solid #f0f0f0';
      const left = document.createElement('div');
      const title = document.createElement('div'); title.style.fontWeight = '800'; title.textContent = t.label;
      const meta = document.createElement('div'); meta.style.fontSize = '12px'; meta.style.color = '#888'; meta.textContent = 'Points: ' + ((t.points > 0) ? ('+' + t.points) : String(t.points));
      left.appendChild(title); left.appendChild(meta);
      const right = document.createElement('div'); right.style.display = 'flex'; right.style.gap = '8px';
      const imp = document.createElement('button'); imp.className = 'small-btn'; imp.textContent = 'Import';
      imp.onclick = async () => {
        try {
          snap.tasks = snap.tasks || [];
          const copy = Object.assign({}, t, { id: 't-' + Math.random().toString(36).slice(2) });
          snap.tasks.push(copy);
          // write locally immediately so UI reflects change instantly
          try { localStorage.setItem(classroomKey(classId), JSON.stringify(snap)); } catch (e) { }
          // persist in background
          try { saveClassroom(classId, snap).catch(err => { console.warn('saveClassroom failed', err); showToast('Sync failed — changes saved locally', { type: 'warning' }); }); } catch (e) { }
          showToast('Imported "' + (t.label || 'task') + '"', { type: 'success' });
          refresh();
        } catch (e) { console.warn('import failed', e); showToast('Import failed', { type: 'error' }); }
      };
      right.appendChild(imp); card.appendChild(left); card.appendChild(right); importTaskArea.appendChild(card);
    });
  }

  // tab switching
  try {
    const tasksBtn = mb.querySelector('#tasksTabBtn');
    const importBtn = mb.querySelector('#importTabBtn');
    tasksBtn.addEventListener('click', () => { tasksPane.style.display = 'block'; importPane.style.display = 'none'; tasksBtn.style.background = '#fff'; tasksBtn.style.color = '#222'; importBtn.style.background = ''; importBtn.style.color = ''; });
    importBtn.addEventListener('click', () => { tasksPane.style.display = 'none'; importPane.style.display = 'block'; importBtn.style.background = '#fff'; importBtn.style.color = '#222'; tasksBtn.style.background = ''; tasksBtn.style.color = ''; refreshImportList(); renderImportTasksFor(); });
  } catch (e) { }

  // import select change handler
  try { importSelect.addEventListener('change', (ev) => { renderImportTasksFor(ev.target.value); }); } catch (e) { }
  // refreshImportList and chooseAnotherClass controls were removed per UI update
  try { mb.querySelector('#importCancel').addEventListener('click', () => { closeModal(mb); }); } catch (e) { }
  try {
    mb.querySelector('#importAllBtn').addEventListener('click', async () => {
      try {
        const cid = importSelect.value; if (!cid) { showToast('Select a class to import from', { type: 'warning' }); return; }
        let other = loadClassroom(cid); if (!other) { other = await ensureClassLoaded(cid); }
        if (!other || !other.tasks || !other.tasks.length) { showToast('No tasks to import', { type: 'warning' }); return; }
        snap.tasks = snap.tasks || [];
        const existing = new Set((snap.tasks || []).map(t => ((t.label || '').trim().toLowerCase() + '|' + (t.points || 0))));
        let added = 0;
        (other.tasks || []).forEach(t => {
          const key = (t.label || '').trim().toLowerCase() + '|' + (t.points || 0);
          if (existing.has(key)) return;
          const copy = Object.assign({}, t, { id: 't-' + Math.random().toString(36).slice(2) });
          snap.tasks.push(copy); existing.add(key); added++;
        });
        if (added > 0) {
          try { localStorage.setItem(classroomKey(classId), JSON.stringify(snap)); } catch (e) { }
          try { saveClassroom(classId, snap).catch(err => { console.warn('saveClassroom failed', err); showToast('Sync failed — changes saved locally', { type: 'warning' }); }); } catch (e) { }
          showToast('Imported ' + added + ' tasks', { type: 'success' });
          renderMgr();
        } else {
          showToast('No new tasks to import (deduplicated)', { type: 'default' });
        }
      } catch (e) { console.warn('importAll failed', e); showToast('Import failed', { type: 'error' }); }
    });
  } catch (e) { }
  // replace legacy Close button with standardized modal-close-x
  try {
    const _ensureX = () => {
      const dialog = mb.querySelector('.modal');
      let x = dialog && dialog.querySelector('.modal-close-x');
      if (!x) {
        x = document.createElement('button'); x.type = 'button'; x.className = 'modal-close-x'; x.setAttribute('aria-label', 'Close');
        const icon = (mb && mb.dataset && mb.dataset.closeIcon) ? mb.dataset.closeIcon : ((mb && mb.dataset && mb.dataset.closeLabel) ? mb.dataset.closeLabel : '✕');
        x.innerHTML = icon;
        if (dialog) dialog.appendChild(x);
        if (dialog) setTimeout(() => dialog.classList.add('modal-open'), 10);
      }
      return x;
    };
    const ctX = _ensureX(); ctX.addEventListener('click', () => closeModal(mb));
    const old = mb.querySelector('#ctClose'); if (old) old.remove();
  } catch (e) { }
  // sanitize numeric input and enforce integer values
  const ctPointsEl = mb.querySelector('#ctPoints');
  if (ctPointsEl) {
    ctPointsEl.addEventListener('input', (e) => {
      const v = e.target.value;
      // allow only digits
      const clean = v.replace(/[^0-9-]/g, '');
      if (clean !== v) e.target.value = clean;
    });
  }

  mb.querySelector('#ctAdd').onclick = async () => {
    const lab = mb.querySelector('#ctLabel').value.trim();
    const raw = mb.querySelector('#ctPoints').value;
    const ptsRaw = raw === '' ? 0 : Math.abs(parseInt(raw, 10) || 0);
    const cat = mb.querySelector('#ctCategory').value || 'positive';
    if (!lab) { showFieldError(mb, '#ctLabel', 'Enter label'); return; }
    const pts = (cat === 'needs') ? -Math.abs(ptsRaw) : Math.abs(ptsRaw);
    snap.tasks = snap.tasks || [];
    snap.tasks.push({ id: 't-' + Math.random().toString(36).slice(2), label: lab, points: pts });
    try { await saveClassroom(classId, snap); } catch (e) { console.warn('saveClassroom failed', e); }
    mb.querySelector('#ctLabel').value = ''; mb.querySelector('#ctPoints').value = ''; mb.querySelector('#ctCategory').value = 'positive';
    refresh();
  };
  refresh();
}



(async function () {
 
  try {
    if (typeof supabase === 'undefined') return; // supabase lib failed to load
    const sup = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // expose client for use elsewhere (sign-out, etc.)

    window._lf_supabase = sup;
    // Supabase client created; session fetched
    const { data } = await sup.auth.getSession();
    if (!data || !data.session) {
      // not logged in — redirect to landing page
      try { window.location.href = 'index.html'; } catch (e) { /* ignore */ }
    }
    // Set brand text to the signed-in user's first name and set `.logo` to initials.
    try {
      const brandEl = document.querySelector('.brand-text');
      const logoEl = document.querySelector('.logo');
      const sessUser = data && data.session && data.session.user ? data.session.user : (data && data.user ? data.user : null);
      let fullName = null;
      if (sessUser) {
        // prefer profiles/full_name -> user_metadata -> email localpart
        if (sessUser.user_metadata) { fullName = sessUser.user_metadata.full_name || sessUser.user_metadata.name || null; }
        // try profiles table for a richer name if available
        try {
          const userId = sessUser?.id || null;
          if (userId) {
            const profRes = await sup.from('profiles').select('full_name,username').eq('id', userId).limit(1);
            const prof = (!profRes.error && profRes.data && Array.isArray(profRes.data) && profRes.data.length) ? profRes.data[0] : null;
            const profErr = profRes.error;
            if (!profErr && prof) { fullName = fullName || prof.full_name || prof.username || fullName; }
          }
        } catch (e) { }
        if (!fullName && sessUser.email) fullName = sessUser.email.split('@')[0];
      }
      if (fullName) {
        const words = (fullName || '').trim().split(/\s+/).filter(Boolean);
        const firstName = words.length ? words[0] : fullName;
        // compute initials: first letters of first two words, or first two letters of single word
        let initials = '';
        if (words.length >= 2) { initials = (words[0][0] || '') + (words[1][0] || ''); }
        else if (words.length === 1) { initials = (words[0].slice(0, 2) || words[0][0] || ''); }
        initials = (initials || 'TD').toUpperCase();
        if (brandEl) brandEl.textContent = firstName;
        if (logoEl) {
          // create a deterministic background color from the user id or name
          function colorFromString(s) { try { if (!s) return 'hsl(270,70%,64%)'; let h = 0; for (let i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) % 360; } return 'hsl(' + h + ',68%,56%)'; } catch (e) { return 'hsl(270,70%,64%)'; } }
          const seed = (sessUser && sessUser.id) ? sessUser.id : (fullName || 'td');
          const bg = colorFromString(seed);
          const svg = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="User initials"><rect width="100" height="100" rx="14" fill="${bg}"/><text x="50" y="57" font-size="44" font-family="Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif" font-weight="800" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
          logoEl.innerHTML = svg;
        }
      }
    } catch (e) { }
    // After confirming session, fetch and merge remote classrooms for the current user
    try {
      const sess = await sup.auth.getSession();
      const userId = sess && sess.data && (sess.data.session?.user?.id || sess.data.user?.id) ? (sess.data.session?.user?.id || sess.data.user?.id) : null;
      try { window._lf_current_user_id = userId; } catch (e) { }
      if (userId) {
        // First, sync any existing local classrooms up to the remote database so user data isn't lost
        try {
          // Extracted and reusable sync function. We disable automatic sync by default
          // to avoid repeated 403/RLS noise while the DB policies are being fixed.
          async function syncAllLocalToRemote(supClient, uid) {
            try {
              for (let i = 0; i < localStorage.length; i++) {
                const k = localStorage.key(i); if (!k) continue; if (k.indexOf(CLASSROOM_PREFIX) !== 0) continue;
                try {
                  const id = k.slice(CLASSROOM_PREFIX.length);
                  const tombMs = getTombstoneMs(id);
                  if (tombMs) { continue; }
                  const snap = JSON.parse(localStorage.getItem(k) || 'null');
                  if (!snap) continue;
                  const payload = { id: id, owner: uid, name: snap.__classroomName || null, data: snap, updated_at: snap.__updated_at || new Date().toISOString() };
                  try {
                    const sessLog = await supClient.auth.getSession().catch(() => null);
                    // console.log('syncAllLocalToRemote upsert attempt', { userId: uid, session: sessLog && sessLog.data && sessLog.data.session ? sessLog.data.session.user?.id : null, payloadOwner: payload.owner, id: payload.id }); 
                  } catch (e) { }
                  // Check remote owner first to avoid triggering RLS update/using checks
                  try {
                    const existingQ = await supClient.from('classrooms').select('owner').eq('id', id).limit(1);
                    const existingRow = (!existingQ.error && existingQ.data && Array.isArray(existingQ.data) && existingQ.data.length) ? existingQ.data[0] : null;
                    if (existingRow && existingRow.owner && existingRow.owner !== uid) {
                      console.warn('Skipping sync for id with remote owner mismatch', { id: id, localOwner: uid, remoteOwner: existingRow.owner });
                      // avoid retry noise by setting a tombstone so future automatic syncs skip it
                      try { setTombstone(id); } catch (e) { }
                      // show a one-time toast to inform the user
                      try { window.showToast && window.showToast('Skipped syncing class "' + (payload.name || id) + '" because it belongs to a different account.', { type: 'warning', duration: 6000 }); } catch (e) { }
                      continue;
                    }
                  } catch (e) { console.warn('remote owner check failed', e); }

                  const upRes = await supClient.from('classrooms').upsert(payload);
                  if (upRes && upRes.error) {
                    // Log full context for debugging
                    console.warn('sync local->remote error', { id, payload, error: upRes.error });
                    // If Row-Level Security blocked the write, set a tombstone so we
                    // don't repeatedly retry the same failing row during manual syncs.
                    try {
                      if (upRes.error && String(upRes.error.code) === '42501') {
                        try { window.showToast && window.showToast('Skipped syncing "' + (payload.name || id) + '" — blocked by DB Row-Level Security. See Fix SQL (Show Fix SQL).', { type: 'warning', duration: 8000 }); } catch (e) { }
                        try { setTombstone(id); } catch (e) { }
                        // mark local snapshot for inspection
                        try { const cur = JSON.parse(localStorage.getItem(classroomKey(id)) || 'null') || {}; cur.__sync_blocked = { ts: Date.now(), reason: upRes.error.message || String(upRes.error) }; localStorage.setItem(classroomKey(id), JSON.stringify(cur)); } catch (e) { }
                        // continue to next item
                        continue;
                      }
                    } catch (e) { console.warn('handling upsert error failed', e); }
                  }
                } catch (e) { console.warn('sync single local classroom failed', e); }
              }
            } catch (e) { console.warn('syncAllLocalToRemote failed', e); }
          }

          // Only run automatic sync if explicitly enabled. Default: disabled.
          if (window._lf_enable_sync) {
            await syncAllLocalToRemote(sup, userId);
          }
          // else {
          //   console.log('Auto sync disabled (window._lf_enable_sync=false). Manual sync available.');

          // }
        } catch (e) { console.warn('syncAllLocalToRemote failed', e); }

        // fetch remote classrooms and merge into localStorage (remote wins if newer)
        try {
          const { data: rows, error } = await sup.from('classrooms').select('id, data, updated_at').eq('owner', userId);
          if (!error && Array.isArray(rows)) {
            rows.forEach(r => {
              try {
                const remoteUpdated = r.updated_at || null;
                const remoteMs = remoteUpdated ? new Date(remoteUpdated).getTime() : 0;
                const tombMs = getTombstoneMs(r.id);
                // If we have a local tombstone that is newer or equal to the remote row, skip restoring it
                if (tombMs && tombMs >= remoteMs) { return; }
                const localSnap = JSON.parse(localStorage.getItem(classroomKey(r.id)) || 'null');
                // if no local or remote is newer, write remote
                if (!localSnap || !localSnap.__updated_at || (remoteUpdated && new Date(remoteUpdated) > new Date(localSnap.__updated_at))) {
                  const toSave = r.data || {};
                  try { toSave.__updated_at = remoteUpdated; } catch (e) { }
                  try { try { toSave.__owner = userId; } catch (e) { } localStorage.setItem(classroomKey(r.id), JSON.stringify(toSave)); } catch (e) { }
                }
              } catch (e) { }
            });
            try { renderSidebar(); } catch (e) { }
            // From this point forward prefer DB as the single source of truth
            try { window._lf_db_only = true; } catch (e) { }
          }
        } catch (e) { console.warn('fetch remote classrooms failed', e); }
      }
    } catch (e) { }
    // wire sign-out button if present
    // wire sign-out button if present
    try {
      const signOutBtn = document.getElementById('signOutBtn');
      if (signOutBtn) {
        signOutBtn.onclick = async () => {
          const sup = window._lf_supabase;
          if (!sup) return;

          await sup.auth.signOut();

          // clear app-level user state
          window._lf_current_user_id = null;

          // redirect to landing page
          window.location.href = 'index.html';
        };
      }
    } catch (e) {
      console.warn('Sign-out failed', e);
    }

  } catch (e) { console.warn('Auth check failed', e); }
})();
// Move the topbar into the app container on small screens so it's visually grouped with the app
(function manageTopbarPlacement() {
  try {
    const topbar = document.querySelector('.topbar'); if (!topbar) return;
    if (!topbar.__originalHost) { topbar.__originalHost = topbar.parentNode; topbar.__originalNext = topbar.nextSibling; }
    const appEl = document.querySelector('.app'); if (!appEl) return;

    // Diagnostic helper: logs placement info to the console for debugging on-device
    function logPlacement(note) {
      try {
        const rect = topbar.getBoundingClientRect();
        const host = topbar.parentNode && topbar.parentNode.className ? topbar.parentNode.className : String(topbar.parentNode);
        // console.log('[topbar-placement]', note || '', {
        //   width: window.innerWidth,
        //   parent: host,
        //   containsInApp: appEl.contains(topbar),
        //   classes: topbar.className,
        //   rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
        //   offsetTop: topbar.offsetTop,
        //   computed: window.getComputedStyle(topbar).cssText || window.getComputedStyle(topbar)
        // });
      } catch (e) { console.warn('topbar log failed', e); }
    }

    function moveIn() {
      const topbar = document.querySelector('.topbar');
      try {
        // If already moved and flagged, no-op
        if (appEl.contains(topbar) && topbar.classList.contains('moved-to-app')) { logPlacement('already moved'); return; }
        // Insert as the very first element inside .app so it visually sits above the sidebar/main
        // Use firstElementChild to avoid inserting before text nodes
        const ref = appEl.firstElementChild || appEl.firstChild;
        if (ref) appEl.insertBefore(topbar, ref); else appEl.appendChild(topbar);
        // add marker class and stronger inline pinning to ensure it visually sits at the top
        topbar.classList.add('moved-to-app');
        // Clear any previous inline offsets then apply forced pinned layout
        topbar.style.position = 'absolute';
        topbar.style.top = '0px';
        topbar.style.left = '0px';
        topbar.style.right = '0px';
        topbar.style.zIndex = '9999';
        // ensure the app main content isn't hidden under the pinned topbar
        try {
          const main = document.querySelector('.main');
          if (main) { const h = Math.max(56, Math.round(topbar.getBoundingClientRect().height || 64)); main.style.paddingTop = (h + 8) + 'px'; }
        } catch (e) { }
        logPlacement('moved in (forced)');
      } catch (e) { console.warn('moveIn failed', e); }
    }

    function moveOut() {
      // when restoring
      topbar.classList.remove('moved-to-app');
      const actions = document.getElementById('topbarActions');
      if (actions) actions.classList.remove('compact-icons');

      try {
        if (topbar.__originalHost && topbar.__originalHost.contains(topbar)) { logPlacement('already restored'); return; }
        const host = topbar.__originalHost || document.body;
        if (host) { if (topbar.__originalNext && topbar.__originalNext.parentNode === host) host.insertBefore(topbar, topbar.__originalNext); else host.appendChild(topbar); }
        topbar.classList.remove('moved-to-app');
        // remove forced inline styles (restore CSS control)
        topbar.style.position = '';
        topbar.style.top = '';
        topbar.style.left = '';
        topbar.style.right = '';
        topbar.style.zIndex = '';
        // restore main padding if present
        try { const main = document.querySelector('.main'); if (main) main.style.paddingTop = ''; } catch (e) { }
        logPlacement('moved out (restored)');
      } catch (e) { console.warn('moveOut failed', e); }
    }

    // Use a slightly larger threshold so most phones/tablets get the mobile layout
    function apply() { if (window.innerWidth <= 960) moveIn(); else moveOut(); }

    // run on DOM ready and on resize
    document.addEventListener('DOMContentLoaded', apply);
    window.addEventListener('resize', apply);
    // also run shortly after load in case DOMContentLoaded already fired
    setTimeout(apply, 20);
    // expose a quick window helper so user can re-run or inspect from console
    try { window.__fd_debug_topbar = { log: logPlacement, apply: apply, moveIn: moveIn, moveOut: moveOut }; } catch (e) { }
  } catch (e) { console.warn('manageTopbarPlacement failed', e); }
})();



// Responsive sidebar enforcement: auto-collapse on small screens
function enforceResponsiveSidebar() {
  try {
    if (window.innerWidth <= 960) {
      // small screens: use overlay pattern. remove compact collapsed state.
      sidebar.classList.remove('collapsed'); sidebar.classList.remove('open');
      const back = document.getElementById('sidebarBack'); if (back) back.remove(); if (collapseBtn) collapseBtn.setAttribute('aria-expanded', 'false');
    } else {
      // desktop: ensure sidebar isn't open overlay; preserve collapsed as-is
      sidebar.classList.remove('open');
      const back = document.getElementById('sidebarBack'); if (back) back.remove(); if (collapseBtn) collapseBtn.setAttribute('aria-expanded', String(!sidebar.classList.contains('collapsed')));
    }
    // Ensure the stacked sidebar action buttons are only visible on small screens
    try { const sab = document.querySelector('.side-actions-buttons'); if (sab) sab.style.display = (window.innerWidth <= 960) ? '' : 'none'; } catch (e) { }
  } catch (e) { }
}
window.addEventListener('resize', enforceResponsiveSidebar);
enforceResponsiveSidebar();
// classActionsBar removed: action buttons live in sidebar `.side-actions` now
// Move mobileMenuBtn into the main content area on small screens so it's at the top-left of main
(function manageMobileMenuPlacement() {
  try {
    const btn = document.getElementById('mobileMenuBtn'); if (!btn) return;
    if (!btn.__originalHost) { btn.__originalHost = btn.parentNode; btn.__originalNext = btn.nextSibling; }
    const appEl = document.querySelector('.app'); if (!appEl) return;
    function moveIn() {
      const topbar = document.querySelector('.topbar');
      if (!topbar) return;
      topbar.classList.add('moved-to-app');
      const actions = document.getElementById('topbarActions');
      if (actions) actions.classList.add('compact-icons');

      if (appEl.contains(btn) && btn.classList.contains('mobile-menu-main')) return;
      // Prefer inserting into the app-topline left column if it exists to avoid flicker.
      const wrapper = document.querySelector('.app-topline');
      if (wrapper) {
        const left = wrapper.children && wrapper.children[0];
        if (left) {
          left.insertBefore(btn, left.firstChild || null);
          btn.classList.add('mobile-menu-main');
          return;
        }
      }
      // fallback: insert at the start of the app so it appears at the top-left of the app container
      appEl.insertBefore(btn, appEl.firstChild);
      btn.classList.add('mobile-menu-main');
    }
    function moveOut() {
      topbar.classList.remove('moved-to-app');
      const actions = document.getElementById('topbarActions');
      if (actions) actions.classList.remove('compact-icons');
      if (btn.__originalHost && btn.__originalHost.contains(btn)) return;
      // restore to original place
      const host = btn.__originalHost || document.querySelector('.topbar');
      if (host) { if (btn.__originalNext && btn.__originalNext.parentNode === host) host.insertBefore(btn, btn.__originalNext); else host.appendChild(btn); }
      btn.classList.remove('mobile-menu-main');
    }
    // Always keep the mobile button inside the app-topline to avoid it being hidden
    // by its original inline `display:none` on larger screens.
    function apply() { try { moveIn(); } catch (e) { console.warn('mobileBtn apply failed', e); } }
    window.addEventListener('resize', apply);
    setTimeout(apply, 20);
  } catch (e) { console.warn('manageMobileMenuPlacement failed', e); }
})();

// Mobile floating right-side menu: icon-only buttons that open panels / trigger actions.
(function manageMobileFloatingMenu() {
  try {
    let menu = null;
    let popover = null;
    // timestamp (ms) of the most recent panel/modal open action; used to ignore
    // the immediate click that triggered the open which would otherwise be
    // interpreted as an outside click and close the newly-opened panel.
    let _lastPanelOpenMs = 0;
    // Prevent reentrant open/close cycles when multiple handlers fire in quick succession
    let _openExclusiveLocked = false;
    let _prevTopbarActionsDisplay = null;

    function clearActiveBtn() {
      try { Array.from(document.querySelectorAll('.mobile-float-menu .icon-btn')).forEach(b => b.classList.remove('active')); } catch (e) { }
    }

    function closeAllMobilePanels() {
      try {
        // close account/options dropdowns if open
        try { if (optionsMenu) { optionsMenu.style.display = 'none'; optionsToggleBtn && optionsToggleBtn.setAttribute('aria-expanded', 'false'); } } catch (e) { }
        try { const acct = document.getElementById('accountDropdown'); if (acct) acct.style.display = 'none'; const btn = document.getElementById('accountBtn'); if (btn) btn.setAttribute('aria-expanded', 'false'); } catch (e) { }
        // hide any in-page float popover we created
        try { if (popover && popover.parentNode) { popover.remove(); popover = null; } } catch (e) { }
        // close sidebar overlay if open
        try { if (sidebar && sidebar.classList.contains('open')) { sidebar.classList.remove('open'); const b = document.getElementById('sidebarBack'); if (b) b.remove(); collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false'); } } catch (e) { }
        // remove active state from mobile buttons
        try { clearActiveBtn(); } catch (e) { }
      } catch (e) { }
    }

    // Close all known small panels except those specified in `exceptKeys` array
    function closeAllExcept(exceptKeys) {
      try {
        try { console.debug('[mobile-float] closeAllExcept', { exceptKeys: exceptKeys, t: Date.now() }); } catch (e) { }
        exceptKeys = Array.isArray(exceptKeys) ? exceptKeys : [];
        const shouldKeep = k => exceptKeys.indexOf(k) !== -1;
        // options menu
        try { if (optionsMenu && !shouldKeep('options')) { optionsMenu.style.display = 'none'; optionsToggleBtn && optionsToggleBtn.setAttribute('aria-expanded', 'false'); } } catch (e) { }
        // account dropdown
        try { const acct = document.getElementById('accountDropdown'); if (acct && !shouldKeep('account')) { acct.style.display = 'none'; const btn = document.getElementById('accountBtn'); if (btn) btn.setAttribute('aria-expanded', 'false'); } } catch (e) { }
        // mobile popover
        try { const pf = document.getElementById('mobileFloatPopover'); if (pf && !shouldKeep('popover')) { pf.remove(); popover = null; } } catch (e) { }
        // sidebar overlay/backdrop
        try { if (sidebar && sidebar.classList.contains('open') && !shouldKeep('sidebar')) { sidebar.classList.remove('open'); const b = document.getElementById('sidebarBack'); if (b) b.remove(); collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false'); } } catch (e) { }
        // hide any mini menus
        try { Array.from(document.querySelectorAll('.mini-menu, .mini-menu.open')).forEach(m => { if (!shouldKeep('mini-menu')) { m.classList.remove('open'); if (m.style) m.style.display = 'none'; } }); } catch (e) { }
        // modals: if we don't explicitly keep modals, close them
        try { if (!shouldKeep('modal')) { const mbs = Array.from(document.querySelectorAll('.modal-backdrop')); mbs.forEach(m => closeModal(m)); } } catch (e) { }
        // clear active mobile buttons unless we kept a button
        try { if (!shouldKeep('mobileButton')) clearActiveBtn(); } catch (e) { }
      } catch (e) { }
    }

    // Open a panel exclusively: close others, run show(), and set active state on opener
    function openExclusivePanel(key, openerBtn, showFn) {
      try {
        // normalize key
        const k = key || 'panel';
        try { console.debug('[mobile-float] openExclusivePanel', { key: k, opener: (openerBtn && (openerBtn.getAttribute('data-mf-id') || openerBtn.id)) || null, t: Date.now() }); } catch (e) { }
        // record open time so the document click handler can ignore the click that
        // initiated this open (prevents immediate self-closing due to event path timing)
        try { _lastPanelOpenMs = Date.now(); window.__fd_lastPanelOpenMs = _lastPanelOpenMs; } catch (e) { }
        // if another open is in progress, postpone to avoid toggling UI rapidly
        if (_openExclusiveLocked) {
          try { console.debug('[mobile-float] openExclusivePanel postponed (locked)', { key: k }); } catch (e) { }
          return setTimeout(() => openExclusivePanel(k, openerBtn, showFn), 30);
        }
        _openExclusiveLocked = true;
        // Special-case: when opening a modal we must first close any existing modals
        // so they do not stack visually. For other panels keep the mobile button
        // during the transition to preserve the opener's active state.
        try {
          if (k === 'modal') {
            console.debug && console.debug('[mobile-float] opening modal: closing existing modals first');
            closeAllExcept([]);
          } else {
            closeAllExcept([k, 'mobileButton']);
          }
        } catch (e) { }
        // set active indicator on opener button (clear others first)
        try { clearActiveBtn(); if (openerBtn && openerBtn.classList) openerBtn.classList.add('active'); } catch (e) { }
        // call show function to reveal UI for this panel
        try { if (typeof showFn === 'function') showFn(); }
        catch (e) { console.warn('openExclusivePanel show function failed', e); }
        // unlock after a short delay to allow mutation observers / nested handlers to settle
        setTimeout(() => { _openExclusiveLocked = false; try { console.debug('[mobile-float] openExclusivePanel unlocked', { key: k }); } catch (e) { } }, 40);
      } catch (e) { console.warn('openExclusivePanel failed', e); }
    }

    function makeIconButton(id, icon, label) {
      const b = document.createElement('button'); b.className = 'icon-btn'; b.type = 'button'; b.setAttribute('data-mf-id', id); b.setAttribute('aria-label', label || id);
      // icon node
      const ic = document.createElement('span'); ic.className = 'mf-icon'; ic.innerHTML = icon;
      // label node (appears on hover/focus)
      const lab = document.createElement('span'); lab.className = 'mf-label'; lab.textContent = label || '';
      b.appendChild(ic); b.appendChild(lab);
      // touch support: show label briefly on touch so mobile users can see the action name
      try {
        let _tTid = null;
        b.addEventListener('touchstart', () => { try { b.classList.add('show-mf-label'); if (_tTid) clearTimeout(_tTid); } catch (e) { } }, { passive: true });
        b.addEventListener('touchend', () => { try { if (_tTid) clearTimeout(_tTid); _tTid = setTimeout(() => { try { b.classList.remove('show-mf-label'); } catch (e) { } }, 700); } catch (e) { } }, { passive: true });
      } catch (e) { }
      return b;
    }

    function showPopoverFor(buttonId, contentEl) {
      // Close other panels but keep the popover we're about to show so it doesn't self-close
      closeAllExcept(['popover']);
      try {
        if (!popover) { popover = document.createElement('div'); popover.id = 'mobileFloatPopover'; popover.className = 'mobile-float-popover'; document.body.appendChild(popover); }
        popover.innerHTML = '';
        if (typeof contentEl === 'string') popover.innerHTML = contentEl; else if (contentEl instanceof Element) popover.appendChild(contentEl);
        popover.classList.add('show');
      } catch (e) { console.warn('showPopover failed', e); }
    }

    function buildMenu() {
      if (menu) return menu;
      menu = document.createElement('div'); menu.id = 'mobileFloatMenu'; menu.className = 'mobile-float-menu';

      // define desired buttons (icons chosen to match page visuals)
      const defs = [
        { id: 'mf-add-students', icon: '➕', target: 'btnAddStudent', label: 'Add / Edit students' },
        { id: 'mf-add-tasks', icon: '🛠', target: 'btnAddTasks', label: 'Add tasks' },
        // { id: 'mf-reports', icon: '📊', target: 'btnReports', label: 'Reports' },
        { id: 'mf-remove', icon: '🗑', target: 'btnRemoveClass', label: 'Remove class' }
      ];

      defs.forEach(d => {
        const btn = makeIconButton(d.id, d.icon, d.label);
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          // mutual exclusion: if this button is already active -> close everything
          try {
            const already = btn.classList.contains('active');
            if (already) {
              closeAllMobilePanels();
              // if a modal exists, try close it too
              try { const mb = document.querySelector('.modal-backdrop'); if (mb) closeModal(mb); } catch (e) { }
              return;
            }
            // otherwise close any other panels and mark this one active
            closeAllMobilePanels();
            clearActiveBtn(); btn.classList.add('active');

            // trigger the original button to reuse existing handlers and modals
            const orig = document.getElementById(d.target);
            if (orig) {
              openExclusivePanel('modal', btn, () => {
                // observe modal lifecycle to clear active state
                const obs = new MutationObserver((mutations, observer) => {
                  try {
                    const added = Array.from(document.querySelectorAll('.modal-backdrop'));
                    if (added.length) {
                      const checkRemoval = () => {
                        const current = document.querySelectorAll('.modal-backdrop');
                        if (!current || current.length === 0) { clearActiveBtn(); observer.disconnect(); document.removeEventListener('modal:maybeClosed', checkRemoval); }
                      };
                      document.addEventListener('modal:maybeClosed', checkRemoval);
                    }
                  } catch (e) { }
                });
                obs.observe(document.body, { childList: true, subtree: true });
                orig.click();
              });
            } else {
              // fallback: show a quick popover note (exclusive)
              openExclusivePanel('popover', btn, () => { showPopoverFor(d.id, `<div style="font-weight:800">${d.label}</div><div style='margin-top:6px;color:#667;font-size:13px'>Action triggered</div>`); });
            }
          } catch (e) { console.warn('mobile float action failed', e); }
        });
        menu.appendChild(btn);
      });

      // clicking outside: close everything unless click is inside a known panel/button
      document.addEventListener('click', (ev) => {
        try {
          // If we just opened a panel very recently, ignore this click (it's likely
          // the original click that started the opening action and its composedPath
          // won't include the newly-inserted modal). Use a small grace window.
          try {
            const last = (window.__fd_lastPanelOpenMs || _lastPanelOpenMs || 0);
            if (Date.now() - last < 90) { try { console.debug('[mobile-float] ignored click due to recent open', { delta: Date.now() - last }); } catch (e) { } return; }
          } catch (e) { }
          // ignore programmatic clicks (not initiated by a real user gesture) to avoid
          // handling synthetic clicks we dispatch (eg. orig.click()) which would be
          // treated as an outside click and prematurely close panels
          if (ev && ev.isTrusted === false) { try { console.debug('[mobile-float] ignored non-trusted click'); } catch (e) { } return; }
          // use composedPath when available to handle clicks on text nodes / shadow DOM
          const path = (ev.composedPath && ev.composedPath()) || (function () { const p = []; let n = ev.target; while (n) { p.push(n); n = n.parentNode; } return p; })();
          // clicks inside the floating menu, popover, options, account dropdown or any modal/backdrop
          // should NOT trigger the global outside-click close
          try {
            if (menu && path.indexOf(menu) !== -1) return;
            if (popover && path.indexOf(popover) !== -1) return;
            if (optionsMenu && (path.indexOf(optionsMenu) !== -1 || (optionsToggleBtn && path.indexOf(optionsToggleBtn) !== -1))) return;
            const acct = document.getElementById('accountDropdown'); if (acct && (path.indexOf(acct) !== -1 || (accountBtn && path.indexOf(accountBtn) !== -1))) return;
            // modal/backdrop clicks: ignore so inputs and buttons inside modals work normally
            for (const n of path) {
              try { if (n && n.classList && (n.classList.contains && (n.classList.contains('modal') || n.classList.contains('modal-backdrop')))) { try { console.debug('[mobile-float] click inside modal/backdrop - ignoring'); } catch (e) { } return; } } catch (e) { }
            }
          } catch (e) { }
          // click outside known panels -> close all
          try { console.debug('[mobile-float] outside click -> closing all', { t: Date.now() }); } catch (e) { }
          closeAllExcept([]);
        } catch (e) { }
      });

      return menu;
    }

    function apply() {
      try {
        // Always ensure the floating menu exists and hide the legacy topbar actions so
        // this menu fully replaces the old topbar actions on all layouts.
        try {
          const m = buildMenu(); if (!document.body.contains(m)) document.body.appendChild(m);
        } catch (e) { }
        try {
          const tacts = document.getElementById('topbarActions');
          if (tacts && _prevTopbarActionsDisplay === null) { _prevTopbarActionsDisplay = tacts.style.display || ''; tacts.style.display = 'none'; tacts.classList.add('hidden-by-mobile-float'); }
          // guard: if some other code tries to show the legacy topbar actions on desktop,
          // enforce hidden so the floating menu remains the single source of truth.
          try {
            if (tacts && !tacts.__fd_hidden_observer) {
              const obs = new MutationObserver(() => {
                try { if (tacts.style.display !== 'none') { tacts.style.display = 'none'; tacts.classList.add('hidden-by-mobile-float'); } } catch (e) { }
              });
              obs.observe(tacts, { attributes: true, attributeFilter: ['style', 'class'] });
              tacts.__fd_hidden_observer = obs;
            }
          } catch (e) { }
        } catch (e) { }
        // also close any other small panels to ensure exclusive UI
        try { closeAllExcept([]); } catch (e) { }
      } catch (e) { console.warn('apply mobile float failed', e); }
    }

    window.addEventListener('resize', apply);
    document.addEventListener('DOMContentLoaded', apply);
    // also run soon after load
    setTimeout(apply, 30);
    // Observe DOM for modals being added/removed — when a modal appears, ensure other panels are closed
    try {
      const bodyObs = new MutationObserver((mutations) => {
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length) {
            for (const n of m.addedNodes) {
              try {
                if (n && n.classList && n.classList.contains('modal-backdrop')) {
                  // a modal opened: record recent open time and close all other panels but keep the modal
                  try { _lastPanelOpenMs = Date.now(); window.__fd_lastPanelOpenMs = _lastPanelOpenMs; } catch (e) { }
                  try { closeAllExcept(['modal']); } catch (e) { }
                }
              } catch (e) { }
            }
          }
        }
      });
      bodyObs.observe(document.body, { childList: true, subtree: true });
    } catch (e) { }
    // expose helpers for debugging and legacy usage (make functions globally callable)
    try {
      window.__fd_mobile_float = { apply, closeAll: closeAllMobilePanels, openExclusivePanel, closeAllExcept, clearActiveBtn };
      // backwards-compatible globals (used elsewhere in the file)
      window.openExclusivePanel = openExclusivePanel;
      window.closeAllExcept = closeAllExcept;
      window.closeAllMobilePanels = closeAllMobilePanels;
    } catch (e) { }
  } catch (e) { console.warn('manageMobileFloatingMenu failed', e); }
})();
// Global error handlers to help diagnose uncaught exceptions and promise rejections
window.addEventListener('unhandledrejection', function (evt) {
  try {
    // Log the reason (often Error) and the full event for inspection
    console.error('Unhandled promise rejection detected (teachers.html):', evt.reason, evt);
  } catch (e) { console.error('Error logging unhandledrejection', e); }
});
window.addEventListener('error', function (evt) {
  try {
    console.error('Global error captured (teachers.html):', { message: evt.message, filename: evt.filename, lineno: evt.lineno, colno: evt.colno, error: evt.error });
  } catch (e) { console.error('Error logging global error', e); }
});

// Basic classroom manager for teachers page
const CLASSROOM_PREFIX = 'fairy_classroom_';
const TOMBSTONE_PREFIX = 'fairy_deleted_';
function uid() { return 'c-' + Math.random().toString(36).slice(2) }
function classroomKey(id) { return CLASSROOM_PREFIX + id }
function tombstoneKey(id) { return TOMBSTONE_PREFIX + id }
function setTombstone(id) { try { localStorage.setItem(tombstoneKey(id), String(Date.now())); } catch (e) { } }
function clearTombstone(id) { try { localStorage.removeItem(tombstoneKey(id)); } catch (e) { } }
function getTombstoneMs(id) { try { const v = localStorage.getItem(tombstoneKey(id)); return v ? parseInt(v, 10) : 0 } catch (e) { return 0 } }
function listClassrooms() {
  const out = [];
  const curUser = (typeof window !== 'undefined' && window._lf_current_user_id) ? window._lf_current_user_id : null;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i); if (!k) continue; if (k.indexOf(CLASSROOM_PREFIX) !== 0) continue;
    try {
      const obj = JSON.parse(localStorage.getItem(k));
      // If a current user is present, skip classrooms owned by a different user.
      if (curUser && obj && obj.__owner && obj.__owner !== curUser) continue;
      out.push({ id: k.slice(CLASSROOM_PREFIX.length), name: obj && obj.__classroomName ? obj.__classroomName : ('Class ' + k.slice(CLASSROOM_PREFIX.length)), students: (obj && obj.students && obj.students.length) || 0, tasks: (obj && obj.tasks && obj.tasks.length) || 0 });
    } catch (e) { }
  }
  out.sort((a, b) => a.name.localeCompare(b.name)); return out;
}
async function saveClassroom(id, snapshot) {
  // stamp snapshot with updated time
  const ts = new Date().toISOString();
  try { snapshot.__updated_at = ts; } catch (e) { }

  // If no Supabase client, fall back to local-only behavior
  try {
    const sup = window._lf_supabase;
    if (!sup) { try { localStorage.setItem(classroomKey(id), JSON.stringify(snapshot)); } catch (e) { } return true; }
    // Ensure we have an authenticated user
    const sess = await sup.auth.getSession();
    const userId = sess && sess.data && (sess.data.session?.user?.id || sess.data.user?.id) ? (sess.data.session?.user?.id || sess.data.user?.id) : null;
    if (!userId) { try { localStorage.setItem(classroomKey(id), JSON.stringify(snapshot)); } catch (e) { } return true; }

    // Fetch remote row if present to merge reliably
    let remoteRow = null;
    try {
      const q = await sup.from('classrooms').select('data,updated_at').eq('id', id).limit(1);
      if (!q.error && q.data && Array.isArray(q.data) && q.data.length) remoteRow = q.data[0];
    } catch (e) { console.warn('fetch remote row failed', e); }

    const remoteData = (remoteRow && remoteRow.data) ? remoteRow.data : null;
    const merged = {};
    // base fields
    merged.__classroomName = (snapshot && snapshot.__classroomName) ? snapshot.__classroomName : (remoteData && remoteData.__classroomName) ? remoteData.__classroomName : null;
    merged.created = (remoteData && remoteData.created) ? remoteData.created : (snapshot && snapshot.created) ? snapshot.created : Date.now();

    // Merge students
    const localStudents = (snapshot && Array.isArray(snapshot.students)) ? snapshot.students : [];
    const remoteStudents = (remoteData && Array.isArray(remoteData.students)) ? remoteData.students : [];
    const studentsMap = new Map();
    function addStudent(s) {
      if (!s || !s.id) return; if (!studentsMap.has(s.id)) studentsMap.set(s.id, JSON.parse(JSON.stringify(s))); else {
        const cur = studentsMap.get(s.id);
        cur.name = (s.name && s.name.length > 0) ? s.name : cur.name;
        cur.doorTheme = s.doorTheme || cur.doorTheme;
        cur.gender = s.gender || cur.gender;
        cur.photo = s.photo || cur.photo;
        cur.history = cur.history || [];
        (s.history || []).forEach(h => { if (!cur.history.find(x => x.ts === h.ts && x.task === h.task && x.points === h.points)) cur.history.push(h); });
      }
    }
    remoteStudents.forEach(addStudent); localStudents.forEach(addStudent);
    const mergedStudents = Array.from(studentsMap.values()).map(s => { s.history = (s.history || []).slice().sort((a, b) => (a.ts || 0) - (b.ts || 0)); s.total = (s.history || []).reduce((acc, h) => (acc + (h.points || 0)), 0); return s; });
    merged.students = mergedStudents;

    // Tasks: treat the caller-provided snapshot.tasks as authoritative for adds/edits/deletes.
    // Previously we merged remote+local which could reintroduce deleted tasks from the
    // remote copy. Use local snapshot when available so user edits are preserved.
    const localTasks = (snapshot && Array.isArray(snapshot.tasks)) ? snapshot.tasks : [];
    merged.tasks = JSON.parse(JSON.stringify(localTasks || []));

    // Merge photo store (union)
    try { const localPhotos = (function () { try { return loadPhotoStore(); } catch (e) { return {}; } })(); const remotePhotos = (remoteData && remoteData.photos) ? remoteData.photos : {}; merged.photos = Object.assign({}, remotePhotos, localPhotos); } catch (e) { merged.photos = (remoteData && remoteData.photos) ? remoteData.photos : (function () { try { return loadPhotoStore(); } catch (e) { return {}; } })(); }

    merged.__updated_at = new Date().toISOString();
    try { Object.keys(snapshot || {}).forEach(k => { if (!['students', 'tasks', 'photos', 'created', '__classroomName', '__updated_at'].includes(k)) merged[k] = snapshot[k]; }); } catch (e) { }

    const payload = { id: id, owner: userId, name: merged.__classroomName || null, data: merged, updated_at: merged.__updated_at };
    // upsert and request returned row when possible
    try {
      const sessLog = await sup.auth.getSession().catch(() => null);
      // console.log('saveClassroom upsert', { userId: userId, session: sessLog && sessLog.data && sessLog.data.session ? sessLog.data.session.user?.id : null, id }); 
    } catch (e) { }
    const upsertRes = await sup.from('classrooms').upsert(payload).select();
    if (upsertRes && upsertRes.error) {
      console.warn('classrooms upsert error', upsertRes.error);
      try {
        if (upsertRes.error && upsertRes.error.code === '42501') { try { window.showToast && window.showToast('Sync blocked by DB policy (Row-Level Security). Check Supabase policies for table `classrooms`.', { type: 'error', duration: 8000 }); } catch (e) { } }
      } catch (e) { }
      try { try { merged.__owner = userId; } catch (e) { } localStorage.setItem(classroomKey(id), JSON.stringify(merged)); } catch (e) { }
      return false;
    }
    // prefer authoritative data returned from the DB if present
    const returned = (upsertRes && upsertRes.data && Array.isArray(upsertRes.data) && upsertRes.data[0]) ? upsertRes.data[0] : null;
    const toCache = (returned && returned.data) ? returned.data : merged;
    try { try { toCache.__owner = userId; } catch (e) { } localStorage.setItem(classroomKey(id), JSON.stringify(toCache)); } catch (e) { }
    return true;
  } catch (e) { console.warn('sync classroom failed', e); try { localStorage.setItem(classroomKey(id), JSON.stringify(snapshot)); } catch (e) { } return false; }
}

function loadClassroom(id) {
  try {
    const local = JSON.parse(localStorage.getItem(classroomKey(id)) || 'null');
    // background fetch from Supabase to update local cache if remote version available
    (async () => {
      try {
        const sup = window._lf_supabase; if (!sup) return;
        const res = await sup.from('classrooms').select('data, updated_at').eq('id', id).limit(1);
        const row = (!res.error && res.data && Array.isArray(res.data) && res.data.length) ? res.data[0] : null;
        if (row && row.data) {
          try {
            // Only overwrite local if remote is newer and not blocked by a tombstone
            const remoteUpdated = row.updated_at || null;
            const remoteMs = remoteUpdated ? new Date(remoteUpdated).getTime() : 0;
            const tombMs = getTombstoneMs(id);
            // If a tombstone exists that is newer or equal to the remote row, skip restoring it
            if (tombMs && tombMs >= remoteMs) return;
            const localSnap = JSON.parse(localStorage.getItem(classroomKey(id)) || 'null');
            if (!localSnap || !localSnap.__updated_at || (remoteUpdated && new Date(remoteUpdated) > new Date(localSnap.__updated_at))) {
              const toSave = row.data; try { toSave.__updated_at = remoteUpdated; } catch (e) { }
              try { try { if (window && window._lf_current_user_id) toSave.__owner = window._lf_current_user_id; } catch (e) { } localStorage.setItem(classroomKey(id), JSON.stringify(toSave)); } catch (e) { }
            }
          } catch (e) { }
        }
      } catch (e) { }
    })();
    return local;
  } catch (e) { return null }
}
// Ensure a classroom is loaded: return local snapshot if present,
// otherwise attempt to fetch from Supabase (async) and persist locally.
async function ensureClassLoaded(id) {
  try {
    const localSnap = loadClassroom(id);
    if (localSnap) return localSnap;
    const sup = window._lf_supabase; if (!sup) return null;
    const res = await sup.from('classrooms').select('data, updated_at').eq('id', id).limit(1);
    const row = (!res || res.error || !res.data || !Array.isArray(res.data) || !res.data.length) ? null : res.data[0];
    if (row && row.data) {
      // Respect tombstones: do not restore a remote row if we've tombstoned it recently
      const remoteUpdated = row.updated_at || null;
      const remoteMs = remoteUpdated ? new Date(remoteUpdated).getTime() : 0;
      const tombMs = getTombstoneMs(id);
      if (tombMs && tombMs >= remoteMs) return null;
      const toSave = row.data; try { toSave.__updated_at = row.updated_at || new Date().toISOString(); } catch (e) { }; try { try { if (window && window._lf_current_user_id) toSave.__owner = window._lf_current_user_id; } catch (e) { } localStorage.setItem(classroomKey(id), JSON.stringify(toSave)); } catch (e) { } return toSave;
    }
  } catch (e) { console.warn('ensureClassLoaded failed', e); }
  return null;
}
function deleteClassroom(id) {
  try {
    // Immediately remove the local cache and set a tombstone so the UI updates right away
    try { localStorage.removeItem(classroomKey(id)); } catch (e) { }
    try { setTombstone(id); } catch (e) { }
  } catch (e) { }
  // Attempt remote delete asynchronously (best-effort). If it succeeds, clear the tombstone.
  (async () => {
    try {
      const sup = window._lf_supabase; if (!sup) return;
      const sess = await sup.auth.getSession();
      const userId = sess && sess.data && (sess.data.session?.user?.id || sess.data.user?.id) ? (sess.data.session?.user?.id || sess.data.user?.id) : null;
      if (!userId) return;
      const res = await sup.from('classrooms').delete().eq('id', id);
      if (!res || res.error) { console.warn('remote delete failed', res && res.error ? res.error : 'unknown'); return; }
      // remote delete succeeded: clear tombstone
      try { clearTombstone(id); } catch (e) { }
    } catch (e) { console.warn('remote delete failed', e); }
  })();
}

// photo store helpers (compatible with main app)
const PHOTO_STORE_KEY = 'fairy_photos';
function loadPhotoStore() { try { return JSON.parse(localStorage.getItem(PHOTO_STORE_KEY) || '{}') } catch (e) { return {} } }
function savePhotoStore(s) { try { localStorage.setItem(PHOTO_STORE_KEY, JSON.stringify(s)) } catch (e) { } }

function storePhotoData(dataURL) {
  // synchronous store: keep local copy and return id immediately
  const s = loadPhotoStore(); const id = 'p-' + Math.random().toString(36).slice(2); s[id] = dataURL; savePhotoStore(s);
  // attempt async upload to Supabase Storage (best-effort). If successful, replace local data with public URL.
  (async () => {
    try {
      const sup = window._lf_supabase;
      if (!sup) return; // no supabase client available
      // Convert dataURL to blob
      const blob = dataURLToBlob(dataURL);
      if (!blob) return;
      // get user id for namespacing
      const sess = await sup.auth.getSession();
      const userId = sess && sess.data && (sess.data.session?.user?.id || sess.data.user?.id) ? (sess.data.session?.user?.id || sess.data.user?.id) : null;
      const bucket = 'teacher-assets';
      const path = (userId ? userId + '/' : '') + id + '.png';
      // upload (requires the bucket to exist and proper RLS/policies)
      const up = await sup.storage.from(bucket).upload(path, blob, { upsert: true });
      if (up.error) { console.warn('photo upload error', up.error); return; }
      // get public URL and replace local store. Support both v1 and v2 return shapes.
      try {
        const urlRes = await sup.storage.from(bucket).getPublicUrl(path);
        let publicUrl = null;
        if (urlRes && urlRes.data && urlRes.data.publicUrl) publicUrl = urlRes.data.publicUrl;
        else if (urlRes && urlRes.publicUrl) publicUrl = urlRes.publicUrl;
        if (publicUrl) {
          const s2 = loadPhotoStore(); s2[id] = publicUrl; savePhotoStore(s2);
          // Persist public URL into any classrooms that reference this photo id (ref:ID)
          try {
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i); if (!k) continue; if (k.indexOf(CLASSROOM_PREFIX) !== 0) continue;
              try {
                const cid = k.slice(CLASSROOM_PREFIX.length);
                const snap = JSON.parse(localStorage.getItem(k) || 'null'); if (!snap) continue;
                let dirty = false;
                if (Array.isArray(snap.students)) {
                  snap.students.forEach(st => { if (st && typeof st.photo === 'string' && st.photo === ('ref:' + id)) { st.photo = publicUrl; dirty = true; } });
                }
                if (dirty) {
                  // update local cache and sync to DB
                  try { try { if (window && window._lf_current_user_id) snap.__owner = window._lf_current_user_id; } catch (e) { } localStorage.setItem(classroomKey(cid), JSON.stringify(snap)); } catch (e) { }
                  try { await saveClassroom(cid, snap); } catch (e) { console.warn('saveClassroom after photo upload failed', e); }
                }
              } catch (e) { }
            }
          } catch (e) { console.warn('persisting photo URL into classrooms failed', e); }
        }
      } catch (e) { console.warn('getPublicUrl failed', e); }
    } catch (e) { console.warn('async photo upload failed', e); }
  })();
  return id;
}

function getPhotoDataById(id) { const s = loadPhotoStore(); return s[id] || null }

function dataURLToBlob(dataurl) {
  try {
    const arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]); let n = bstr.length; const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  } catch (e) { return null; }
}

// Safe focus helper usable across the app. Delays focus slightly to avoid triggering
// some extension content-script race conditions while still focusing promptly.
function safeFocusEl(el) {
  try {
    if (!el) return;
    requestAnimationFrame(() => { try { setTimeout(() => { try { el.focus(); } catch (e) { } }, 40); } catch (e) { } });
  } catch (e) { }
}

// Sanitize inputs to opt-out of some third-party content scripts (Grammarly, etc.).
function sanitizeControl(el) {
  try {
    if (!el) return;
    if (el._td_sanitized) return; el._td_sanitized = true;
    const tag = (el.tagName || '').toLowerCase();
    const isField = tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
    if (isField) {
      try { el.setAttribute('data-gramm', 'false'); } catch (e) { }
      try { el.setAttribute('data-gramm_editor', 'false'); } catch (e) { }
      try { el.setAttribute('data-enable-grammarly', 'false'); } catch (e) { }
      try { el.setAttribute('spellcheck', 'false'); } catch (e) { }
      try { el.setAttribute('autocomplete', 'off'); } catch (e) { }
      try { el.setAttribute('autocorrect', 'off'); } catch (e) { }
      try { el.setAttribute('autocapitalize', 'off'); } catch (e) { }
    }
  } catch (e) { }
}

try {
  // sanitize existing controls on load
  Array.from(document.querySelectorAll('input,textarea,select,[contenteditable]')).forEach(sanitizeControl);
  // observe future additions and sanitize them
  const mo = new MutationObserver((mutations) => {
    try {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach(node => {
            try {
              if (!node) return;
              if (node.nodeType === 1) { // Element
                sanitizeControl(node);
                Array.from(node.querySelectorAll ? node.querySelectorAll('input,textarea,select,[contenteditable]') : []).forEach(sanitizeControl);
              }
            } catch (e) { }
          });
        }
      }
    } catch (e) { }
  });
  mo.observe(document.documentElement || document.body, { childList: true, subtree: true });
} catch (e) { }

// --- fairy-door helpers copied from main app for consistent visuals ---
function chibiDoorSVGDirect(color) {
  return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300' style='width:100%;height:100%;'><rect x='8' y='8' rx='24' ry='24' width='184' height='284' fill='${color}' stroke='none' stroke-width='0'/><rect x='8' y='8' rx='24' ry='24' width='184' height='284' fill='none' stroke='#000000' stroke-width='1' opacity='0.12'/><rect x='56' y='36' width='88' height='72' rx='10' fill='#e8f4ff' stroke='none'/><circle cx='72' cy='56' r='3' fill='#ffffff' opacity='0.6'/><circle cx='128' cy='56' r='3' fill='#ffffff' opacity='0.6'/><circle cx='150' cy='150' r='14' fill='#ffd27a' stroke='#ffb800' stroke-width='2'/><circle cx='147' cy='147' r='4' fill='#ffffff' opacity='0.8'/></svg>`;
}

function getVibrantColor() { const hues = [0, 30, 45, 60, 120, 180, 240, 270, 300, 330]; const hue = hues[Math.floor(Math.random() * hues.length)]; return `hsl(${hue},100%,50%)`; }

// small mailbox pop animation (simple, self-contained)
const _teacherChars = ['🦄', '✨', '🌟', '🎉', '🏅', '⭐', '🎁', '🎈'];
function getRandomChar() { return _teacherChars[Math.floor(Math.random() * _teacherChars.length)]; }
function showMailboxCard(el, points) {
  try {
    const pop = document.createElement('div');
    pop.className = 'mailbox-pop ' + (points > 0 ? 'positive' : 'negative');
    const emoji = document.createElement('div'); emoji.className = 'mailbox-pop-emoji';
    // allow caller to pass a specific emoji by setting dataset.emoji on the element
    // or by providing a third parameter (back-compat). If none provided, fall back to random.
    let chosen = null;
    try { chosen = (el && el.dataset && el.dataset.emoji) ? el.dataset.emoji : null; } catch (e) { chosen = null; }
    if (!chosen && arguments.length >= 3) try { chosen = arguments[2]; } catch (e) { chosen = null; }
    emoji.textContent = chosen || getRandomChar();
    const txt = document.createElement('div'); txt.className = 'mailbox-pop-txt'; txt.textContent = (points > 0 ? '+' : '') + points + ' pts';
    pop.appendChild(emoji); pop.appendChild(txt);
    // ensure the mailbox can host an absolutely positioned popup
    try { if (getComputedStyle(el).position === 'static') el.style.position = 'relative'; } catch (e) { }
    el.appendChild(pop);
    // force reflow then animate in via class toggle
    void pop.offsetWidth;
    pop.classList.add('show');
    // remove after visible time (fade out then remove)
    setTimeout(() => {
      try { pop.classList.remove('show'); setTimeout(() => { try { pop.remove(); } catch (e) { } }, 260); } catch (e) { }
    }, 1600);
  } catch (e) { console.warn(e); }
}
// Initialize sound effects properly with user interaction requirement
function initSoundEffects() {
  try {
    // Create audio elements with base64 data
    const positiveSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTMyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgAAAABTAACqgAAqoAACqgAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAA//sQZARXQADWABQ0IABhWAAENYAAQwZAAIaQAAhgwAAQ0gABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0gABDSAAENIAAQ0gABDWAAENYAAQ1gABDWAAENYAAQ1gABDWAAENYAAQzgA//sQZBlnQADWABQ0IABhWAAENYAAQwZAAIaQAAhgwAAQ0gABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0gABDSAAENIAAQ0gABDWAAENYAAQ1gABDWAAENYAAQ1gABDWAAENYAAQzgA');
    const negativeSound = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQxAADB8AhSmxhIIEVCSiJrDCQBTMyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMgAAAABTAACqgAAqoAACqgAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAAKqAA//sQZARXQADWABQ0IABhWAAENYAAQwZAAIaQAAhgwAAQ0gABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0gABDSAAENIAAQ0gABDWAAENYAAQ1gABDWAAENYAAQ1gABDWAAENYAAQzgA//tQZHdnQADWABQ0IABhWAAENYAAQwZAAIaQAAhgwAAQ0gABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENMAAQ0wABDTAAENIAAQ0gABDSAAENIAAQ1gABDWAAENYAAQ1gABDWAAENYAAQ1gABDOAA/');

    // Preload sounds
    positiveSound.load();
    negativeSound.load();

    // Store sounds on window
    window.rewardSounds = {
      positive: positiveSound,
      negative: negativeSound
    };

    console.log('Sound effects initialized successfully');
  } catch (e) {
    console.warn('Sound initialization failed:', e);
  }
}

// Play sound with user interaction requirement handling
function playRewardSound(isPositive, volume = 0.2, element = null) {
  try {
    if (!window.rewardSounds) {
      console.warn('Sounds not initialized yet');
      return;
    }

    const sound = isPositive ? window.rewardSounds.positive : window.rewardSounds.negative;
    sound.volume = volume;
    sound.currentTime = 0;
    
    // Try to play sound
    sound.play().catch(e => {
      console.log('Sound play prevented:', e);
      // Try to resume audio context if suspended
      if (window._fd_audio_ctx && window._fd_audio_ctx.state === 'suspended') {
        window._fd_audio_ctx.resume().catch(() => {});
      }
      
      // Show visual feedback as fallback
      if (element) {
        showVisualFeedback(isPositive, element);
      }
    });

    // Add visual feedback even if sound plays
    if (element) {
      showVisualFeedback(isPositive, element);
    }
  } catch (e) {
    console.log('Sound playback failed:', e);
    // Always show visual feedback as fallback
    if (element) {
      showVisualFeedback(isPositive, element);
    }
  }
}

// Visual feedback function (works even if sound fails)
function showVisualFeedback(isPositive, element) {
  if (!element) return;
  
  element.classList.add('clicked');
  setTimeout(() => {
    element.classList.remove('clicked');
  }, 300);
}

// Initialize sounds AND set up first user interaction handler
document.addEventListener('DOMContentLoaded', () => {
  // Initialize sounds
  initSoundEffects();
  
  // Set up audio context resume on first user interaction
  document.body.addEventListener('click', function initAudio() {
    try {
      // Allow audio creation
      window.__fd_allow_create_audio = true;
      
      // Resume any suspended audio context
      if (window._fd_audio_ctx && window._fd_audio_ctx.state === 'suspended') {
        window._fd_audio_ctx.resume().catch(() => {});
      }
      
      // Try to play a silent sound to unlock audio
      const silentSound = new Audio();
      silentSound.volume = 0;
      silentSound.play().catch(() => {});
      
      console.log('Audio unlocked by user interaction');
    } catch (e) {
      console.warn('Audio unlock failed:', e);
    }
    // Remove this handler after first interaction
    document.body.removeEventListener('click', initAudio);
  }, { once: true });
});

// // --- sound effects (robust single AudioContext, explicit scheduling) ---
// function getSharedAudioContext() {
//   try {
//     if (window._fd_audio_ctx) return window._fd_audio_ctx;
//     // only create a new AudioContext after we saw a user gesture that allowed audio
//     if (!window.__fd_allow_create_audio) return null;
//     const Ctor = window.AudioContext || window.webkitAudioContext;
//     if (!Ctor) return null;
//     // delay construction until a user gesture resumes it; create lazily
//     window._fd_audio_ctx = new Ctor();
//     // create master gain (louder default for more presence)
//     try { const g = window._fd_audio_ctx.createGain(); g.gain.value = 0.9; g.connect(window._fd_audio_ctx.destination); window._fd_audio_ctx._fd_master_gain = g; } catch (e) { }
//     // prebuild a short noise buffer for percussion/chuckle effects
//     try {
//       const buf = window._fd_audio_ctx.createBuffer(1, Math.floor(window._fd_audio_ctx.sampleRate * 1.0), window._fd_audio_ctx.sampleRate);
//       const data = buf.getChannelData(0);
//       for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - (i / data.length), 1.5);
//       window._fd_audio_ctx._fd_noise_buf = buf;
//     } catch (e) { }
//     return window._fd_audio_ctx;
//   } catch (e) { console.warn('create audio ctx failed', e); return null; }
// }

// function playSoundEffect(points) {
//   try {
//     const ctx = getSharedAudioContext(); if (!ctx) return;
//     if (ctx.state === 'suspended' && typeof ctx.resume === 'function') {
//       ctx.resume().catch(() => { });
//     }
//     const master = ctx._fd_master_gain || (function () { const g = ctx.createGain(); g.gain.value = 0.9; g.connect(ctx.destination); ctx._fd_master_gain = g; return g; })();
//     const now = ctx.currentTime;

//     if (points > 0) {
//       // Positive: layered pop + melodic arpeggio + chuckle pulses
//       // 1) percussive pop (shaped noise)
//       try {
//         const src = ctx.createBufferSource(); src.buffer = ctx._fd_noise_buf;
//         const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200;
//         const pg = ctx.createGain(); pg.gain.setValueAtTime(0.0001, now);
//         pg.gain.linearRampToValueAtTime(0.6, now + 0.001);
//         pg.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
//         src.connect(bp); bp.connect(pg); pg.connect(master);
//         src.start(now); src.stop(now + 0.18);
//       } catch (e) { }

//       // 2) melodic arpeggio (sawtooth with subtle vibrato and delay)
//       const baseFreq = 520 + Math.min(6, Math.floor(points)) * 20;
//       const steps = Math.min(4, Math.max(1, Math.floor(points)));
//       for (let i = 0; i < steps; i++) {
//         const f = baseFreq * Math.pow(1.12246, i * 1.2);
//         const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f, now + i * 0.08);
//         // vibrato LFO
//         try {
//           const lfo = ctx.createOscillator(); lfo.frequency.value = 5 + i * 1.5;
//           const lfoGain = ctx.createGain(); lfoGain.gain.value = f * 0.0025;
//           lfo.connect(lfoGain); lfoGain.connect(o.frequency);
//           lfo.start(now + i * 0.08); lfo.stop(now + i * 0.08 + 0.95);
//         } catch (e) { }
//         const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now + i * 0.08);
//         g.gain.linearRampToValueAtTime(0.28, now + i * 0.08 + 0.06);
//         g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.95);
//         const d = ctx.createDelay(0.6); d.delayTime.value = 0.12 + i * 0.03;
//         const fb = ctx.createGain(); fb.gain.value = 0.22;
//         d.connect(fb); fb.connect(d);
//         o.connect(g); g.connect(d); d.connect(master);
//         o.start(now + i * 0.08); o.stop(now + i * 0.08 + 0.95);
//       }

//       // 3) chuckle-like gated noise pulses for extra personality
//       if (points >= 2) {
//         for (let j = 0; j < Math.min(3, points); j++) {
//           const t0 = now + 0.18 + j * 0.12;
//           try {
//             const src2 = ctx.createBufferSource(); src2.buffer = ctx._fd_noise_buf;
//             const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t0);
//             g2.gain.linearRampToValueAtTime(0.22, t0 + 0.01);
//             g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.18 + (j * 0.02));
//             const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1200 - j * 100;
//             src2.connect(lp); lp.connect(g2); g2.connect(master);
//             src2.start(t0); src2.stop(t0 + 0.22);
//           } catch (e) { }
//         }
//       }

//     } else {
//       // Negative: descending comical wobble + low thud
//       try {
//         const o = ctx.createOscillator(); o.type = 'square'; o.frequency.setValueAtTime(220, now);
//         const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now);
//         g.gain.linearRampToValueAtTime(0.36, now + 0.02);
//         g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
//         const pan = (typeof ctx.createStereoPanner === 'function') ? ctx.createStereoPanner() : null;
//         if (pan) pan.pan.value = -0.4;
//         if (pan) o.connect(pan), pan.connect(master); else o.connect(master);
//         o.start(now); o.frequency.exponentialRampToValueAtTime(90, now + 0.6);
//         o.stop(now + 0.7);
//       } catch (e) { }

//       try {
//         const t0 = now + 0.36;
//         const srcn = ctx.createBufferSource(); srcn.buffer = ctx._fd_noise_buf;
//         const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t0);
//         g2.gain.linearRampToValueAtTime(0.5, t0 + 0.02);
//         g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28);
//         const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 300;
//         srcn.connect(lp2); lp2.connect(g2); g2.connect(master);
//         srcn.start(t0); srcn.stop(t0 + 0.36);
//       } catch (e) { }
//     }
//   } catch (e) { console.warn('sound failed', e); }
// }

// // A slightly longer, comical 'bummer' sound for negative awards
// function playBummerSound(magnitude) {
//   try {
//     const ctx = getSharedAudioContext(); if (!ctx) return;
//     if (ctx.state === 'suspended' && typeof ctx.resume === 'function') { ctx.resume().catch(() => { }); }
//     const master = ctx._fd_master_gain || (function () { const g = ctx.createGain(); g.gain.value = 0.9; g.connect(ctx.destination); ctx._fd_master_gain = g; return g; })();
//     const now = ctx.currentTime;
//     // descending wobble with more playful overtones
//     try {
//       const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(320, now);
//       const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now);
//       g.gain.linearRampToValueAtTime(0.28, now + 0.02);
//       g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
//       const pan = (typeof ctx.createStereoPanner === 'function') ? ctx.createStereoPanner() : null;
//       if (pan) pan.pan.value = -0.25 + (Math.random() * 0.5);
//       if (pan) o.connect(pan), pan.connect(master); else o.connect(master);
//       o.start(now); o.frequency.exponentialRampToValueAtTime(80, now + 0.9);
//       o.stop(now + 1.05);
//     } catch (e) { }
//     // a soft, long low thud for emphasis
//     try {
//       const t0 = now + 0.6;
//       const srcn = ctx.createBufferSource(); srcn.buffer = ctx._fd_noise_buf;
//       const g2 = ctx.createGain(); g2.gain.setValueAtTime(0.0001, t0);
//       g2.gain.linearRampToValueAtTime(0.6, t0 + 0.02);
//       g2.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.6);
//       const lp2 = ctx.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 240;
//       srcn.connect(lp2); lp2.connect(g2); g2.connect(master);
//       srcn.start(t0); srcn.stop(t0 + 0.6);
//     } catch (e) { }
//   } catch (e) { console.warn('playBummerSound failed', e); }
// }

// UI refs
const sidebar = document.getElementById('sidebar');
const classListEl = document.getElementById('classList');
const collapseBtn = document.getElementById('collapseBtn');
const welcome = document.getElementById('welcome');
const classArea = document.getElementById('classArea');
// class title element removed; use `currentMeta` for class name and `classCounts` for counts
const classCounts = document.getElementById('classCounts');
// The main content area for student cards is now the `childList` element
const classContent = document.getElementById('childList');
const classTitleMeta = document.getElementById('currentMeta');

// Animate the whole child list on point changes: positive => celebration, negative => bummer
function animateClassList(points, studentId) {
  try {
    const el = classContent || document.getElementById('childList');
    if (!el) return;
    const addCls = (points > 0) ? 'lf-celebrate' : 'lf-bummer';
    // ensure toggle restarts animation
    el.classList.remove('lf-celebrate'); el.classList.remove('lf-bummer');
    // trigger reflow then add
    void el.offsetWidth;
    el.classList.add(addCls);
    // play matching sound via existing audio helper for positive, custom bummer for negative
    try {
      if ((points || 0) > 0) playSoundEffect(points);
      else playBummerSound(Math.abs(points || 1));
    } catch (e) { }
    // small sparkle on the student's card for positive points
    try { if ((points || 0) > 0) sparkleAtCard(studentId); } catch (e) { }
    // for positives or negatives, fire confetti/visuals with the student's avatar
    try { if (typeof fireConfettiWithAvatar === 'function') fireConfettiWithAvatar(studentId, points); } catch (e) { }
    // remove class after animation duration
    setTimeout(() => { try { el.classList.remove(addCls); } catch (e) { } }, 1400);
  } catch (e) { console.warn('animateClassList failed', e); }
}

// create a full-screen canvas overlay and animate confetti + avatar sprites
function fireConfettiWithAvatar(studentId, points) {
  try {
    const isNegative = (typeof points !== 'undefined') ? (points <= 0) : false;
    const student = (function () { try { const snap = loadClassroom(window._lf_current_class_id || (window.location && window.location.hash && window.location.hash.slice(1))); return (snap && snap.students) ? snap.students.find(s => s.id === studentId) : null; } catch (e) { return null; } })();
    // find avatar image or generate chibi SVG as data URL
    let avatarSrc = null;
    try {
      if (student && student.photo && typeof student.photo === 'string' && student.photo.indexOf('ref:') === 0) avatarSrc = getPhotoDataById(student.photo.slice(4)) || null;
      else if (student && student.photo) avatarSrc = student.photo;
    } catch (e) { avatarSrc = null; }
    if (!avatarSrc) {
      try { const svg = chibiDoorSVGDirect(student && student.doorTheme ? student.doorTheme : '#ffd1f0'); avatarSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); } catch (e) { avatarSrc = null; }
    }

    // create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.className = 'lf-confetti-canvas';
    canvas.style.position = 'fixed'; canvas.style.left = '0'; canvas.style.top = '0'; canvas.style.width = '100%'; canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none'; canvas.style.zIndex = 20000;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    // spawn particles (different palette and gravity for negative mood)
    const confettiCount = isNegative ? 16 : 56;
    const confetti = [];
    const palette = isNegative ? ['#9aa0a6', '#cfcfcf', '#bdbdbd', '#e6e6e6'] : ['#ff6ea6', '#ffd56a', '#b9f6c8', '#7dd7ff', '#8b6bff', '#ffd1a8'];
    for (let i = 0; i < confettiCount; i++) {
      confetti.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height * (isNegative ? 0.35 : 0.65),
        vx: (Math.random() - 0.5) * (isNegative ? 1.2 : 3.6),
        vy: (isNegative ? 0.6 : 2.2) + Math.random() * (isNegative ? 1.0 : 4.6),
        size: (isNegative ? 6 : 6) + Math.random() * (isNegative ? 10 : 10),
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * (isNegative ? 0.08 : 0.2),
        color: palette[Math.floor(Math.random() * palette.length)]
      });
    }

    // avatar sprites: load image and spawn a few from the student's card position
    const avatars = [];
    const card = document.querySelector('.child-card[data-student-id="' + studentId + '"]');
    let startX = canvas.width / 2, startY = canvas.height / 2;
    if (card) { const r = card.getBoundingClientRect(); startX = r.left + r.width / 2; startY = r.top + r.height / 2; }
    const img = new Image();
    if (avatarSrc) img.src = avatarSrc;
    img.onload = () => {
      const avatarCount = isNegative ? 3 : 7;
      for (let i = 0; i < avatarCount; i++) {
        avatars.push({ x: startX, y: startY, vx: (Math.random() - 0.5) * (isNegative ? 2 : 6), vy: (isNegative ? -3 - Math.random() * 2 : -6 - Math.random() * 6), scale: (isNegative ? 0.36 : 0.46) + Math.random() * 0.62, rot: Math.random() * Math.PI * 2, drot: (Math.random() - 0.5) * (isNegative ? 0.04 : 0.12), t: 0 });
      }
    };
    img.onerror = () => { /* ignore */ };

    let t0 = performance.now();
    let rafId = null;
    function frame(now) {
      const dt = Math.min(40, now - t0) / 1000; t0 = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // update and draw confetti
      for (let p of confetti) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += (isNegative ? 0.045 : 0.12);
        p.angle += p.spin;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      // draw avatars
      for (let a of avatars) {
        a.x += a.vx; a.y += a.vy; a.vy += (isNegative ? 0.08 : 0.2); a.rot += a.drot; a.t += dt;
        const w = 64 * a.scale, h = 84 * a.scale;
        ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(a.rot);
        try { if (img && img.complete) ctx.drawImage(img, -w / 2, -h / 2, w, h); } catch (e) { }
        ctx.restore();
      }
      // simple lifetime: stop after ~1.6s (longer for negative to let the bummer sound play)
      const duration = isNegative ? 2400 : 1800;
      if (now - startTime > duration) {
        cancelAnimationFrame(rafId);
        try { canvas.remove(); window.removeEventListener('resize', resize); } catch (e) { }
        return;
      }
      rafId = requestAnimationFrame(frame);
    }
    const startTime = performance.now();
    rafId = requestAnimationFrame(frame);
  } catch (e) { console.warn('fireConfettiWithAvatar failed', e); }
}

// sparkle effect: small particle burst at the student's card
function sparkleAtCard(studentId) {
  try {
    const card = document.querySelector('.child-card[data-student-id="' + studentId + '"]');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const root = document.body;
    const container = document.createElement('div');
    container.className = 'lf-sparkle-wrap';
    container.style.position = 'fixed';
    container.style.left = (rect.left + rect.width / 2) + 'px';
    container.style.top = (rect.top + rect.height / 2) + 'px';
    container.style.pointerEvents = 'none';
    container.style.zIndex = 21000;
    root.appendChild(container);
    const count = 12;
    const els = [];
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'lf-sparkle';
      const angle = Math.random() * Math.PI * 2;
      const r = 12 + Math.random() * 28;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      const size = 6 + Math.random() * 8;
      s.style.position = 'absolute';
      s.style.left = '0px'; s.style.top = '0px';
      s.style.width = size + 'px'; s.style.height = size + 'px';
      s.style.borderRadius = '50%';
      s.style.background = (Math.random() > 0.5) ? '#fff59d' : '#ffd180';
      s.style.boxShadow = '0 8px 18px rgba(0,0,0,0.08)';
      s.style.transform = 'translate(-50%,-50%) scale(0.18)';
      s.style.opacity = '0.0';
      s.style.transition = 'transform 520ms cubic-bezier(.2,.9,.3,1), opacity 520ms ease';
      container.appendChild(s); els.push({ el: s, x, y });
      // kick off in next tick
      (function (s, x, y) { requestAnimationFrame(() => { s.style.transform = 'translate(' + x + 'px,' + y + 'px) scale(1)'; s.style.opacity = '1'; }); })(s, x, y);
    }
    setTimeout(() => {
      // fade out
      els.forEach(o => { try { o.el.style.transform = 'translate(' + (o.x * 1.05) + 'px,' + (o.y * 1.05) + 'px) scale(0.18)'; o.el.style.opacity = '0'; } catch (e) { } });
      setTimeout(() => { try { container.remove(); } catch (e) { } }, 520);
    }, 680);
  } catch (e) { console.warn('sparkleAtCard failed', e); }
}

// Archive / Delete buttons (class-level)
const archiveBtn = document.getElementById('archiveClassBtn');
const deleteBtn = document.getElementById('deleteClassBtn');

function archiveClassroomToggle(id) {
  try {
    const snap = loadClassroom(id); if (!snap) return;
    snap.__archived = !snap.__archived;
    saveClassroom(id, snap);
    renderSidebar();
    if (selectedClassId === id) {
      const detailsEl = classArea.querySelector('.details'); if (detailsEl) detailsEl.style.opacity = snap.__archived ? '0.6' : '1';
      classCounts.textContent = `${(snap.students || []).length} students · ${(snap.tasks || []).length} tasks` + (snap.__archived ? ' · Archived' : '');
      // update menu button label if present
      try { const archBtn = document.getElementById('archiveClassBtn'); if (archBtn) archBtn.textContent = snap.__archived ? 'Unarchive' : 'Archive'; } catch (e) { }
    }
  } catch (e) { console.warn(e); }
}

function removeClassroomById(id) {
  try {
    deleteClassroom(id);
    if (selectedClassId === id) {
      selectedClassId = null; classArea.style.display = 'none'; welcome.style.display = 'block';
      try {
        // Ensure legacy topbar is hidden and keep buttons in the sidebar
        try { const topbar = document.getElementById('topbarActions'); if (topbar) topbar.style.display = 'none'; } catch (e) { }
      } catch (e) { }
    }
    renderSidebar();
  } catch (e) { console.warn(e); }
}

if (archiveBtn) { archiveBtn.addEventListener('click', () => { if (!selectedClassId) { showToast('Select a class first', { type: 'warning' }); return; } archiveClassroomToggle(selectedClassId); }); }
if (deleteBtn) { deleteBtn.addEventListener('click', () => { if (!selectedClassId) { showToast('Select a class first', { type: 'warning' }); return; } openConfirm('Delete this class? This will remove all students and cannot be undone.').then(ok => { if (ok) removeClassroomById(selectedClassId); }); }); }

// removed legacy Manage Students button — functionality available via Add / Edit students modal

// Account menu behavior (avatar + caret) — toggles dropdown and opens account modal
try {
  const accountBtn = document.getElementById('accountBtn');
  const accountDropdown = document.getElementById('accountDropdown');
  const openAccountBtn = document.getElementById('openAccountBtn');
  const acctName = document.getElementById('acctName');
  const acctEmail = document.getElementById('acctEmail');
  const accountAvatar = document.getElementById('accountAvatar');
  if (accountBtn && accountDropdown) {
    accountBtn.addEventListener('click', (ev) => {
      ev.stopPropagation(); const open = accountBtn.getAttribute('aria-expanded') === 'true';
      const mobileFloat = document.getElementById('mobileFloatMenu');
      const ensureStyle = () => {
        if (!document.getElementById('mobile-float-shift-style')) {
          const s = document.createElement('style'); s.id = 'mobile-float-shift-style';
          s.appendChild(document.createTextNode('#mobileFloatMenu.mobile-float-shifted{transform:translateY(200px);transition:transform .18s ease; will-change:transform;}'));
          document.head.appendChild(s);
        }
      };

      if (!open) {
        openExclusivePanel('account', accountBtn, () => { try { accountBtn.setAttribute('aria-expanded', 'true'); accountDropdown.style.display = 'block'; } catch (e) { } });
        // shift mobile float menu down while account dropdown is open
        try {
          if (mobileFloat) { ensureStyle(); mobileFloat.classList.add('mobile-float-shifted'); }
        } catch (e) { }
      } else {
        accountBtn.setAttribute('aria-expanded', 'false'); accountDropdown.style.display = 'none'; try { document.dispatchEvent(new Event('modal:maybeClosed')); } catch (e) { }
        // remove shift class when closed
        try { if (mobileFloat) mobileFloat.classList.remove('mobile-float-shifted'); } catch (e) { }
      }
    });
    // Global click handler manages outside clicks; per-element document click handlers removed to avoid conflicts
  }
  if (openAccountBtn) { openAccountBtn.addEventListener('click', (ev) => { ev.stopPropagation(); if (accountDropdown) accountDropdown.style.display = 'none'; if (accountBtn) accountBtn.setAttribute('aria-expanded', 'false'); openAccountModal(); }); }
  // populate basic profile info if session available
  (async () => {
    try {
      const sup = window._lf_supabase;
      if (!sup) return;
      const s = await sup.auth.getSession();
      const user = s && s.data && (s.data.session?.user || s.data.user) ? (s.data.session?.user || s.data.user) : null;
      if (user) {
        try {
          acctName.textContent = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : (user.email || '');
          acctEmail.textContent = user.email || '';
          // Avatar logic: prefer uploaded image, then emoji avatar, then fallback
          let avatarUrl = '';
          if (user.user_metadata && user.user_metadata.avatar) {
            avatarUrl = user.user_metadata.avatar;
          } else if (user.user_metadata && user.user_metadata.emoji_avatar) {
            // Render emoji as SVG data URL (same as account page)
            const emoji = user.user_metadata.emoji_avatar;
            avatarUrl = `data:image/svg+xml;utf8,<svg width='88' height='88' viewBox='0 0 88 88' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='44' cy='44' r='44' fill='%23e0e6f0'/><text x='50%' y='54%' text-anchor='middle' fill='%23888' font-size='44' font-family='Arial' dy='.3em'>${emoji}</text></svg>`;
          }
          accountAvatar.src = avatarUrl || '';
          // Also update dropdown avatar if present
          const accountAvatarDropdown = document.getElementById('accountAvatarDropdown');
          if (accountAvatarDropdown) accountAvatarDropdown.src = avatarUrl || '';
        } catch (e) { }
      }
    } catch (e) { }
  })();
  // Refresh avatar when returning from account page
  window.addEventListener('focus', () => {
    (async () => {
      try {
        const sup = window._lf_supabase;
        if (!sup) return;
        const s = await sup.auth.getSession();
        const user = s && s.data && (s.data.session?.user || s.data.user) ? (s.data.session?.user || s.data.user) : null;
        if (user) {
          let avatarUrl = '';
          if (user.user_metadata && user.user_metadata.avatar) {
            avatarUrl = user.user_metadata.avatar;
          } else if (user.user_metadata && user.user_metadata.emoji_avatar) {
            const emoji = user.user_metadata.emoji_avatar;
            avatarUrl = `data:image/svg+xml;utf8,<svg width='88' height='88' viewBox='0 0 88 88' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='44' cy='44' r='44' fill='%23e0e6f0'/><text x='50%' y='54%' text-anchor='middle' fill='%23888' font-size='44' font-family='Arial' dy='.3em'>${emoji}</text></svg>`;
          }
          const accountAvatar = document.getElementById('accountAvatar');
          if (accountAvatar) accountAvatar.src = avatarUrl || '';
          const accountAvatarDropdown = document.getElementById('accountAvatarDropdown');
          if (accountAvatarDropdown) accountAvatarDropdown.src = avatarUrl || '';
        }
      } catch (e) { }
    })();
  });
} catch (e) { }

// options menu toggle behavior and outside click handling
const optionsToggleBtn = document.getElementById('optionsToggleBtn');
const optionsMenu = document.getElementById('optionsMenu');
if (optionsToggleBtn && optionsMenu) {
  optionsToggleBtn.addEventListener('click', (ev) => {
    const open = optionsToggleBtn.getAttribute('aria-expanded') === 'true';
    if (!open) {
      openExclusivePanel('options', optionsToggleBtn, () => { try { optionsToggleBtn.setAttribute('aria-expanded', 'true'); optionsMenu.style.display = 'block'; setTimeout(() => { try { safeFocusEl(optionsMenu.querySelector('button')); } catch (e) { } }, 30); } catch (e) { } });
    } else {
      optionsToggleBtn.setAttribute('aria-expanded', 'false'); optionsMenu.style.display = 'none'; try { document.dispatchEvent(new Event('modal:maybeClosed')); } catch (e) { }
    }
  });
  // Global click handler manages outside clicks; per-element document click handlers removed to avoid conflicts
}

let selectedClassId = null;

// Set conservative input attributes to reduce interference from extensions
// Note: the create-class input is created inside the modal so we set attributes there when needed.

// Ensure audio is allowed by browsers: mark that creating an AudioContext is allowed after a user gesture
try {
  document.addEventListener('pointerdown', function initAudioOnFirstGesture() {
    try {
      // allow future creation of AudioContext and resume any existing one
      window.__fd_allow_create_audio = true;
      const c = window._fd_audio_ctx || null;
      if (c && c.state === 'suspended' && typeof c.resume === 'function') c.resume().catch(() => { });
    } catch (e) { }
  }, { once: true, passive: true });
} catch (e) { }

function renderSidebar() {
  classListEl.innerHTML = '';
  const classes = listClassrooms();
  const active = [];
  const archived = [];
  // split by archived flag
  classes.forEach(c => {
    try {
      const snap = loadClassroom(c.id);
      if (snap && snap.__archived) archived.push(c); else active.push(c);
    } catch (e) { active.push(c); }
  });

  // helper to render class icon (if saved)
  function getClassIconHtml(id) { try { const snap = loadClassroom(id); if (snap && snap.__classIcon) { return `<div class='class-icon'><img src="${snap.__classIcon}" style="width:36px;height:36px;border-radius:8px;object-fit:cover"/></div>`; } } catch (e) { } return `<div class='class-icon'>🏫</div>`; }

  // Active classes
  if (active.length === 0) { const hint = document.createElement('div'); hint.style.color = '#9aa7b8'; hint.textContent = 'No classes yet - add one below.'; classListEl.appendChild(hint); }
  active.forEach(c => {
    const row = document.createElement('div'); row.className = 'class-item'; row.dataset.id = c.id;
    row.innerHTML = `${getClassIconHtml(c.id)}<div style='flex:1'><div class='class-name'>${c.name}</div><div class='class-meta'>${c.students} students · ${c.tasks} tasks</div></div>`;
    row.title = c.name; row.addEventListener('click', () => openClass(c.id)); if (c.id === selectedClassId) row.classList.add('active'); classListEl.appendChild(row);
  });

  // Archived section (collapsible)
  if (archived.length > 0) {
    const sep = document.createElement('div'); sep.style.marginTop = '10px'; sep.style.borderTop = '1px dashed #eef2f8'; sep.style.paddingTop = '10px';
    const header = document.createElement('div'); header.style.display = 'flex'; header.style.justifyContent = 'space-between'; header.style.alignItems = 'center'; header.style.gap = '8px';
    const title = document.createElement('div'); title.textContent = 'Archived'; title.style.fontWeight = '800'; title.style.color = '#b33';
    const toggle = document.createElement('button'); toggle.textContent = 'Show'; toggle.className = 'toggle-btn'; toggle.dataset.open = 'false';
    const archList = document.createElement('div'); archList.style.display = 'none'; archList.style.marginTop = '8px'; archived.forEach(c => {
      const row = document.createElement('div'); row.className = 'class-item'; row.dataset.id = c.id;
      row.innerHTML = `${getClassIconHtml(c.id)}<div style='flex:1'><div class='class-name'>${c.name}</div><div class='class-meta'>${c.students} students · ${c.tasks} tasks</div></div>`;
      row.title = c.name; row.addEventListener('click', () => openClass(c.id));
      // add restore button to unarchive in-place
      const restore = document.createElement('button'); restore.className = 'small-btn'; restore.textContent = 'Restore'; restore.style.marginLeft = '8px'; restore.style.padding = '6px 8px'; restore.onclick = (ev) => { ev.stopPropagation(); archiveClassroomToggle(c.id); renderSidebar(); };
      row.appendChild(restore);
      archList.appendChild(row);
    });
    toggle.addEventListener('click', () => { const open = toggle.dataset.open === 'true'; toggle.dataset.open = String(!open); toggle.textContent = open ? 'Show' : 'Hide'; archList.style.display = open ? 'none' : 'block'; });
    header.appendChild(title); header.appendChild(toggle); sep.appendChild(header); sep.appendChild(archList); classListEl.appendChild(sep);
  }
}

function openClass(id) {
  const snapshot = loadClassroom(id);
  window.currentClass = snapshot;
  if (!snapshot) { showToast('Failed to load class', { type: 'error' }); return; }
  selectedClassId = id;
  // set current classroom for main app compatibility
  try { localStorage.setItem('fairy_current_classroom', id); } catch (e) { }
  // highlight
  Array.from(classListEl.children).forEach(ch => ch.classList.toggle('active', ch.dataset.id === id));
  // show main content
  welcome.style.display = 'none';
  classArea.style.display = 'block';
  // show the shared childList container
  try { if (classContent) { classContent.style.display = ''; classContent.style.marginTop = '18px'; } } catch (e) { }
  classTitleMeta.textContent = snapshot.__classroomName || 'Class';
  classCounts.textContent = `${(snapshot.students || []).length} students · ${(snapshot.tasks || []).length} tasks` + (snapshot.__archived ? ' · Archived' : '');
  try {
    // Ensure legacy topbar is hidden; action buttons are available in the sidebar
    try { const topbar = document.getElementById('topbarActions'); if (topbar) topbar.style.display = 'none'; } catch (e) { }
    // ensure sidebar action buttons are visible
    try {
      const sab = document.querySelector('.side-actions-buttons');
      if (sab) {
        // Only show the sidebar stacked action buttons on small screens —
        // desktop/larger screens use the floating menu instead.
        if (window.innerWidth <= 960) sab.style.display = '';
        else sab.style.display = 'none';
      }
    } catch (e) { }
  } catch (e) { }
  // update options menu archive button label to reflect current state
  try { const archBtn = document.getElementById('archiveClassBtn'); if (archBtn) archBtn.textContent = snapshot.__archived ? 'Unarchive' : 'Archive'; } catch (e) { }
  renderClassContent(snapshot);
}

function renderClassContent(snapshot) {
  classContent.innerHTML = '';
  const students = snapshot.students || [];
  // sort students by total points (highest first) for display
  const sortedStudents = students.slice().sort((a, b) => (b.total || 0) - (a.total || 0));
  const tasks = snapshot.tasks || [];

  // Append child cards directly into the `childList` container (classContent)
  sortedStudents.slice(0, 24).forEach(s => {
    // child-card with door, avatar overlay, mailbox and name like main page
    const card = document.createElement('div'); card.className = 'child-card';
    // ensure each card carries the student id so callers can reliably
    // find the rendered element regardless of sort order
    if (s && s.id) card.setAttribute('data-student-id', s.id);

    // door wrap and SVG
    const doorWrap = document.createElement('div'); doorWrap.className = 'door-wrap';
    const door = document.createElement('div'); door.className = 'door-img'; door.innerHTML = chibiDoorSVGDirect(s.doorTheme || '#ffd1f0');
    // Make the whole door area clickable (including avatar/overlay)
    doorWrap.style.cursor = 'pointer';
    doorWrap.addEventListener('click', () => {
      // Open the reward modal for this student when any part of the door is clicked
      openRewardModal(selectedClassId, s.id);
    });
    doorWrap.appendChild(door);

    // overlay container
    const overlay = document.createElement('div'); overlay.className = 'door-overlay';
    const photo = document.createElement('img'); photo.className = 'door-avatar'; photo.alt = s.name;
    const photoSrc = (s.photo && typeof s.photo === 'string' && s.photo.indexOf('ref:') === 0) ? (getPhotoDataById(s.photo.slice(4)) || '') : (s.photo || '');
    photo.src = photoSrc || '';

    // mailbox and points
    const mailbox = document.createElement('div'); mailbox.className = 'mailbox'; mailbox.innerHTML = `<div class='mail-slot'></div>`;
    const pointsBadge = document.createElement('div'); pointsBadge.className = 'mailbox-points'; pointsBadge.textContent = '⭐ ' + (s.total || 0);
    mailbox.appendChild(pointsBadge);

    const nameTag = document.createElement('div'); nameTag.className = 'door-name name-tag'; nameTag.textContent = s.name; nameTag.style.color = getVibrantColor();

    // assemble overlay
    overlay.appendChild(mailbox);
    overlay.appendChild(nameTag);
    overlay.appendChild(photo);
    doorWrap.appendChild(overlay);

    // actions container (reward button removed; clicking door now opens reward modal)
    const actions = document.createElement('div'); actions.className = 'actions'; actions.style.display = 'none';

    // append
    card.appendChild(doorWrap);
    card.appendChild(actions);

    // position overlay elements relative to avatar (lightweight)
    (function setupOverlayPositioning() {
      try {
        const update = () => {
          const wrapR = doorWrap.getBoundingClientRect();
          const avR = photo.getBoundingClientRect();
          // center mailbox under avatar
          const centerX = (avR.left - wrapR.left) + avR.width / 2;
          mailbox.style.left = '50%'; mailbox.style.transform = 'translateX(-50%)';
          // Position mailbox and name relative to the bottom of the first SVG inside .door-img
          try {
            const svg = door.querySelector('svg');
            if (svg) {
              const svgR = svg.getBoundingClientRect();
              // clear any CSS bottom so top placement is authoritative
              mailbox.style.bottom = 'auto';
              // place mailbox just inside the SVG bottom (a small inset)
              const mailboxTop = Math.round(svgR.bottom - wrapR.top - mailbox.offsetHeight - 80);
              mailbox.style.top = mailboxTop + 'px';

              // name: position slightly below the SVG bottom (near the door base)
              nameTag.style.bottom = 'auto';
              nameTag.style.left = Math.round(centerX) + 'px';
              // place name just below the SVG bottom (small offset)
              nameTag.style.top = Math.round(svgR.bottom - wrapR.top + -60) + 'px';
              nameTag.style.transform = 'translateX(-50%)';
            } else {
              // fallback to avatar-based placement
              mailbox.style.bottom = '';
              const topOffset = (avR.bottom - wrapR.top) + 8;
              mailbox.style.top = Math.round(topOffset) + 'px';
              const mbR = mailbox.getBoundingClientRect();
              nameTag.style.left = Math.round(centerX) + 'px';
              nameTag.style.top = Math.round(mbR.bottom - wrapR.top + 8) + 'px';
              nameTag.style.transform = 'translateX(-50%)';
            }
          } catch (e) {
            // final fallback: simple avatar-based placement
            try { const topOffset = (avR.bottom - wrapR.top) + 8; mailbox.style.top = Math.round(topOffset) + 'px'; const mbR = mailbox.getBoundingClientRect(); nameTag.style.left = Math.round(centerX) + 'px'; nameTag.style.top = Math.round(mbR.bottom - wrapR.top + 8) + 'px'; nameTag.style.transform = 'translateX(-50%)'; } catch (e) { }
          }
        };
        requestAnimationFrame(update); setTimeout(() => requestAnimationFrame(update), 160);
        if (window.ResizeObserver) { const ro = new ResizeObserver(() => requestAnimationFrame(update)); ro.observe(doorWrap); ro.observe(photo); } else { window.addEventListener('resize', update); }
      } catch (e) { console.warn('overlay positioning', e); }
    })();

    classContent.appendChild(card);
  });

  // (Points/Skills removed from the students page — this area is now provided in the Add Tasks modal)
}

// Create-class: open a compact popup modal from the sidebar button
const openCreateClassBtnEl = document.getElementById('openCreateClassBtn');
if (openCreateClassBtnEl) openCreateClassBtnEl.addEventListener('click', () => openCreateClassModal());

function openCreateClassModal() {
  try { closeAllExcept([]); window.__fd_lastPanelOpenMs = Date.now(); } catch (e) { }
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  mb.innerHTML = `<div class='modal' style='max-width:640px;width:92%;padding:20px;border-radius:14px'>
        <div style='display:flex;align-items:center;justify-content:space-between'><h3 style='margin:0;font-size:20px;font-weight:900'>Create new class</h3><button id='closeCreate' class='btn-muted modal-close-x' style='width:44px;height:44px;border-radius:999px'>✕</button></div>
        <div style='height:14px'></div>
        <div style='display:flex;gap:16px;align-items:flex-start'>
          <div style='width:120px'>
            <div id='classPreview' style='width:96px;height:96px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 32px rgba(20,30,80,0.06);overflow:hidden;border:1px solid #f0f2f6'></div>
          </div>
          <div style='flex:1'>
            <label for='createClassName' style='font-weight:800;display:block;margin-bottom:6px'>Class name</label>
            <input id='createClassName' placeholder="e.g. Mr. Mike's Class" style='width:100%;padding:12px;border-radius:12px;border:1px solid #e6e9ef;font-size:16px'/>
            <div style='height:10px'></div>
            <label for='createClassGrade' style='font-weight:800;display:block;margin-bottom:6px'>Grade</label>
            <select id='createClassGrade' style='width:220px;padding:10px;border-radius:12px;border:1px solid #e6e9ef'>
              <option value=''>Choose grade</option>
              <option>Pre-K</option>
              <option>K</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4</option>
              <option>5</option>
              <option>6</option>
              <option>7</option>
              <option>8</option>
              <option>9</option>
              <option>10</option>
            </select>
            <div style='height:12px'></div>
            <label for='createAvatarUpload' style='font-weight:800;display:block;margin-bottom:6px'>Choose icon <small style='font-weight:600;color:#7b7b7b;margin-left:8px;font-size:12px'>(or upload)</small></label>
            <div style='display:flex;align-items:center;gap:10px;margin-bottom:8px'>
              <input id='createAvatarUpload' type='file' accept='image/*' style='display:none'/>
              <div style='display:flex;flex-direction:column;gap:8px'>
                <div style='display:flex;gap:8px'>
                  <button id='uploadAvatarBtn' type='button' class='small-btn' style='padding:8px 10px'>Upload</button>
                  <button id='removeAvatarBtn' type='button' class='btn-muted' style='padding:8px 10px'>Remove</button>
                </div>
                <div style='color:#8b96a8;font-size:12px'>PNG/JPG, up to 2MB</div>
              </div>
            </div>
            <div id='createAvatarGrid' style='display:grid;grid-template-columns:repeat(auto-fill,48px);gap:8px;max-width:320px'></div>
          </div>
        </div>
        <div style='height:16px'></div>
        <div style='border-top:1px solid #f0f2f6;padding-top:12px;text-align:right;display:flex;justify-content:flex-end;gap:10px'>
          <button id='cancelCreate' class='btn-muted'>Cancel</button>
          <button id='confirmCreate' class='action-btn'>Create</button>
        </div>
      </div>`;
  document.body.appendChild(mb);
  // conservative input attributes to reduce extension/IME autofill interference
  try {
    const createInput = mb.querySelector('#createClassName');
    if (createInput) {
      createInput.setAttribute('autocomplete', 'off');
      createInput.setAttribute('autocorrect', 'off');
      createInput.setAttribute('autocapitalize', 'off');
      createInput.setAttribute('spellcheck', 'false');
      createInput.dataset.td = 'ignore';
    }
  } catch (e) { }
  attachModalBehavior(mb, '#createClassName');

  // create a set of icons (distinct from student avatars)
  function makeIcon(emoji, bg) { const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='16' fill='${bg}'/><text x='50%' y='54%' font-size='56' text-anchor='middle' dominant-baseline='middle'>${emoji}</text></svg>`; return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg); }
  const icons = [['🌍', '#e8fbff'], ['📚', '#fff7e6'], ['🚀', '#f0f7ff'], ['🎨', '#fff0f8'], ['🦉', '#f3fff0'], ['🏆', '#fff9e6'], ['🔬', '#f0f6ff'], ['🎵', '#fff2f6'],
  ['🌟', '#fff6e8'], ['🧭', '#f0f8ff'], ['🪐', '#f6f0ff'], ['🧪', '#f0fff6'], ['🧩', '#fff0f0'], ['🎯', '#f8f6ff'], ['📐', '#f2f7ff'], ['🛡️', '#fff8f0']];
  const grid = mb.querySelector('#createAvatarGrid'); const preview = mb.querySelector('#classPreview');
  let selectedIcon = makeIcon('🏫', '#fff6f0'); preview.innerHTML = `<img src='${selectedIcon}' style='width:72px;height:72px;border-radius:10px;object-fit:cover'/>`;
  icons.forEach(([em, bg]) => { const d = makeIcon(em, bg); const b = document.createElement('button'); b.type = 'button'; b.style.cssText = 'width:48px;height:48px;border-radius:8px;border:2px solid transparent;padding:0;background-image:url("' + d + '")'; b.style.backgroundImage = 'url("' + d + '")'; b.style.backgroundSize = 'cover'; b.onclick = () => { selectedIcon = d; preview.innerHTML = `<img src="${d}" style="width:72px;height:72px;border-radius:10px;object-fit:cover"/>`; }; grid.appendChild(b); });

  // wire upload/remove buttons inside the modal
  try {
    const uploadBtn = mb.querySelector('#uploadAvatarBtn');
    const removeBtn = mb.querySelector('#removeAvatarBtn');
    const uploadInput = mb.querySelector('#createAvatarUpload');
    if (uploadBtn && uploadInput) {
      uploadBtn.addEventListener('click', () => uploadInput.click());
      uploadInput.addEventListener('change', (ev) => {
        const f = ev.target.files && ev.target.files[0]; if (!f) return;
        if (f.size > 2 * 1024 * 1024) { showToast('Image too large (max 2MB)', { type: 'warning' }); return; }
        const reader = new FileReader();
        reader.onload = (e) => { try { selectedIcon = e.target.result || selectedIcon; preview.innerHTML = `<img src="${selectedIcon}" style="width:72px;height:72px;border-radius:10px;object-fit:cover"/>`; preview.dataset.uploaded = '1'; } catch (err) { console.warn(err); } };
        reader.onerror = () => { try { const url = URL.createObjectURL(f); selectedIcon = url; preview.innerHTML = `<img src="${selectedIcon}" style="width:72px;height:72px;border-radius:10px;object-fit:cover"/>`; preview.dataset.uploaded = '1'; } catch (err) { console.warn(err); } };
        try { reader.readAsDataURL(f); } catch (e) { try { const url = URL.createObjectURL(f); selectedIcon = url; preview.innerHTML = `<img src="${selectedIcon}" style="width:72px;height:72px;border-radius:10px;object-fit:cover"/>`; preview.dataset.uploaded = '1'; } catch (_e) { } }
      });
    }
    if (removeBtn) { removeBtn.addEventListener('click', () => { selectedIcon = makeIcon('🏫', '#fff6f0'); preview.innerHTML = `<img src='${selectedIcon}' style='width:72px;height:72px;border-radius:10px;object-fit:cover'/>`; try { uploadInput.value = ''; preview.dataset.uploaded = '0'; } catch (e) { } }); }
  } catch (e) { console.warn('avatar upload wiring failed', e); }

  mb.querySelector('#closeCreate').onclick = () => closeModal(mb);
  mb.querySelector('#cancelCreate').onclick = () => closeModal(mb);
  mb.querySelector('#confirmCreate').onclick = async () => {
    const name = (mb.querySelector('#createClassName').value || '').trim(); if (!name) { showFieldError(mb, '#createClassName', 'Enter class name'); return; }
    const grade = mb.querySelector('#createClassGrade').value || '';
    const existing = listClassrooms().find(c => c.name && c.name.toLowerCase() === name.toLowerCase()); if (existing) { showFieldError(mb, '#createClassName', 'A class with that name already exists.'); return; }
    const id = uid(); const snapshot = { __classroomName: name, students: [], tasks: [], created: Date.now(), grade, __classIcon: selectedIcon };
    // 1) Optimistically write local + update UI immediately
    try {
      localStorage.setItem(classroomKey(id), JSON.stringify(snapshot));
    } catch (e) {
      // fall through to slow path if localStorage fails
    }
    renderSidebar();           // sidebar shows new class right away
    closeModal(mb);
    openClass(id);             // main view opens immediately
    try {

      // showToast('Creating class…', { type: 'default' });
      const ok = await saveClassroom(id, snapshot);
      if (!ok) { showToast('Failed to save class', { type: 'error' }); return; }
      renderSidebar(); closeModal(mb);
      try { await openClass(id); } catch (e) { /* openClass will show errors if it fails */ }
    } catch (e) { console.warn('create class failed', e); showToast('Failed to create class', { type: 'error' }); }
  };
}

// collapse sidebar: deterministic open/close and robust backdrop handling on small screens
if (collapseBtn) {
  collapseBtn.addEventListener('click', (ev) => {
    const small = window.innerWidth <= 960;
    // If the button is visually hidden (responsive CSS) ignore clicks to avoid
    // duplicate hamburger behavior on tablet where topbar/mobileMenuBtn also exists.
    try {
      const visible = window.getComputedStyle(collapseBtn).display !== 'none' && collapseBtn.offsetParent !== null;
      if (small && !visible) { return; }
    } catch (e) { }
    if (small) {
      // On small screens toggle overlay open state
      const isOpen = sidebar.classList.contains('open');
      if (!isOpen) {
        // ensure exclusivity: close other panels before opening sidebar
        try { closeAllExcept(['sidebar']); } catch (e) { }
        sidebar.classList.add('open'); sidebar.classList.remove('collapsed'); collapseBtn.setAttribute('aria-expanded', 'true');
        // create backdrop
        if (!document.getElementById('sidebarBack')) {
          const back = document.createElement('div'); back.id = 'sidebarBack'; back.style.position = 'fixed'; back.style.inset = '0'; back.style.background = 'rgba(0,0,0,0.28)'; back.style.zIndex = 10000; back.tabIndex = -1;
          back.addEventListener('click', () => { sidebar.classList.remove('open'); back.remove(); collapseBtn.setAttribute('aria-expanded', 'false'); });
          document.body.appendChild(back);
          // ensure the sidebar itself sits above the topbar so it is visible on phones
          try { sidebar.style.zIndex = 10001; } catch (e) { }
          const escHandler = (ev) => { if (ev.key === 'Escape') { sidebar.classList.remove('open'); const b = document.getElementById('sidebarBack'); if (b) b.remove(); try { sidebar.style.zIndex = ''; } catch (e) { } collapseBtn.setAttribute('aria-expanded', 'false'); document.removeEventListener('keydown', escHandler); } };
          document.addEventListener('keydown', escHandler);
        }
      } else {
        sidebar.classList.remove('open'); const existing = document.getElementById('sidebarBack'); if (existing) existing.remove(); collapseBtn.setAttribute('aria-expanded', 'false');
        try { sidebar.style.zIndex = ''; } catch (e) { }
      }
    } else {
      // Desktop: toggle compact collapsed state
      const isCollapsed = sidebar.classList.toggle('collapsed');
      collapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
      // update icon and position
      updateCollapseButtonUI();
    }
    // refresh UI
  });
}

// mobileMenuBtn mirrors the collapse behavior but is placed in the topbar so it's
// always reachable on small devices where the sidebar is off-canvas.
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    try {
      const small = window.innerWidth <= 960;
      if (!small) {
        // Desktop behavior: toggle collapsed state (same as collapseBtn)
        try {
          if (collapseBtn) { collapseBtn.click(); } else {
            const isCollapsed = sidebar.classList.toggle('collapsed');
            collapseBtn && collapseBtn.setAttribute('aria-expanded', String(!isCollapsed));
            updateCollapseButtonUI();
          }
        } catch (e) { console.warn('desktop mobileBtn toggle failed', e); }
        return;
      }
      // Small screens: reuse collapse behavior to open overlay if closed
      if (!sidebar.classList.contains('open')) {
        // ensure exclusivity
        try { closeAllExcept(['sidebar']); } catch (e) { }
        sidebar.classList.add('open'); sidebar.classList.remove('collapsed');
        // create backdrop if not present
        if (!document.getElementById('sidebarBack')) {
          const back = document.createElement('div'); back.id = 'sidebarBack'; back.style.position = 'fixed'; back.style.inset = '0'; back.style.background = 'rgba(0,0,0,0.28)'; back.style.zIndex = 10000; back.tabIndex = -1;
          back.addEventListener('click', () => { sidebar.classList.remove('open'); back.remove(); collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false'); try { sidebar.style.zIndex = ''; } catch (e) { } });
          document.body.appendChild(back);
          // ensure sidebar sits above topbar while open
          try { sidebar.style.zIndex = 10001; } catch (e) { }
          const escHandler = (ev) => { if (ev.key === 'Escape') { sidebar.classList.remove('open'); const b = document.getElementById('sidebarBack'); if (b) b.remove(); try { sidebar.style.zIndex = ''; } catch (e) { } collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false'); document.removeEventListener('keydown', escHandler); } };
          document.addEventListener('keydown', escHandler);
        }
        if (collapseBtn) collapseBtn.setAttribute('aria-expanded', 'true');
      } else {
        sidebar.classList.remove('open'); const existing = document.getElementById('sidebarBack'); if (existing) existing.remove(); collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false');
      }
      updateCollapseButtonUI();
    } catch (e) { console.warn('mobile menu toggle failed', e); }
  });
}

// Fallback: ensure the mobile menu button always toggles the sidebar even if
// other handlers fail or are removed by DOM moves. This listener is idempotent
// and safe to run multiple times.
(function ensureMobileMenuFallback() {
  try {
    const btn = document.getElementById('mobileMenuBtn'); if (!btn) return;
    // avoid adding duplicate handler
    if (btn.__lf_mobile_fallback_attached) return; btn.__lf_mobile_fallback_attached = true;
    btn.addEventListener('click', (ev) => {
      try {
        ev.stopPropagation();
        const small = window.innerWidth <= 960;
        // Prefer reuse of the collapseBtn behavior when available
        if (collapseBtn) {
          // trigger the same behavior as the collapse button would
          collapseBtn.click();
          return;
        }
        // Otherwise toggle overlay for small screens, or collapse on desktop
        if (small) {
          if (!sidebar.classList.contains('open')) {
            try { closeAllExcept(['sidebar']); } catch (e) { }
            sidebar.classList.add('open'); sidebar.classList.remove('collapsed');
            if (!document.getElementById('sidebarBack')) {
              const back = document.createElement('div'); back.id = 'sidebarBack'; back.style.position = 'fixed'; back.style.inset = '0'; back.style.background = 'rgba(0,0,0,0.28)'; back.style.zIndex = 10000; back.tabIndex = -1;
              back.addEventListener('click', () => { sidebar.classList.remove('open'); back.remove(); try { collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false'); } catch (e) { } });
              document.body.appendChild(back);
              try { sidebar.style.zIndex = 10001; } catch (e) { }
              const esc = (ev) => { if (ev.key === 'Escape') { sidebar.classList.remove('open'); const b = document.getElementById('sidebarBack'); if (b) b.remove(); try { sidebar.style.zIndex = ''; } catch (e) { } try { collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false'); } catch (e) { } document.removeEventListener('keydown', esc); } };
              document.addEventListener('keydown', esc);
            }
            try { collapseBtn && collapseBtn.setAttribute('aria-expanded', 'true'); } catch (e) { }
          } else {
            sidebar.classList.remove('open'); const existing = document.getElementById('sidebarBack'); if (existing) existing.remove(); try { collapseBtn && collapseBtn.setAttribute('aria-expanded', 'false'); } catch (e) { }
          }
        } else {
          const isCollapsed = sidebar.classList.toggle('collapsed');
          try { collapseBtn && collapseBtn.setAttribute('aria-expanded', String(!isCollapsed)); } catch (e) { }
        }
        try { updateCollapseButtonUI(); } catch (e) { }
      } catch (e) { console.warn('mobileMenuBtn fallback failed', e); }
    });
  } catch (e) { console.warn('ensureMobileMenuFallback failed', e); }
})();

// update collapse button icon based on state (no absolute positioning anymore)
function updateCollapseButtonUI() {
  try {
    const small = window.innerWidth <= 960;
    if (small) {
      collapseBtn.textContent = sidebar.classList.contains('open') ? '✕' : '☰';
      try { const m = document.getElementById('mobileMenuBtn'); if (m) { m.textContent = collapseBtn.textContent; m.style.display = 'inline-flex'; } } catch (e) { }
    } else {
      collapseBtn.textContent = sidebar.classList.contains('collapsed') ? '☰' : '«';
    }
    try { updateSidebarWidthVar(); } catch (e) { }
  } catch (e) { }
}
window.addEventListener('resize', updateCollapseButtonUI);
setTimeout(updateCollapseButtonUI, 20);
// Keep CSS variable `--sidebar-width` in sync with the real sidebar size so
// `.main` can use it for its left margin. This allows the sidebar to grow
// based on class name length while keeping content properly offset.
function updateSidebarWidthVar() {
  try {
    const sb = document.getElementById('sidebar'); if (!sb) return;
    // If collapsed, prefer the collapsed width
    if (sb.classList.contains('collapsed')) {
      document.documentElement.style.setProperty('--sidebar-width', '84px');
      return;
    }
    const w = sb.offsetWidth || 340;
    document.documentElement.style.setProperty('--sidebar-width', w + 'px');
  } catch (e) { }
}
window.addEventListener('resize', () => { try { updateSidebarWidthVar(); } catch (e) { } });
setTimeout(updateSidebarWidthVar, 30);

// MutationObserver: watch the class list for content changes (class names added/removed)
// and recalculate sidebar width whenever the DOM changes so it adapts to new content
(function setupSidebarWidthObserver() {
  try {
    const classList = document.getElementById('classList');
    if (!classList) return;

    const observer = new MutationObserver((mutations) => {
      try {
        // Debounce: wait a bit for multiple mutations to settle, then update width
        clearTimeout(window.__lf_sidebar_observer_timeout);
        window.__lf_sidebar_observer_timeout = setTimeout(() => {
          try { updateSidebarWidthVar(); } catch (e) { }
        }, 100);
      } catch (e) { }
    });

    // Watch for any text changes, DOM additions/removals in the class list
    observer.observe(classList, {
      childList: true,
      subtree: true,
      characterData: true
    });

    // Expose for debugging if needed
    try { window.__lf_sidebar_observer = observer; } catch (e) { }
  } catch (e) { console.warn('setupSidebarWidthObserver failed', e); }
})();


// central action buttons
document.getElementById('btnAddStudent').addEventListener('click', () => {
  if (!selectedClassId) { showToast('Select a class first', { type: 'warning' }); return; }
  openAddEditStudentsModal(selectedClassId);
});
document.getElementById('btnAddTasks').addEventListener('click', () => { if (!selectedClassId) { showToast('Select a class first', { type: 'warning' }); return; } openAddEditTasksModal(selectedClassId); });
document.getElementById('btnReports').addEventListener('click', () => { if (!selectedClassId) { showToast('Select a class first', { type: 'warning' }); return; } openReportsModal(selectedClassId); });
const btnRemove = document.getElementById('btnRemoveClass');
if (btnRemove) { btnRemove.addEventListener('click', () => { if (!selectedClassId) { showToast('Select a class first', { type: 'warning' }); return; } openConfirm('Delete this class? This will remove all students and cannot be undone.').then(ok => { if (ok) removeClassroomById(selectedClassId); }); }); }

// Link Play/Create Games button to games.html
const btnGames = document.getElementById('btnGames');
if (btnGames) {
  btnGames.addEventListener('click', () => {
    window.location.href = 'games.html';
  });
}

// modal helper: attach focus trap and keyboard handlers
function attachModalBehavior(mb, focusSelector) {
  const dialog = mb.querySelector('.modal');
  mb.setAttribute('role', 'dialog'); mb.setAttribute('aria-modal', 'true');
  // ensure dialog is positioned relative so our close button sits correctly
  try { if (dialog) dialog.style.position = dialog.style.position || 'relative'; } catch (e) { }
  const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
  const focusables = Array.from(mb.querySelectorAll(focusableSelector)).filter(el => !el.disabled && el.offsetParent !== null);
  const firstFocusable = focusSelector ? mb.querySelector(focusSelector) || focusables[0] : focusables[0];
  // Use a safe, delayed focus triggered by the user's first interaction (pointerdown)
  // instead of auto-focusing on open. This avoids triggering buggy extension focus handlers.
  function safeFocus(el) {
    try {
      if (!el) return;
      requestAnimationFrame(() => { try { setTimeout(() => { try { el.focus(); } catch (e) { } }, 40); } catch (e) { } });
    } catch (e) { }
  }
  try {
    // Disable common extension/grammarly heuristics on modal inputs
    Array.from(mb.querySelectorAll('input,textarea,select')).forEach(inp => {
      try {
        inp.setAttribute('data-gramm', 'false'); inp.setAttribute('data-gramm_editor', 'false'); inp.setAttribute('data-enable-grammarly', 'false');
        inp.setAttribute('spellcheck', 'false');
        inp.setAttribute('aria-autocomplete', 'none');
      } catch (e) { }
    });
  } catch (e) { }
  if (firstFocusable) {
    const userFocusHandler = function userFocusHandler(ev) {
      try { safeFocus(firstFocusable); } catch (e) { }
    };
    mb.addEventListener('pointerdown', userFocusHandler, { once: true, passive: true });
  }
  // add a standardized top-right "X" close button if not present
  try {
    if (dialog && !dialog.querySelector('.modal-close-x')) {
      const x = document.createElement('button'); x.type = 'button'; x.className = 'modal-close-x'; x.setAttribute('aria-label', 'Close');
      x.innerHTML = (mb && mb.dataset && mb.dataset.closeLabel) ? mb.dataset.closeLabel : '✕';
      x.addEventListener('click', () => { try { closeModal(mb); } catch (e) { try { mb.remove(); } catch (_) { } } });
      dialog.appendChild(x);
      // small appear animation
      setTimeout(() => { try { dialog.classList.add('modal-open'); } catch (e) { } }, 10);
    } else if (dialog) {
      // ensure visible state for existing X
      setTimeout(() => { try { dialog.classList.add('modal-open'); } catch (e) { } }, 10);
    }
  } catch (e) {/* ignore */ }
  // hide any literal textual buttons labeled "Close" to avoid duplicate controls
  try {
    Array.from(mb.querySelectorAll('button')).forEach(b => {
      try { const txt = (b.textContent || '').trim().toLowerCase(); if (txt === 'close') { b.style.display = 'none'; } } catch (e) { }
    });
  } catch (e) { }
  function handleKey(e) {
    if (e.key === 'Escape') { try { closeModal(mb); } catch (e) { try { mb.remove(); } catch (_) { } } }
    if (e.key === 'Tab') {
      if (focusables.length === 0) return;
      const idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey) {
        if (idx === 0) { e.preventDefault(); safeFocus(focusables[focusables.length - 1]); }
      } else {
        if (idx === focusables.length - 1) { e.preventDefault(); safeFocus(focusables[0]); }
      }
    }
  }
  mb.addEventListener('keydown', handleKey);
  // clicking backdrop closes
  mb.addEventListener('click', (ev) => { if (ev.target === mb) try { closeModal(mb); } catch (e) { try { mb.remove(); } catch (_) { } } });
}

// unified close with animation
function closeModal(mb) {
  try {
    if (!mb || !mb.parentNode) return;
    const dialog = mb.querySelector('.modal');
    try { if (dialog) dialog.classList.add('modal-closing'); } catch (e) { }
    try { mb.classList.add('backdrop-fade-out'); } catch (e) { }
    // remove after animation
    setTimeout(() => { try { mb.remove(); } catch (e) { } finally { try { document.dispatchEvent(new Event('modal:maybeClosed')); } catch (e) { } } }, 220);
  } catch (e) { try { mb.remove(); } catch (err) { } }
}

// Gather blocked sync items (local snapshots that were marked __sync_blocked)
function gatherBlockedSyncItems() {
  const out = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k) continue; if (k.indexOf(CLASSROOM_PREFIX) !== 0) continue;
      try {
        const id = k.slice(CLASSROOM_PREFIX.length);
        const snap = JSON.parse(localStorage.getItem(k) || 'null'); if (!snap) continue;
        if (snap && snap.__sync_blocked) { out.push({ id, name: snap.__classroomName || id, snapshot: snap, blocked: snap.__sync_blocked }); }
      } catch (e) { }
    }
  } catch (e) { }
  return out;
}

// Retry a blocked item by attempting a single saveClassroom and reporting result
async function retryBlockedItem(id) {
  try {
    const snap = JSON.parse(localStorage.getItem(classroomKey(id)) || 'null'); if (!snap) { showToast('Snapshot missing', { type: 'warning' }); return false; }
    // clear the __sync_blocked marker before retry so UI is accurate
    try { delete snap.__sync_blocked; localStorage.setItem(classroomKey(id), JSON.stringify(snap)); } catch (e) { }
    const ok = await saveClassroom(id, snap);
    if (ok) { showToast('Retry succeeded for ' + (snap.__classroomName || id), { type: 'success' }); try { renderSidebar(); } catch (e) { } return true; }
    showToast('Retry failed for ' + (snap.__classroomName || id), { type: 'error' }); return false;
  } catch (e) { console.warn('retryBlockedItem failed', e); showToast('Retry error', { type: 'error' }); return false; }
}

// Duplicate a blocked class into the current user's account (new id)
async function duplicateBlockedToMyAccount(id) {
  try {
    const snap = JSON.parse(localStorage.getItem(classroomKey(id)) || 'null'); if (!snap) { showToast('Snapshot missing', { type: 'warning' }); return null; }
    // clone and remove blocking metadata
    const clone = JSON.parse(JSON.stringify(snap)); delete clone.__sync_blocked; delete clone.__owner; // new owner will be set on save
    const newId = uid(); clone.__updated_at = new Date().toISOString();
    try { localStorage.setItem(classroomKey(newId), JSON.stringify(clone)); } catch (e) { }
    const ok = await saveClassroom(newId, clone);
    if (ok) { showToast('Duplicated into your account', { type: 'success' }); try { renderSidebar(); } catch (e) { } return newId; }
    showToast('Duplicate save failed', { type: 'error' }); return null;
  } catch (e) { console.warn('duplicateBlockedToMyAccount failed', e); showToast('Duplicate error', { type: 'error' }); return null; }
}

// Dismiss blocked marker (optionally clear tombstone if requested)
function dismissBlockedMarker(id, clearTomb = false) {
  try {
    const snap = JSON.parse(localStorage.getItem(classroomKey(id)) || 'null'); if (!snap) return false;
    delete snap.__sync_blocked; try { localStorage.setItem(classroomKey(id), JSON.stringify(snap)); } catch (e) { }
    if (clearTomb) { try { clearTombstone(id); } catch (e) { } }
    showToast('Dismissed blocked marker for ' + (snap.__classroomName || id), { type: 'default' });
    try { renderSidebar(); } catch (e) { }
    return true;
  } catch (e) { console.warn('dismissBlockedMarker failed', e); return false; }
}

// Modal UI: show blocked sync items with actions
function showBlockedSyncModal() {
  try {
    const items = gatherBlockedSyncItems();
    const mb = document.createElement('div'); mb.className = 'modal-backdrop';
    const inner = document.createElement('div'); inner.className = 'modal'; inner.style.maxWidth = '760px';
    inner.innerHTML = `<h3 style='margin-top:0'>Blocked sync items</h3><div style='margin-top:8px;font-size:13px;color:#556'>These classes were skipped during sync because the server blocked the write. You can Retry, Duplicate into your account, or Dismiss the marker.</div><div id='blockedList' style='margin-top:12px;max-height:48vh;overflow:auto'></div><div style='text-align:right;margin-top:12px'><button id='closeBlocked' class='btn-muted'>Close</button></div>`;
    mb.appendChild(inner); document.body.appendChild(mb);
    attachModalBehavior(mb);
    const listEl = inner.querySelector('#blockedList');
    if (!items || items.length === 0) { listEl.innerHTML = '<div style="color:#889;">No blocked items found.</div>'; }
    items.forEach(it => {
      try {
        const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:8px;border-radius:8px;border:1px solid #f0f2f6;margin-bottom:8px;background:#fff';
        const left = document.createElement('div'); left.style.flex = '1'; left.innerHTML = `<div style='font-weight:800'>${it.name}</div><div style='font-size:12px;color:#667'>${it.id} · ${new Date(it.blocked.ts || 0).toLocaleString()}</div><div style='font-size:12px;color:#a33;margin-top:6px'>${(it.blocked && it.blocked.reason) ? String(it.blocked.reason) : ''}</div>`;
        const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '8px';
        const retry = document.createElement('button'); retry.className = 'small-btn'; retry.textContent = 'Retry';
        const dup = document.createElement('button'); dup.className = 'action-btn'; dup.textContent = 'Duplicate';
        const dismissBtn = document.createElement('button'); dismissBtn.className = 'btn-muted'; dismissBtn.textContent = 'Dismiss';
        retry.addEventListener('click', async () => { try { retry.disabled = true; const ok = await retryBlockedItem(it.id); retry.disabled = false; if (ok) { row.style.opacity = '0.5'; } } catch (e) { retry.disabled = false; } });
        dup.addEventListener('click', async () => { try { dup.disabled = true; const newId = await duplicateBlockedToMyAccount(it.id); dup.disabled = false; if (newId) { row.style.opacity = '0.5'; } } catch (e) { dup.disabled = false; } });
        dismissBtn.addEventListener('click', () => { try { dismissBlockedMarker(it.id, false); row.remove(); } catch (e) { } });
        actions.appendChild(retry); actions.appendChild(dup); actions.appendChild(dismissBtn);
        row.appendChild(left); row.appendChild(actions); listEl.appendChild(row);
      } catch (e) { }
    });
    inner.querySelector('#closeBlocked').addEventListener('click', () => closeModal(mb));
    // expose helper globally
    try { window._lf_showBlockedSyncModal = showBlockedSyncModal; } catch (e) { }
    return mb;
  } catch (e) { console.warn('showBlockedSyncModal failed', e); }
}
// Ensure the helper is available globally even before first invocation
try { window._lf_showBlockedSyncModal = window._lf_showBlockedSyncModal || showBlockedSyncModal; } catch (e) { }

// Toast notification system (replaces native alert for nicer UX)
(function () {
  function ensureContainer() {
    let c = document.querySelector('.toast-container');
    if (!c) { c = document.createElement('div'); c.className = 'toast-container'; c.setAttribute('aria-live', 'polite'); document.body.appendChild(c); }
    return c;
  }
  function removeToast(el) {
    try { el.classList.remove('show'); setTimeout(() => { try { el.remove(); } catch (e) { } }, 220); } catch (e) { }
  }
  window.showToast = function (msg, opts = { type: 'default', duration: 3200 }) {
    try {
      const c = ensureContainer();
      const t = document.createElement('div'); t.className = 'toast ' + (opts.type || 'default'); t.setAttribute('role', 'status');
      const inner = document.createElement('div'); inner.style.display = 'flex'; inner.style.alignItems = 'center'; inner.style.justifyContent = 'space-between'; inner.style.gap = '12px';
      const txt = document.createElement('div'); txt.style.flex = '1'; txt.textContent = String(msg || '');
      const close = document.createElement('button'); close.type = 'button'; close.innerHTML = '✕'; close.style.background = 'transparent'; close.style.border = '0'; close.style.color = 'rgba(255,255,255,0.9)'; close.style.fontWeight = '800'; close.style.fontSize = '14px'; close.style.cursor = 'pointer';
      close.onclick = () => removeToast(t);
      inner.appendChild(txt); inner.appendChild(close); t.appendChild(inner);
      c.appendChild(t);
      // animate in
      requestAnimationFrame(() => { try { t.classList.add('show'); } catch (e) { } });
      const ms = typeof opts.duration === 'number' ? opts.duration : 3200;
      if (ms > 0) { setTimeout(() => removeToast(t), ms); }
      return t;
    } catch (e) { console.warn('showToast failed', e); }
  };
  // Replace native alert with toast-based notification (non-blocking)
  try { window._nativeAlert = window.alert; } catch (e) { }
  window.alert = function (msg) { try { showToast(msg, { type: 'warning', duration: 3500 }); } catch (e) { try { window._nativeAlert && window._nativeAlert(msg); } catch (err) { } } };
})();

// Inline error helpers and confirm modal
function clearFieldError(mb, selector) {
  try {
    if (!mb) return; const el = mb.querySelector(selector); if (!el) return;
    const next = el.nextElementSibling; if (next && next.classList && next.classList.contains('inline-error')) next.remove();
  } catch (e) { }
}
function showFieldError(mb, selectorOrEl, message) {
  try {
    const modal = mb && mb.querySelector ? mb : document.body;
    const el = typeof selectorOrEl === 'string' ? modal.querySelector(selectorOrEl) : selectorOrEl;
    if (!el) { showToast(message, { type: 'warning' }); return; }
    // remove existing error
    const existing = el.nextElementSibling; if (existing && existing.classList && existing.classList.contains('inline-error')) existing.remove();
    const err = document.createElement('div'); err.className = 'inline-error'; err.textContent = message || 'Error';
    el.parentNode && el.parentNode.insertBefore(err, el.nextSibling);
    try { el.focus(); } catch (e) { }
    // shake the modal for emphasis
    const dialog = (mb && mb.querySelector) ? mb.querySelector('.modal') : document.querySelector('.modal');
    if (dialog) { shakeElement(dialog); }
  } catch (e) { console.warn('showFieldError', e); }
}
function showInlineInputError(inputEl, message) {
  try {
    if (!inputEl) return; const existing = inputEl.nextElementSibling; if (existing && existing.classList && existing.classList.contains('inline-error')) existing.remove();
    const err = document.createElement('div'); err.className = 'inline-error'; err.textContent = message || 'Error';
    inputEl.parentNode && inputEl.parentNode.insertBefore(err, inputEl.nextSibling);
    try { inputEl.focus(); } catch (e) { }
    shakeElement(inputEl);
  } catch (e) { }
}
function shakeElement(el) { try { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); setTimeout(() => { try { el.classList.remove('shake'); } catch (e) { } }, 420); } catch (e) { } }

// lightweight confirm modal returning Promise<boolean>
function openConfirm(message, opts = { confirmLabel: 'Yes', cancelLabel: 'Cancel' }) {
  return new Promise((resolve) => {
    try {
      const mb = document.createElement('div'); mb.className = 'modal-backdrop';
      mb.innerHTML = `<div class='modal' style='max-width:520px;padding:18px'><h3 style='margin-top:0'>${String(message)}</h3><div style='text-align:right;margin-top:14px;display:flex;gap:8px;justify-content:flex-end'><button id='cfCancel' class='btn-muted'>${opts.cancelLabel}</button><button id='cfOk' class='action-btn'>${opts.confirmLabel}</button></div></div>`;
      document.body.appendChild(mb);
      attachModalBehavior(mb);
      mb.querySelector('#cfCancel').onclick = () => { closeModal(mb); resolve(false); };
      mb.querySelector('#cfOk').onclick = () => { closeModal(mb); resolve(true); };
    } catch (e) { console.warn('openConfirm failed', e); resolve(false); }
  });
}

// Account modal: edit name and password
function openAccountModal() {
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  mb.innerHTML = `<div class='modal' style='max-width:520px;padding:18px'><h3 style='margin-top:0'>Account</h3>
            <div style='margin-top:8px'>
              <label for='acctFullName' style='font-weight:700;display:block;margin-bottom:6px'>Full name</label>
              <input id='acctFullName' placeholder='Your full name' style='width:100%;padding:10px;border-radius:8px;border:1px solid #e6e9ef'/>
            </div>
            <div style='margin-top:12px'>
              <label for='acctNewPassword' style='font-weight:700;display:block;margin-bottom:6px'>New password</label>
              <input id='acctNewPassword' placeholder='Leave blank to keep current' type='password' style='width:100%;padding:10px;border-radius:8px;border:1px solid #e6e9ef'/>
            </div>
            <div style='margin-top:12px;text-align:right;display:flex;gap:8px;justify-content:flex-end'>
              <button id='acctCancel' class='btn-muted'>Cancel</button>
              <button id='acctSave' class='action-btn'>Save</button>
            </div>
          </div>`;
  document.body.appendChild(mb);
  attachModalBehavior(mb, '#acctFullName');
  // populate existing name if available
  (async () => { try { const sup = window._lf_supabase; if (!sup) return; const s = await sup.auth.getSession(); const user = s && s.data && (s.data.session?.user || s.data.user) ? (s.data.session?.user || s.data.user) : null; if (user) { try { const meta = user.user_metadata || {}; const fn = meta.full_name || ''; const inp = mb.querySelector('#acctFullName'); if (inp) inp.value = fn; } catch (e) { } } } catch (e) { } })();
  mb.querySelector('#acctCancel').onclick = () => closeModal(mb);
  mb.querySelector('#acctSave').onclick = async () => {
    const name = (mb.querySelector('#acctFullName').value || '').trim(); const pwd = (mb.querySelector('#acctNewPassword').value || '').trim();
    try {
      const sup = window._lf_supabase; if (!sup) { showToast('Not connected', { type: 'error' }); return; }
      // update user metadata (if supported) and password if provided
      const updates = {};
      if (name) updates.user_metadata = Object.assign({}, (await (await sup.auth.getSession()).data.session?.user?.user_metadata) || {}, { full_name: name });
      if (pwd) updates.password = pwd;
      // call updateUser (Supabase client v1/v2 compatible branch)
      try {
        const res = await sup.auth.updateUser(updates);
        if (res.error) { showToast('Update failed', { type: 'error' }); return; }
        showToast('Profile updated', { type: 'success' });
        // reflect in dropdown and topbar
        try { const acctName = document.getElementById('acctName'); if (acctName) acctName.textContent = name; const currentMeta = document.getElementById('currentMeta'); if (currentMeta && name) currentMeta.textContent = name; } catch (e) { }
      } catch (e) { showToast('Update failed', { type: 'error' }); }
    } catch (e) { showToast('Update failed', { type: 'error' }); }
    closeModal(mb);
  };
}

// Add Student modal (supports optional studentId for editing)
async function openAddStudentModal(classId, studentId = null) {
  let snap = loadClassroom(classId);
  if (!snap) {
    try { showToast('Loading class…', { type: 'default' }); snap = await ensureClassLoaded(classId); } catch (e) { }
    if (!snap) { showToast('Failed to load class', { type: 'error' }); return; }
  }
  const existing = studentId ? (snap.students || []).find(s => s.id === studentId) : null;
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  const title = existing ? 'Edit Student' : 'Add Student';

  mb.innerHTML = `<div class='modal' role='document' style='width:min(920px,94vw);max-height:90vh;overflow:auto'><h3 style='margin-top:0'>${title}</h3>
        <div style='display:flex;gap:12px;align-items:center;margin-bottom:12px'>
          <div style='width:84px;height:84px;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 6px 12px rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center'>
            <img id='previewImg' src='' style='width:100%;height:100%;object-fit:cover'/>
          </div>
          <div style='flex:1'>
            <label for='stuName' style='font-weight:700;display:block;margin-bottom:6px'>Student Name</label>
            <input id='stuName' placeholder='Enter name...' type='text' style='width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:10px;font-size:16px;box-sizing:border-box'/>
            <div style='margin-top:8px;display:flex;gap:8px'>
              <button id='choosePhotoBtn' style='flex:1;padding:10px;background:#ff9be6;border:none;border-radius:8px;color:#222;font-weight:700;cursor:pointer'>📷 Choose Photo</button>
              <button id='clearPhotoBtn' style='padding:10px;background:#eee;border:none;border-radius:8px;color:#222;cursor:pointer'>✖</button>
            </div>
            <div id='previewCaption' style='margin-top:8px;font-size:12px;color:#222;font-weight:600'>Random</div>
          </div>
        </div>

        <div style='margin-bottom:12px'>
          <div style='font-weight:700;display:block;margin-bottom:8px' role='heading' aria-level='4'>Gender</div>
          <div style='display:flex;gap:12px'>
            <button data-gender='girl' class='gender-btn' style='flex:1;padding:10px;border:3px solid #ddd;background:#fff;border-radius:10px;font-weight:700;cursor:pointer'>👧 Girl</button>
            <button data-gender='boy' class='gender-btn' style='flex:1;padding:10px;border:3px solid #ddd;background:#fff;border-radius:10px;font-weight:700;cursor:pointer'>👦 Boy</button>
            <button data-gender='other' class='gender-btn' style='flex:1;padding:10px;border:3px solid #ddd;background:#fff;border-radius:10px;font-weight:700;cursor:pointer'>🌈 Other</button>
          </div>
        </div>

        <div style='margin-bottom:12px'>
          <div style='font-weight:700;display:block;margin-bottom:8px' role='heading' aria-level='4'>Choose Avatar</div>
          <div style='display:flex;gap:8px;align-items:center;margin-bottom:8px'>
            <button id='openAvatarListBtn' style='padding:10px;background:#7dd7ff;border:none;border-radius:8px;color:#004a6d;font-weight:700;cursor:pointer'>🎨 Avatars</button>
            <span style='font-size:12px;color:#444'>or upload a photo</span>
          </div>
          <div id='avatarList' style='display:none;max-height:220px;overflow:auto;border-top:1px solid #f0f0f0;padding-top:8px;margin-top:8px;box-sizing:border-box'></div>
          <div style='font-size:13px;color:#667;margin-top:6px'>Tip: Choose an avatar or upload a photo. Uploaded photos are stored separately (localStorage) and linked to the student.</div>
        </div>

        <div style='margin-bottom:8px'>
          <div style='font-weight:700;display:block;margin-bottom:8px' role='heading' aria-level='4'>Door Color</div>
          <div id='colorGrid' style='display:grid;grid-template-columns:repeat(4,1fr);gap:10px'></div>
        </div>

        <div class='actions' style='gap:10px;margin-top:12px'>
          <button id='stuCancel' class='btn-muted'>Cancel</button>
          <button id='stuSave' class='action-btn'>${existing ? 'Save' : 'Add Student'}</button>
        </div>
      </div>`;

  document.body.appendChild(mb);

  // local helpers
  function createEmojiAvatar(emoji, bg) { const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='16' fill='${bg}'/><text x='50%' y='52%' font-size='56' text-anchor='middle' dominant-baseline='middle'>${emoji}</text></svg>`; return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`; }
  const emojiList = ['🦄', '🧚‍♀️', '🦸‍♂️', '👾', '🐻', '🐲', '👽', '🐙', '🦊', '🐼', '🐵', '🦁'];
  const bgColors = ['#fff2fb', '#e8fbff', '#fff7e6', '#fff3d9', '#e8ffe8', '#fff0f0', '#f0f4ff'];

  const previewImg = mb.querySelector('#previewImg');
  const avatarList = mb.querySelector('#avatarList');
  const colorGrid = mb.querySelector('#colorGrid');
  const choosePhotoBtn = mb.querySelector('#choosePhotoBtn');
  const clearPhotoBtn = mb.querySelector('#clearPhotoBtn');
  const openAvatarListBtn = mb.querySelector('#openAvatarListBtn');

  // prepare avatars
  if (avatarList) {
    // keep avatars visible by default and keyboard-accessible
    avatarList.style.display = 'grid'; avatarList.style.gridTemplateColumns = 'repeat(auto-fill,84px)'; avatarList.style.gap = '12px'; avatarList.style.justifyContent = 'center';
    for (let i = 0; i < emojiList.length; i++) {
      const av = createEmojiAvatar(emojiList[i], bgColors[i % bgColors.length]);
      const b = document.createElement('button');
      b.type = 'button'; b.dataset.avatar = av;
      // accessibility + keyboard
      b.setAttribute('role', 'option'); b.tabIndex = 0;
      b.style.padding = '0'; b.style.border = '2px solid #ddd'; b.style.borderRadius = '10px'; b.style.width = '72px'; b.style.height = '72px';
      // ensure data uri is quoted inside url(...) so it renders reliably
      b.style.backgroundImage = 'url("' + av + '")';
      b.style.backgroundSize = 'cover'; b.style.backgroundPosition = 'center';
      b.title = 'Avatar ' + emojiList[i]; b.setAttribute('aria-label', 'Avatar ' + emojiList[i]);
      b.addEventListener('click', () => { previewImg.src = av; mb.querySelector('#previewCaption').textContent = 'Avatar chosen'; previewImg.dataset.uploaded = ''; mb.dataset.photoSource = 'avatar'; });
      avatarList.appendChild(b);
    }
    // install keyboard navigation for avatar buttons (arrow keys to move, enter/space to select)
    setTimeout(() => {
      try {
        const avBtns = Array.from(avatarList.querySelectorAll('button[data-avatar]'));
        avBtns.forEach((btn, idx) => {
          btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); return; }
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); const next = avBtns[(idx + 1) % avBtns.length]; if (next) try { safeFocusEl(next); } catch (e) { } }
            if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); const prev = avBtns[(idx - 1 + avBtns.length) % avBtns.length]; if (prev) try { safeFocusEl(prev); } catch (e) { } }
          });
        });
      } catch (e) {/* ignore */ }
    }, 0);
  }

  // color grid
  const doorColors = ['#ffd1f0', '#b3e6ff', '#ffe6b3', '#d1ffb3', '#ffb3d1', '#b3d1ff', '#ffd9b3', '#d9b3ff'];
  doorColors.forEach(c => {
    const b = document.createElement('button');
    b.style.width = '100%'; b.style.height = '40px'; b.style.borderRadius = '8px'; b.style.border = '2px solid #fff'; b.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.04)'; b.style.background = c; b.title = c;
    b.onclick = () => {
      mb.dataset.doorTheme = c;
      // visual selection: clear others and highlight this
      Array.from(colorGrid.children).forEach(ch => { ch.style.outline = 'none'; ch.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.04)'; });
      b.style.outline = '3px solid rgba(0,0,0,0.06)'; b.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    };
    colorGrid.appendChild(b);
  });
  // if editing, mark the existing door color visually
  if (mb.dataset.doorTheme) { Array.from(colorGrid.children).forEach(ch => { if (ch.style.background === mb.dataset.doorTheme) { ch.style.outline = '3px solid rgba(0,0,0,0.06)'; ch.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; } }); }

  // file input
  const photoInput = document.createElement('input'); photoInput.type = 'file'; photoInput.accept = 'image/*'; photoInput.style.display = 'none'; photoInput.onchange = async (ev) => { const f = ev.target.files[0]; if (!f) return; try { const data = await fileToDataURL(f); previewImg.src = data; mb.querySelector('#previewCaption').textContent = 'Uploaded'; previewImg.dataset.uploaded = '1'; mb.dataset.photoSource = 'upload'; } catch (e) { console.warn(e); } };
  mb.appendChild(photoInput);
  choosePhotoBtn.onclick = () => photoInput.click();
  clearPhotoBtn.onclick = () => {
    previewImg.dataset.uploaded = ''; mb.dataset.photoSource = 'avatar'; // reset to default avatar
    try { previewImg.src = createEmojiAvatar('🦄', '#fff2fb'); mb.querySelector('#previewCaption').textContent = 'Random'; } catch (e) { previewImg.src = ''; mb.querySelector('#previewCaption').textContent = 'Random'; }
  };
  // make avatar list toggle explicit and reflect aria state
  openAvatarListBtn.setAttribute('aria-expanded', 'true');
  openAvatarListBtn.onclick = () => {
    const show = avatarList.style.display === 'none';
    avatarList.style.display = show ? 'grid' : 'none';
    openAvatarListBtn.setAttribute('aria-expanded', String(show));
    if (show) { setTimeout(() => { try { const first = avatarList.querySelector('button[data-avatar]'); if (first) try { safeFocusEl(first); } catch (e) { } } catch (e) { } }, 20); }
  };

  // gender buttons: toggle selection and store on modal
  const genderBtns = mb.querySelectorAll('.gender-btn');
  genderBtns.forEach(gb => {
    gb.addEventListener('click', (ev) => {
      const val = gb.dataset.gender || 'other';
      mb.dataset.gender = val;
      genderBtns.forEach(x => { x.style.borderColor = '#ddd'; x.style.background = '#fff'; });
      gb.style.borderColor = '#7b46ff'; gb.style.background = '#f6f0ff';
    });
  });
  // default gender selection when creating a new student
  if (!mb.dataset.gender) { mb.dataset.gender = 'other'; Array.from(genderBtns).forEach(x => { x.style.borderColor = '#ddd'; x.style.background = '#fff'; if (x.dataset.gender === 'other') { x.style.borderColor = '#7b46ff'; x.style.background = '#f6f0ff'; } }); }

  // populate if editing
  if (existing) {
    mb.querySelector('#stuName').value = existing.name || '';
    // set preview from photo or avatar
    if (existing.photo && typeof existing.photo === 'string' && existing.photo.indexOf('ref:') === 0) { const d = getPhotoDataById(existing.photo.slice(4)); if (d) previewImg.src = d; }
    else if (existing.photo) previewImg.src = existing.photo;
    mb.dataset.doorTheme = existing.doorTheme || '#ffd1f0';
    // restore gender selection visually
    if (existing.gender) { mb.dataset.gender = existing.gender; genderBtns.forEach(x => { x.style.borderColor = '#ddd'; x.style.background = '#fff'; if (x.dataset.gender === existing.gender) { x.style.borderColor = '#7b46ff'; x.style.background = '#f6f0ff'; } }); }
  } else {
    previewImg.src = createEmojiAvatar('🦄', '#fff2fb');
    mb.dataset.doorTheme = '#ffd1f0';
  }

  attachModalBehavior(mb, '#stuName');
  mb.querySelector('#stuCancel').onclick = () => closeModal(mb);
  mb.querySelector('#stuSave').onclick = async () => {
    const name = mb.querySelector('#stuName').value.trim(); if (!name) { showFieldError(mb, '#stuName', 'Enter name'); return; }
    const tot = 0;
    let photoRef = null;
    if (previewImg.dataset.uploaded) { // uploaded dataURL
      const data = previewImg.src;
      // Persist to the photo store (async upload will be attempted), but store
      // the actual data URL on the student snapshot so the UI updates immediately.
      try { const pid = storePhotoData(data); } catch (e) { /* ignore */ }
      photoRef = data;
    } else if (previewImg.src && previewImg.src.indexOf('data:image') === 0) { // avatar data URI
      photoRef = previewImg.src;
    }
    const doorTheme = mb.dataset.doorTheme || '#ffd1f0';
    const chosenGender = mb.dataset.gender || 'other';
    if (existing) { existing.name = name; existing.photo = photoRef || existing.photo; existing.doorTheme = doorTheme; existing.gender = chosenGender; }
    else { const st = { id: 's-' + Math.random().toString(36).slice(2), name, gender: chosenGender, doorTheme, photo: photoRef, total: tot, history: [] }; snap.students = snap.students || []; snap.students.push(st); }
    try { await saveClassroom(classId, snap); } catch (e) { console.warn('save student failed', e); }
    closeModal(mb); openClass(classId);
  };
}

function openTasksModal(classId) {
  const snap = loadClassroom(classId) || { tasks: [] };
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  // simplified tasks modal: two columns (Positive / Needs work)
  mb.innerHTML = `<div class='modal' style='max-width:920px;overflow:auto'><h3 style='margin-top:0'>Class Tasks</h3>
        <div style='display:flex;justify-content:space-between;align-items:center'><div style='font-weight:800'>Positive</div><div style='font-weight:800;color:#666'>Needs work</div></div>
        <div style='display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px'>
          <div id='posCol'></div>
          <div id='negCol'></div>
        </div>
        <div style='margin-top:12px;text-align:center'><button id='addTaskBtn' class='action-btn'>＋ Add / Edit Tasks</button></div>
      </div>`;
  document.body.appendChild(mb);
  const posCol = mb.querySelector('#posCol'); const negCol = mb.querySelector('#negCol');

  function renderSkillsGrid() {
    posCol.innerHTML = '';
    negCol.innerHTML = '';
    const tasks = (snap.tasks && snap.tasks.length) ? snap.tasks : [{ label: 'Good Behavior', points: 2 }, { label: 'Homework', points: 3 }, { label: 'Participation', points: 1 }, { label: 'Needs Improvement: Focus', points: -1 }, { label: 'Needs Improvement: Listening', points: -2 }];
    // split positive and negative
    const pos = tasks.filter(t => (t.points || 0) >= 0);
    const neg = tasks.filter(t => (t.points || 0) < 0);

    function makeTile(t, i, isNeg) {
      const tile = document.createElement('div'); tile.style.padding = '14px'; tile.style.borderRadius = '12px'; tile.style.background = isNeg ? '#fff2f2' : '#f7f9fc'; tile.style.textAlign = 'center'; tile.style.position = 'relative'; tile.style.cursor = 'pointer';
      tile.tabIndex = 0; tile.setAttribute('role', 'button'); tile.setAttribute('aria-label', (t.points > 0 ? '+' + t.points : String(t.points)) + ' ' + t.label);
      const icon = ['🤖', '📝', '🏅', '🧠', '🎤', '🤝'][i % 6];
      tile.innerHTML = `<div style='font-size:28px'>${icon}</div><div style='margin-top:10px;font-weight:800'>${t.label}</div><div style='position:absolute;right:12px;top:10px;font-weight:800;color:${isNeg ? '#d23' : '#27a844'}'>${t.points > 0 ? '+' + t.points : String(t.points)}</div>`;
      tile.addEventListener('click', () => openTaskGiveModal(classId, t));
      tile.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tile.click(); } });
      return tile;
    }

    pos.forEach((t, i) => posCol.appendChild(makeTile(t, i, false)));
    neg.forEach((t, i) => negCol.appendChild(makeTile(t, i, true)));
    // (Remove inline Add tile here — the modal already provides a prominent bottom Add/Edit button.)
  }

  renderSkillsGrid();

  mb.querySelector('#addTaskBtn').addEventListener('click', () => { closeModal(mb); openClassTasksEditor(classId); });
  mb.addEventListener('click', (ev) => { if (ev.target === mb) try { closeModal(mb); } catch (e) { try { mb.remove(); } catch (_) { } } });
}

// Optimized Reward Modal with instant feedback and beautiful UI
async function openRewardModal(classId, studentId) {
  let snap = loadClassroom(classId);
  if (!snap) {
    try { 
      showToast('Loading class…', { type: 'default' }); 
      snap = await ensureClassLoaded(classId); 
    } catch (e) { }
    if (!snap) { 
      showToast('Failed to load class', { type: 'error' }); 
      return; 
    }
  }
  
  // Get student info
  const student = (snap.students || []).find(x => x.id === studentId);
  if (!student) { 
    showToast('Student not found', { type: 'error' }); 
    return; 
  }
  
  // Create modern modal
  const modalHTML = `
    <div class="reward-modal-container">
      <div class="reward-modal">
        <button class="modal-close" aria-label="Close modal">✕</button>
        <div class="modal-header">
          <h2 class="modal-title">✨ Award Points to ${student.name}</h2>
          <p class="modal-subtitle">Current points: <span class="current-points">${student.total || 0}</span></p>
        </div>
        
        <div class="search-container">
          <input type="text" class="search-input" placeholder="Search tasks..." id="taskSearch">
        </div>
        
        <div class="tasks-grid" id="tasksGrid">
          <!-- Tasks will be populated here -->
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modalContainer = document.querySelector('.reward-modal-container');
  const tasksGrid = document.getElementById('tasksGrid');
  const searchInput = document.getElementById('taskSearch');
  
  // Close modal function
  const closeModal = () => {
    modalContainer.style.opacity = '0';
    setTimeout(() => {
      if (modalContainer.parentNode) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    }, 300);
  };
  
  // Close button handler
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  
  // Close on outside click
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
  
  // Render tasks
  const renderTasks = (tasks) => {
    if (!tasks || tasks.length === 0) {
      tasksGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
          <p style="font-size: 1.2rem; margin-bottom: 16px;">No tasks available</p>
          <p style="color: #999;">Create tasks first to award points to students</p>
        </div>
      `;
      return;
    }
    
    tasksGrid.innerHTML = tasks.map((task, idx) => {
      const isPositive = (task.points || 0) > 0;
      const pointsDisplay = isPositive ? `+${Math.abs(task.points || 1)}` : String(task.points || -1);
      const emoji = isPositive ? '✨' : '⚠️';
      
      return `
        <div class="reward-card ${isPositive ? 'positive-card' : 'negative-card'}" data-idx="${idx}">
          <div class="reward-emoji">${emoji}</div>
          <div class="reward-label">${task.label}</div>
          <div class="reward-points ${isPositive ? 'positive-points' : 'negative-points'}">
            ${pointsDisplay}
          </div>
        </div>
      `;
    }).join('');
    
    // Add click handlers to all cards
    tasksGrid.querySelectorAll('.reward-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = Number(card.dataset.idx);
        const task = snap.tasks[idx];
        const points = task.points || 1;
        
        // INSTANT UI UPDATE - no waiting for server!
        const currentPoints = student.total || 0;
        student.total = currentPoints + points;
        
        // Update the student's card in the main view immediately
        const studentCard = document.querySelector(`.child-card[data-student-id="${studentId}"]`);
        if (studentCard) {
          const pointsDisplay = studentCard.querySelector('.points-display');
          if (pointsDisplay) {
            pointsDisplay.textContent = student.total;
            pointsDisplay.classList.add('points-updated');
            
            // Remove the animation class after animation completes
            setTimeout(() => {
              pointsDisplay.classList.remove('points-updated');
            }, 500);
          }
          
          // Show mailbox animation
          const mailbox = studentCard.querySelector('.mailbox');
          if (mailbox) {
            showMailboxCard(mailbox, points);
          }
        }
        
        // Show toast notification immediately
        showToast(`+${points} points awarded to ${student.name}!`, { type: 'success' });
        
        // Add to history immediately
        student.history = student.history || [];
        student.history.push({ 
          task: task.label || 'Task', 
          points: points, 
          ts: Date.now() 
        });
        
        // Save in background - don't wait for this
        saveClassroomInBackground(classId, snap);
        
        // Close modal immediately after selection
        closeModal();
      });
    });
  };
  
  // Search functionality
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    if (!searchTerm) {
      renderTasks(snap.tasks);
      return;
    }
    
    const filteredTasks = (snap.tasks || []).filter(task => 
      task.label.toLowerCase().includes(searchTerm)
    );
    
    renderTasks(filteredTasks);
  });
  
  // Initial render
  renderTasks(snap.tasks);
}

// Background save function that doesn't block UI
function saveClassroomInBackground(classId, snapshot) {
  // Save immediately to local storage for fast UI updates
  try {
    localStorage.setItem(classroomKey(classId), JSON.stringify(snapshot));
  } catch (e) {
    console.warn('Local save failed:', e);
  }
  
  // Save to Supabase in background
  setTimeout(async () => {
    try {
      await saveClassroom(classId, snapshot);
    } catch (error) {
      console.warn('Background save failed:', error);
      // Don't show toast here - we already gave immediate feedback to user
    }
  }, 100);
}

// Optimized Redeem Modal
async function openRedeemModal(classId) {
  let snap = loadClassroom(classId);
  if (!snap) {
    try { 
      showToast('Loading class…', { type: 'default' }); 
      snap = await ensureClassLoaded(classId); 
    } catch (e) { }
    if (!snap) { 
      showToast('Failed to load class', { type: 'error' }); 
      return; 
    }
  }
  
  // Create modern modal
  const modalHTML = `
    <div class="reward-modal-container">
      <div class="reward-modal">
        <button class="modal-close" aria-label="Close modal">✕</button>
        <div class="modal-header">
          <h2 class="modal-title">🎁 Redeem Points</h2>
          <p class="modal-subtitle">Select a student and choose items to redeem</p>
        </div>
        
        <div class="student-select-container">
          <select class="student-select" id="redeemStudentSelect">
            <option value="">Select a student...</option>
            ${(snap.students || []).map(student => `
              <option value="${student.id}">
                ${student.name} (${student.total || 0} pts)
              </option>
            `).join('')}
          </select>
        </div>
        
        <div class="tasks-grid" id="redeemTasksGrid">
          <!-- Redeem items will be populated here -->
        </div>
        
        <div style="padding: 0 24px 24px;">
          <div style="background: #fff8e1; border-radius: 16px; padding: 16px; margin-top: 16px; border: 2px solid #ffecb3;">
            <p style="font-weight: 600; color: #854d0e; margin-bottom: 8px;">Custom redeem</p>
            <div style="display: flex; gap: 12px;">
              <input type="number" id="customRedeemPoints" placeholder="Points to redeem" 
                     style="flex: 1; padding: 12px 16px; border-radius: 12px; border: 2px solid #ffecb3; font-size: 1rem;">
              <button id="customRedeemBtn" class="action-btn" 
                      style="background: linear-gradient(135deg, #ff9a44, #ff6b6b); color: white; padding: 12px 20px; border-radius: 12px; font-weight: 700;">
                Redeem
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  const modalContainer = document.querySelector('.reward-modal-container');
  const tasksGrid = document.getElementById('redeemTasksGrid');
  const studentSelect = document.getElementById('redeemStudentSelect');
  const customRedeemBtn = document.getElementById('customRedeemBtn');
  const customPointsInput = document.getElementById('customRedeemPoints');
  
  // Close modal function
  const closeModal = () => {
    modalContainer.style.opacity = '0';
    setTimeout(() => {
      if (modalContainer.parentNode) {
        modalContainer.parentNode.removeChild(modalContainer);
      }
    }, 300);
  };
  
  // Close button handler
  document.querySelector('.modal-close').addEventListener('click', closeModal);
  
  // Close on outside click
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeModal();
    }
  });
  
  // Render redeem tasks
  const renderRedeemTasks = (studentId = null) => {
    if (!snap.tasks || snap.tasks.length === 0) {
      tasksGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
          <p style="font-size: 1.2rem; margin-bottom: 16px;">No redeemable items</p>
          <p style="color: #999;">Create tasks first to redeem points</p>
        </div>
      `;
      return;
    }
    
    tasksGrid.innerHTML = snap.tasks.map((task, idx) => {
      const points = Math.abs(task.points || 1);
      const isRedeemable = studentId ? ((snap.students.find(s => s.id === studentId)?.total || 0) >= points) : true;
      
      return `
        <div class="reward-card ${isRedeemable ? 'positive-card' : 'negative-card'}" 
             data-idx="${idx}" 
             ${!isRedeemable ? 'style="opacity: 0.6; cursor: not-allowed;"' : ''}>
          <div class="reward-emoji">🎫</div>
          <div class="reward-label">${task.label}</div>
          <div class="reward-points ${isRedeemable ? 'positive-points' : 'negative-points'}">
            -${points}
          </div>
          ${!isRedeemable ? '<div style="position: absolute; bottom: 8px; left: 0; right: 0; color: #dc2626; font-size: 0.8rem; font-weight: 600;">Not enough points</div>' : ''}
        </div>
      `;
    }).join('');
    
    // Add click handlers to all cards
    tasksGrid.querySelectorAll('.reward-card').forEach(card => {
      const idx = Number(card.dataset.idx);
      const task = snap.tasks[idx];
      const points = Math.abs(task.points || 1);
      
      card.addEventListener('click', () => {
        const studentId = studentSelect.value;
        if (!studentId) {
          showToast('Please select a student first', { type: 'warning' });
          return;
        }
        
        const student = snap.students.find(s => s.id === studentId);
        if (!student) {
          showToast('Student not found', { type: 'error' });
          return;
        }
        
        if ((student.total || 0) < points) {
          showToast(`${student.name} doesn't have enough points for this item!`, { type: 'error' });
          return;
        }
        
        // INSTANT UI UPDATE
        const currentPoints = student.total || 0;
        student.total = currentPoints - points;
        
        // Update the student's card in the main view immediately
        const studentCard = document.querySelector(`.child-card[data-student-id="${studentId}"]`);
        if (studentCard) {
          const pointsDisplay = studentCard.querySelector('.points-display');
          if (pointsDisplay) {
            pointsDisplay.textContent = student.total;
            pointsDisplay.classList.add('points-updated');
            
            setTimeout(() => {
              pointsDisplay.classList.remove('points-updated');
            }, 500);
          }
        }
        
        // Show toast notification immediately
        showToast(`-${points} points redeemed from ${student.name}!`, { type: 'success' });
        
        // Add to history immediately
        student.history = student.history || [];
        student.history.push({ 
          task: `Redeem: ${task.label || 'Item'}`, 
          points: -points, 
          ts: Date.now() 
        });
        
        // Save in background
        saveClassroomInBackground(classId, snap);
        
        // Update the UI for this student
        renderRedeemTasks(studentId);
      });
    });
  };
  
  // Student selection handler
  studentSelect.addEventListener('change', (e) => {
    const studentId = e.target.value;
    renderRedeemTasks(studentId);
    
    if (studentId) {
      const student = snap.students.find(s => s.id === studentId);
      if (student) {
        document.querySelector('.modal-subtitle').textContent = 
          `${student.name} has ${student.total || 0} points available`;
      }
    }
  });
  
  // Custom redeem handler
  customRedeemBtn.addEventListener('click', () => {
    const studentId = studentSelect.value;
    if (!studentId) {
      showToast('Please select a student first', { type: 'warning' });
      return;
    }
    
    const points = parseInt(customPointsInput.value);
    if (!points || points <= 0) {
      showToast('Please enter a valid number of points to redeem', { type: 'warning' });
      return;
    }
    
    const student = snap.students.find(s => s.id === studentId);
    if (!student) {
      showToast('Student not found', { type: 'error' });
      return;
    }
    
    if ((student.total || 0) < points) {
      showToast(`${student.name} doesn't have enough points!`, { type: 'error' });
      return;
    }
    
    // INSTANT UI UPDATE
    student.total = (student.total || 0) - points;
    
    // Update main view immediately
    const studentCard = document.querySelector(`.child-card[data-student-id="${studentId}"]`);
    if (studentCard) {
      const pointsDisplay = studentCard.querySelector('.points-display');
      if (pointsDisplay) {
        pointsDisplay.textContent = student.total;
        pointsDisplay.classList.add('points-updated');
        
        setTimeout(() => {
          pointsDisplay.classList.remove('points-updated');
        }, 500);
      }
    }
    
    // Show toast
    showToast(`-${points} points redeemed from ${student.name}!`, { type: 'success' });
    
    // Add to history
    student.history = student.history || [];
    student.history.push({ 
      task: `Custom redeem: ${points} points`, 
      points: -points, 
      ts: Date.now() 
    });
    
    // Save in background
    saveClassroomInBackground(classId, snap);
    
    // Update UI
    renderRedeemTasks(studentId);
    customPointsInput.value = '';
  });
  
  // Initial render
  renderRedeemTasks();
}
function showToast(message, options = {}) {
  // Remove existing toasts
  document.querySelectorAll('.toast-notification').forEach(t => t.remove());
  
  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${options.type || 'default'}`;
  toast.textContent = message;
  
  // Set color based on type
  let bgColor, textColor;
  switch(options.type) {
    case 'success':
      bgColor = 'linear-gradient(135deg, #10b981, #059669)';
      textColor = 'white';
      break;
    case 'error':
      bgColor = 'linear-gradient(135deg, #ef4444, #dc2626)';
      textColor = 'white';
      break;
    case 'warning':
      bgColor = 'linear-gradient(135deg, #f59e0b, #d97706)';
      textColor = 'white';
      break;
    default:
      bgColor = 'linear-gradient(135deg, #7b4cff, #6d28d9)';
      textColor = 'white';
  }
  
  toast.style.cssText = `
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 16px 24px;
    border-radius: 16px;
    color: ${textColor};
    background: ${bgColor};
    font-weight: 700;
    font-size: 1.1rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    z-index: 2000;
    transform: translateX(120%);
    transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.4s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
    toast.style.opacity = '1';
  }, 10);
  
  // Auto-remove after duration
  setTimeout(() => {
    toast.style.transform = 'translateX(120%)';
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 400);
  }, options.duration || 3000);
}
// // Enhanced toast notification function
// function showToast(message, options = {}) {
//   const toast = document.createElement('div');
//   toast.className = `toast-notification toast-${options.type || 'default'}`;
//   toast.textContent = message;
  
//   document.body.appendChild(toast);
  
//   // Remove after animation completes
//   setTimeout(() => {
//     if (toast.parentNode) {
//       toast.parentNode.removeChild(toast);
//     }
//   }, 3000);
// }

// Student Manager Modal - modern UI to edit name, avatar (reuses Add Student modal), reset points, delete
async function openStudentManagerModal(classId) {
  let snap = loadClassroom(classId);
  if (!snap) {
    try { showToast('Loading class…', { type: 'default' }); snap = await ensureClassLoaded(classId); } catch (e) { }
    if (!snap) { showToast('Failed to load class', { type: 'error' }); return; }
  }
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  const header = `<div style='display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px'>
          <div id='mgrHeaderTitle' style='font-weight:900;font-size:18px'>Manage Students — ${snap.__classroomName || 'Class'}</div>
          <div style='display:flex;gap:8px;align-items:center'>
            <button id='editClassNameBtn' class='small-btn' style='padding:10px 14px;min-width:120px;'>Edit Class</button>
            <div id='editInlineWrap' style='display:none;align-items:center;gap:8px;margin-right:8px'></div>
            <input id='stuSearch' placeholder='Search students...' style='padding:8px;border-radius:10px;border:1px solid #e6e9ef' />
            
          </div>
        </div>`;
  mb.innerHTML = `<div class='modal' style='max-width:920px;width:94%;max-height:86vh;overflow:auto'>${header}<div id='mgrArea' style='display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px'></div><div style='margin-top:12px;text-align:right'><button id='mgrDone' class='small-btn'>Done</button></div></div>`;
  document.body.appendChild(mb);
  // wire Edit Class Name inline editor
  const editClassBtn = mb.querySelector('#editClassNameBtn');
  const editInlineWrap = mb.querySelector('#editInlineWrap');
  if (editClassBtn && editInlineWrap) {
    editClassBtn.addEventListener('click', () => {
      // toggle inline editor visibility
      if (editInlineWrap.dataset.open === '1') {
        // already open: focus the input
        const inp = editInlineWrap.querySelector('input'); if (inp) try { safeFocusEl(inp); } catch (e) { }; return;
      }
      editInlineWrap.innerHTML = '';
      const cur = snap.__classroomName || '';
      const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'editClassNameInput'; inp.value = cur; inp.style.cssText = 'padding:8px;border-radius:8px;border:1px solid #e6e9ef;width:220px';
      const save = document.createElement('button'); save.id = 'editClassNameSave'; save.className = 'small-btn'; save.textContent = 'Save'; save.style.padding = '8px 10px'; save.style.minWidth = '72px';
      const cancel = document.createElement('button'); cancel.id = 'editClassNameCancel'; cancel.className = 'btn-muted'; cancel.textContent = 'Cancel'; cancel.style.padding = '8px 10px';
      try { editInlineWrap.appendChild(inp); editInlineWrap.appendChild(save); editInlineWrap.appendChild(cancel); editInlineWrap.style.display = 'flex'; editInlineWrap.dataset.open = '1'; } catch (e) { }
      try { inp.setAttribute('data-gramm', 'false'); inp.setAttribute('data-gramm_editor', 'false'); inp.setAttribute('data-enable-grammarly', 'false'); inp.setAttribute('spellcheck', 'false'); inp.setAttribute('autocomplete', 'off'); inp.setAttribute('autocorrect', 'off'); inp.setAttribute('autocapitalize', 'off'); } catch (e) { }
      try { safeFocusEl(inp); } catch (e) { }

      function closeEditor() { editInlineWrap.innerHTML = ''; editInlineWrap.style.display = 'none'; editInlineWrap.dataset.open = '0'; }

      cancel.addEventListener('click', () => { closeEditor(); });
      inp.addEventListener('keydown', (e) => { if (e.key === 'Escape') { e.preventDefault(); closeEditor(); } if (e.key === 'Enter') { e.preventDefault(); save.click(); } });

      save.addEventListener('click', () => {
        const newName = (inp.value || '').trim(); if (!newName) { showInlineInputError(inp, 'Enter a class name'); return; }
        const existing = listClassrooms().find(c => c.name && c.name.toLowerCase() === newName.toLowerCase());
        if (existing && existing.id !== classId) { showInlineInputError(inp, 'A class with that name already exists.'); return; }
        snap.__classroomName = newName;
        saveClassroom(classId, snap);
        const hdr = mb.querySelector('#mgrHeaderTitle'); if (hdr) hdr.textContent = 'Manage Students — ' + newName;
        renderSidebar();
        try { if (selectedClassId === classId) { classTitleMeta.textContent = newName; classCounts.textContent = `${(snap.students || []).length} students · ${(snap.tasks || []).length} tasks`; } } catch (e) { }
        closeEditor();
      });
    });
  }
  const area = mb.querySelector('#mgrArea');

  function render() {
    area.innerHTML = '';
    (snap.students || []).forEach((s, idx) => {
      const card = document.createElement('div');
      card.style.cssText = 'background:#fff;border-radius:12px;padding:12px;box-shadow:0 10px 30px rgba(20,30,80,0.04);display:flex;gap:12px;position:relative;align-items:center';

      // left actions column
      const actionsCol = document.createElement('div'); actionsCol.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:flex-start;min-width:84px';
      const edit = document.createElement('button'); edit.className = 'small-btn'; edit.textContent = 'Edit'; edit.style.width = '72px';
      const reset = document.createElement('button'); reset.className = 'small-btn'; reset.textContent = 'Reset'; reset.style.width = '72px'; reset.style.background = 'linear-gradient(135deg,#f0f2f8,#e6e9ef)'; reset.style.color = '#222'; reset.style.fontWeight = '800';
      const del = document.createElement('button'); del.className = 'small-btn'; del.textContent = 'Delete'; del.style.width = '72px'; del.style.background = 'linear-gradient(135deg,#ff6b6b,#ff4b4b)';
      actionsCol.appendChild(edit); actionsCol.appendChild(reset); actionsCol.appendChild(del);

      // right content column
      const content = document.createElement('div'); content.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex:1;gap:8px';
      const img = document.createElement('img'); img.src = (s.photo && typeof s.photo === 'string' && s.photo.indexOf('ref:') === 0) ? (getPhotoDataById(s.photo.slice(4)) || '') : (s.photo || ''); img.alt = s.name; img.style.cssText = 'width:84px;height:84px;border-radius:12px;object-fit:cover;box-shadow:0 8px 20px rgba(0,0,0,0.08)';
      const name = document.createElement('div'); name.textContent = s.name; name.className = 'mgr-stu-name'; name.style.fontWeight = '800'; name.style.fontSize = '15px';
      const pts = document.createElement('div'); pts.textContent = (s.total || 0) + ' pts'; pts.style.color = '#666'; pts.style.fontWeight = '700';

      // wire actions
      edit.onclick = () => { closeModal(mb); openAddStudentModal(classId, s.id); };
      reset.onclick = () => { openConfirm('Reset points for ' + s.name + ' to 0?', { confirmLabel: 'Reset', cancelLabel: 'Cancel' }).then(ok => { if (!ok) return; s.total = 0; saveClassroom(classId, snap); render(); try { openClass(classId); } catch (e) { } }); };
      del.onclick = () => { openConfirm('Delete ' + s.name + '? This cannot be undone.', { confirmLabel: 'Delete', cancelLabel: 'Cancel' }).then(ok => { if (!ok) return; snap.students.splice(idx, 1); saveClassroom(classId, snap); render(); try { openClass(classId); } catch (e) { } }); };

      content.appendChild(img); content.appendChild(name); content.appendChild(pts);
      card.appendChild(actionsCol); card.appendChild(content);
      area.appendChild(card);
    });
  }

  // search filter
  const search = mb.querySelector('#stuSearch');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase(); Array.from(area.children).forEach(c => { const nameEl = c.querySelector('.mgr-stu-name'); const n = nameEl ? nameEl.textContent.toLowerCase() : ''; c.style.display = n.indexOf(q) === -1 ? 'none' : ''; });
  });

  try {
    const _ensureX = () => {
      const dialog = mb.querySelector('.modal');
      let x = dialog && dialog.querySelector('.modal-close-x');
      if (!x) {
        x = document.createElement('button'); x.type = 'button'; x.className = 'modal-close-x'; x.setAttribute('aria-label', 'Close');
        const icon = (mb && mb.dataset && mb.dataset.closeIcon) ? mb.dataset.closeIcon : ((mb && mb.dataset && mb.dataset.closeLabel) ? mb.dataset.closeLabel : '✕');
        x.innerHTML = icon;
        if (dialog) dialog.appendChild(x);
        if (dialog) setTimeout(() => dialog.classList.add('modal-open'), 10);
      }
      return x;
    };
    const mX = _ensureX(); mX.addEventListener('click', () => closeModal(mb));
    const oldMgr = mb.querySelector('#closeMgr'); if (oldMgr) oldMgr.remove();
  } catch (e) { }
  mb.querySelector('#mgrDone').onclick = () => closeModal(mb);
  attachModalBehavior(mb, '#stuSearch');
  render();
}

// Combined Add / Edit Tasks modal: left = add task form, right = manager list
async function openAddEditTasksModal(classId) {
  let snap = loadClassroom(classId) || { tasks: [] };
  if (!snap || !snap.tasks) { try { const fetched = await ensureClassLoaded(classId); if (fetched) snap = fetched; } catch (e) { } }
  let editingIdx = null;
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  mb.innerHTML = `<div class='modal' style='width:min(860px,96vw);max-height:90vh;overflow:auto;'>
        <div style='display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px'>
          <div id='tasks_tabs' class='ae-tabs' role='tablist' aria-label='Add or manage tasks'>
            <button role='tab' id='tab_addtask' class='ae-tab' aria-selected='true'>Add Tasks</button>
            <button role='tab' id='tab_edittask' class='ae-tab' aria-selected='false'>Edit Tasks</button>
            <button role='tab' id='tab_importtask' class='ae-tab' aria-selected='false'>Import Tasks</button>
          </div>
          <div style='display:flex;align-items:center'></div>
        </div>
        <div id='tasks_container' style='display:grid;grid-template-columns:1fr;gap:16px;align-items:start'>
          <div id='task_left' style='background:transparent'>
            <h3 style='margin-top:0'>Add Task</h3>
            <div style='display:flex;gap:8px;margin-bottom:8px;align-items:center'>
              <input id='tLabel' placeholder='Label' style='flex:1;padding:10px;border-radius:10px;border:1px solid #e6e9ef'/>
              <input id='tPoints' placeholder='Points' type='number' style='width:120px;padding:10px;border-radius:10px;border:1px solid #e6e9ef' />
            </div>
            <div style='display:flex;gap:8px;align-items:center;margin-bottom:8px'>
              <select id='tCategory' style='padding:10px;border-radius:10px;border:1px solid #e6e9ef'>
                <option value='positive'>Positive</option>
                <option value='needs'>Needs work</option>
              </select>
              <div style='flex:1;color:#666;font-size:13px'>Create a task that teachers can award to students.</div>
            </div>
            <div class='actions' style='margin-top:12px'>
              <button id='tCancel' class='btn-muted'>Cancel</button>
              <button id='tSave' class='action-btn'>Add Task</button>
            </div>
          </div>

          <div id='task_right' style='display:none;background:#fff;border-radius:10px;padding:14px;box-shadow:0 10px 30px rgba(20,30,80,0.04);max-height:72vh;overflow:auto'>
            <div id='mgr_pane'>
              <h3 style='margin-top:0;margin-bottom:8px'>Tasks</h3>
              <div id='task_mgr' style='display:grid;gap:10px'></div>
            </div>
            <div id='import_pane' style='display:none'>
              <!-- importPreview header removed per user request -->
              <div style='display:flex;gap:8px;align-items:center;margin-bottom:10px'>
                <label style='font-weight:700'>From class:</label>
                <select id='importClassSelect' class='modern-select' style='flex:1;padding:8px;border-radius:8px;border:1px solid #e6e9ef'></select>
                <button id='importAllBtn' class='action-btn' style='padding:8px 12px;border-radius:10px'>Import all</button>
              </div>
              <div id='importTaskArea' style='display:grid;gap:10px;max-height:52vh;overflow:auto'></div>
              <div style='display:flex;justify-content:space-between;gap:8px;margin-top:10px'>
                <div><!-- removed: Choose another class button -->
                </div>
                <div style='display:flex;gap:8px'><button id='importCancel' class='btn-muted'>Cancel</button></div>
              </div>
            </div>
          </div>
        </div>
      </div>`;
  document.body.appendChild(mb);

  const tabAdd = mb.querySelector('#tab_addtask');
  const tabEdit = mb.querySelector('#tab_edittask');
  const left = mb.querySelector('#task_left');
  const right = mb.querySelector('#task_right');
  const container = mb.querySelector('#tasks_container');

  function setMode(mode) { mb.dataset.mode = mode || 'add'; if (mode === 'edit') { left.style.display = 'none'; right.style.display = 'block'; tabEdit.setAttribute('aria-selected', 'true'); tabAdd.setAttribute('aria-selected', 'false'); } else { left.style.display = 'block'; right.style.display = 'none'; tabAdd.setAttribute('aria-selected', 'true'); tabEdit.setAttribute('aria-selected', 'false'); } }
  setMode('add');
  tabAdd.addEventListener('click', () => { setMode('add'); try { safeFocusEl(mb.querySelector('#tLabel')); } catch (e) { } });
  tabEdit.addEventListener('click', () => { setMode('edit'); try { safeFocusEl(mb.querySelector('#task_mgr')); } catch (e) { } renderMgr(); });

  const lbl = mb.querySelector('#tLabel'); const pts = mb.querySelector('#tPoints'); const cat = mb.querySelector('#tCategory'); const mgr = mb.querySelector('#task_mgr');
  function renderMgr() {
    mgr.innerHTML = ''; (snap.tasks || []).forEach((t, i) => {
      const row = document.createElement('div'); row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:10px;background:#fff;border:1px solid #f0f0f0';
      const leftc = document.createElement('div'); const title = document.createElement('div'); title.style.fontWeight = '800'; title.textContent = t.label; const meta = document.createElement('div'); meta.style.fontSize = '13px'; meta.style.color = '#666'; meta.textContent = (t.points > 0 ? ('+' + t.points) : String(t.points)) + ' · ' + ((t.points || 0) < 0 ? 'Needs work' : 'Positive'); leftc.appendChild(title); leftc.appendChild(meta);
      const actions = document.createElement('div'); actions.style.display = 'flex'; actions.style.gap = '8px'; const edit = document.createElement('button'); edit.className = 'small-btn'; edit.textContent = 'Edit'; const del = document.createElement('button'); del.className = 'small-btn'; del.style.background = 'linear-gradient(135deg,#ff6b6b,#ff4b4b)'; del.textContent = 'Delete';
      edit.onclick = () => { setMode('add'); editingIdx = i; lbl.value = t.label; pts.value = Math.abs(t.points || 0); cat.value = (t.points || 0) < 0 ? 'needs' : 'positive'; mb.querySelector('#tSave').textContent = 'Save'; try { safeFocusEl(lbl); } catch (e) { } };
      del.onclick = () => { openConfirm('Delete task "' + t.label + '"?').then(ok => { if (!ok) return; snap.tasks.splice(i, 1); saveClassroom(classId, snap); renderMgr(); }); };
      actions.appendChild(edit); actions.appendChild(del); row.appendChild(leftc); row.appendChild(actions); mgr.appendChild(row);
    });
  }

  mb.querySelector('#tCancel').onclick = () => closeModal(mb);
  mb.querySelector('#tSave').onclick = () => {
    const v = (lbl.value || '').trim(); if (!v) { showFieldError(mb, '#tLabel', 'Enter label'); return; }
    const pRaw = pts.value === '' ? 0 : Math.abs(parseInt(pts.value, 10) || 0); const category = cat.value || 'positive'; const p = category === 'needs' ? -Math.abs(pRaw) : Math.abs(pRaw);
    snap.tasks = snap.tasks || [];
    if (editingIdx !== null && typeof editingIdx !== 'undefined') { snap.tasks[editingIdx].label = v; snap.tasks[editingIdx].points = p; }
    else { snap.tasks.push({ id: 't-' + Math.random().toString(36).slice(2), label: v, points: p }); }
    saveClassroom(classId, snap); closeModal(mb); openClass(classId);
  };

  // --- Import Tasks functionality ---
  const importSelect = mb.querySelector('#importClassSelect');
  const importTaskArea = mb.querySelector('#importTaskArea');
  const mgrPane = mb.querySelector('#mgr_pane');
  const importPane = mb.querySelector('#import_pane');

  function refreshImportList() {
    try {
      importSelect.innerHTML = '';
      const classes = listClassrooms().filter(c => c.id !== classId);
      if (!classes.length) { const opt = document.createElement('option'); opt.value = ''; opt.textContent = 'No other classes found'; importSelect.appendChild(opt); return; }
      const placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = 'Select a class to preview tasks'; importSelect.appendChild(placeholder);
      classes.forEach(c => { const opt = document.createElement('option'); opt.value = c.id; opt.textContent = c.name + ' — ' + (c.tasks || 0) + ' tasks'; importSelect.appendChild(opt); });
    } catch (e) { console.warn('refreshImportList failed', e); }
  }

  async function renderImportTasksFor(classIdToLoad) {
    try {
      importTaskArea.innerHTML = '';
      if (!classIdToLoad) { importTaskArea.innerHTML = `<div style='color:#666;padding:12px;border-radius:8px;background:#fff;border:1px solid #f0f0f0'>Choose a class to see its tasks.</div>`; return; }
      let other = loadClassroom(classIdToLoad);
      if (!other) { try { other = await ensureClassLoaded(classIdToLoad); } catch (e) { other = null; } }
      // populate preview header
      try {
        const pvName = mb.querySelector('#importPreviewName');
        const pvMeta = mb.querySelector('#importPreviewMeta');
        const pvAvatar = mb.querySelector('#importPreviewAvatar');
        if (other) {
          pvName.textContent = other.__classroomName || other.name || ('Class ' + classIdToLoad);
          const studentsCount = (other.students && other.students.length) ? other.students.length : 0;
          const tasksCount = (other.tasks && other.tasks.length) ? other.tasks.length : 0;
          pvMeta.textContent = `${studentsCount} students · ${tasksCount} tasks`;
          // show avatar if possible (first student photo) else hide
          let av = '';
          try { if (other.students && other.students[0] && other.students[0].photo) av = (typeof other.students[0].photo === 'string' && other.students[0].photo.indexOf('ref:') === 0) ? (getPhotoDataById(other.students[0].photo.slice(4)) || '') : other.students[0].photo; } catch (e) { av = ''; }
          if (av) { pvAvatar.src = av; pvAvatar.style.display = ''; } else { pvAvatar.style.display = 'none'; }
        } else {
          if (mb) { const pvName = mb.querySelector('#importPreviewName'); if (pvName) pvName.textContent = 'No preview available'; }
        }
      } catch (e) { }
      if (!other || !other.tasks || !other.tasks.length) { importTaskArea.innerHTML = `<div style='color:#666;padding:12px;border-radius:8px;background:#fff;border:1px solid #f0f0f0'>No tasks found in that class.</div>`; return; }
      (other.tasks || []).forEach((t, idx) => {
        const card = document.createElement('div'); card.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px;border-radius:10px;background:#fff;border:1px solid #f0f0f0';
        const left = document.createElement('div'); const title = document.createElement('div'); title.style.fontWeight = '800'; title.textContent = t.label; const meta = document.createElement('div'); meta.style.fontSize = '12px'; meta.style.color = '#888'; meta.textContent = 'Points: ' + ((t.points > 0) ? ('+' + t.points) : String(t.points)); left.appendChild(title); left.appendChild(meta);
        const right = document.createElement('div'); right.style.display = 'flex'; right.style.gap = '8px'; const imp = document.createElement('button'); imp.className = 'small-btn'; imp.textContent = 'Import';
        imp.onclick = () => {
          try {
            snap.tasks = snap.tasks || [];
            const copy = Object.assign({}, t, { id: 't-' + Math.random().toString(36).slice(2) });
            snap.tasks.push(copy);
            try { localStorage.setItem(classroomKey(classId), JSON.stringify(snap)); } catch (e) { }
            // persist in background
            try { saveClassroom(classId, snap).catch(err => { console.warn('saveClassroom failed', err); }); } catch (e) { }
            showToast('Imported "' + (t.label || 'task') + '"', { type: 'success' });
            renderMgr();
          } catch (e) { console.warn('import failed', e); showToast('Import failed', { type: 'error' }); }
        };
        right.appendChild(imp); card.appendChild(left); card.appendChild(right); importTaskArea.appendChild(card);
      });
    } catch (e) { console.warn('renderImportTasksFor failed', e); }
  }

  // Tab switching extended to include import tab
  try {
    const tabAdd = mb.querySelector('#tab_addtask');
    const tabEdit = mb.querySelector('#tab_edittask');
    const tabImport = mb.querySelector('#tab_importtask');
    function setMode(mode) {
      mb.dataset.mode = mode || 'add';
      if (mode === 'edit') {
        left.style.display = 'none'; right.style.display = 'block'; mgrPane.style.display = 'block'; importPane.style.display = 'none'; tabEdit.setAttribute('aria-selected', 'true'); tabAdd.setAttribute('aria-selected', 'false'); tabImport.setAttribute('aria-selected', 'false');
      } else if (mode === 'import') {
        left.style.display = 'none'; right.style.display = 'block'; mgrPane.style.display = 'none'; importPane.style.display = 'block'; tabImport.setAttribute('aria-selected', 'true'); tabAdd.setAttribute('aria-selected', 'false'); tabEdit.setAttribute('aria-selected', 'false'); refreshImportList(); renderImportTasksFor();
      } else {
        left.style.display = 'block'; right.style.display = 'none'; mgrPane.style.display = 'block'; importPane.style.display = 'none'; tabAdd.setAttribute('aria-selected', 'true'); tabEdit.setAttribute('aria-selected', 'false'); tabImport.setAttribute('aria-selected', 'false');
      }
    }
    tabAdd.addEventListener('click', () => { setMode('add'); try { safeFocusEl(mb.querySelector('#tLabel')); } catch (e) { } });
    tabEdit.addEventListener('click', () => { setMode('edit'); try { safeFocusEl(mb.querySelector('#task_mgr')); } catch (e) { } renderMgr(); });
    tabImport.addEventListener('click', () => { setMode('import'); });
  } catch (e) { console.warn('tab wiring failed', e); }

  try { importSelect.addEventListener('change', (ev) => { renderImportTasksFor(ev.target.value); }); } catch (e) { }
  // refreshImportList and chooseAnotherClass controls removed from this UI
  try { mb.querySelector('#importCancel').addEventListener('click', () => { closeModal(mb); }); } catch (e) { }

  // Ensure Import All button is wired in this modal variant
  try {
    mb.querySelector('#importAllBtn').addEventListener('click', async () => {
      try {
        const cid = importSelect.value; if (!cid) { showToast('Select a class to import from', { type: 'warning' }); return; }
        let other = loadClassroom(cid); if (!other) { other = await ensureClassLoaded(cid); }
        if (!other || !other.tasks || !other.tasks.length) { showToast('No tasks to import', { type: 'warning' }); return; }
        snap.tasks = snap.tasks || [];
        const existing = new Set((snap.tasks || []).map(t => ((t.label || '').trim().toLowerCase() + '|' + (t.points || 0))));
        let added = 0;
        (other.tasks || []).forEach(t => {
          const key = (t.label || '').trim().toLowerCase() + '|' + (t.points || 0);
          if (existing.has(key)) return;
          const copy = Object.assign({}, t, { id: 't-' + Math.random().toString(36).slice(2) });
          snap.tasks.push(copy); existing.add(key); added++;
        });
        if (added > 0) {
          try { localStorage.setItem(classroomKey(classId), JSON.stringify(snap)); } catch (e) { }
          try { saveClassroom(classId, snap).catch(err => { console.warn('saveClassroom failed', err); showToast('Sync failed — changes saved locally', { type: 'warning' }); }); } catch (e) { }
          showToast('Imported ' + added + ' tasks', { type: 'success' });
          renderMgr();
        } else {
          showToast('No new tasks to import (deduplicated)', { type: 'default' });
        }
      } catch (e) { console.warn('importAll (add/edit modal) failed', e); showToast('Import failed', { type: 'error' }); }
    });
  } catch (e) { }

  attachModalBehavior(mb, '#tLabel');
}

// Combined Add / Edit Students modal: left = add/edit form, right = manager list
function openAddEditStudentsModal(classId) {
  const snap = loadClassroom(classId);
  if (!snap) { showToast('Failed to load class', { type: 'error' }); return; }
  let editingId = null;
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  mb.innerHTML = `<div class='modal' style='width:min(960px,96vw);max-height:90vh;overflow:auto;'>
        <div style='display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px'>
          <div id='ae_tabs' class='ae-tabs' role='tablist' aria-label='Add or manage students'>
            <button role='tab' id='tab_add' class='ae-tab' aria-selected='true'>Add Students</button>
            <button role='tab' id='tab_students' class='ae-tab' aria-selected='false'>Edit Students</button>
          </div>
          <div style='display:flex;align-items:center'>
            <!-- close button (injected by modal helper) -->
          </div>
        </div>
        <div id='ae_container' style='display:grid;grid-template-columns:1fr;gap:16px;align-items:start'>
          <div id='ae_left' style='background:transparent'>
            <div style='display:flex;gap:12px;align-items:center;margin-bottom:12px'>
              <div style='width:84px;height:84px;border-radius:12px;overflow:hidden;background:#fff;box-shadow:0 6px 12px rgba(0,0,0,0.06);display:flex;align-items:center;justify-content:center'>
                <img id='ae_previewImg' src='' style='width:100%;height:100%;object-fit:cover'/>
              </div>
              <div style='flex:1'>
                <label for='ae_stuName' style='font-weight:700;display:block;margin-bottom:6px'>Student Name</label>
                <input id='ae_stuName' placeholder='Enter name...' type='text' style='width:100%;padding:10px;border:2px solid #e0e0e0;border-radius:10px;font-size:16px;box-sizing:border-box'/>
                <div style='margin-top:8px;display:flex;gap:8px'>
                  <button id='ae_choosePhotoBtn' style='flex:1;padding:10px;background:#ff9be6;border:none;border-radius:8px;color:#222;font-weight:700;cursor:pointer'>📷 Choose Photo</button>
                  <button id='ae_clearPhotoBtn' style='padding:10px;background:#eee;border:none;border-radius:8px;color:#222;cursor:pointer'>✖</button>
                </div>
                <div id='ae_previewCaption' style='margin-top:8px;font-size:12px;color:#222;font-weight:600'>Random</div>
              </div>
            </div>

            <div style='margin-bottom:12px'>
              <div style='font-weight:700;display:block;margin-bottom:8px' role='heading' aria-level='4'>Gender</div>
              <div style='display:flex;gap:12px'>
                <button data-gender='girl' class='ae-gender-btn' style='flex:1;padding:10px;border:3px solid #ddd;background:#fff;border-radius:10px;font-weight:700;cursor:pointer'>👧 Girl</button>
                <button data-gender='boy' class='ae-gender-btn' style='flex:1;padding:10px;border:3px solid #ddd;background:#fff;border-radius:10px;font-weight:700;cursor:pointer'>👦 Boy</button>
                <button data-gender='other' class='ae-gender-btn' style='flex:1;padding:10px;border:3px solid #ddd;background:#fff;border-radius:10px;font-weight:700;cursor:pointer'>🌈 Other</button>
              </div>
            </div>

            <div style='margin-bottom:12px'>
              <div style='font-weight:700;display:block;margin-bottom:8px' role='heading' aria-level='4'>Choose Avatar</div>
              <div style='display:flex;gap:8px;align-items:center;margin-bottom:8px'>
                <button id='ae_openAvatarListBtn' style='padding:10px;background:#7dd7ff;border:none;border-radius:8px;color:#004a6d;font-weight:700;cursor:pointer'>🎨 Avatars</button>
                <span style='font-size:12px;color:#444'>or upload a photo</span>
              </div>
              <div id='ae_avatarList' style='display:none;max-height:220px;overflow:auto;border-top:1px solid #f0f0f0;padding-top:8px;margin-top:8px;box-sizing:border-box'></div>
              <div style='font-size:13px;color:#667;margin-top:6px'>Tip: Choose an avatar or upload a photo. Uploaded photos are stored separately and linked to the student.</div>
            </div>

            <div style='margin-bottom:8px'>
              <div style='font-weight:700;display:block;margin-bottom:8px' role='heading' aria-level='4'>Door Color</div>
              <div id='ae_colorGrid' style='display:grid;grid-template-columns:repeat(4,1fr);gap:10px'></div>
            </div>

            <div class='actions' style='gap:10px;margin-top:12px'>
              <button id='ae_cancel' class='btn-muted'>Cancel</button>
              <button id='ae_save' class='action-btn'>Add Student</button>
            </div>
          </div>

          <div id='ae_right' style='display:none;background:#fff;border-radius:10px;padding:14px;box-shadow:0 10px 30px rgba(20,30,80,0.04);max-height:72vh;overflow:auto'>
            <div style='display:flex;align-items:center;gap:8px;margin-bottom:8px'>
              <div style='font-weight:900;font-size:16px;flex:1'>Students</div>
              <input id='ae_stuSearch' placeholder='Search students...' style='padding:8px;border-radius:10px;border:1px solid #e6e9ef' />
            </div>
            <div id='ae_mgrArea' style='display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px'></div>
          </div>
        </div>
      </div>`;
  document.body.appendChild(mb);

  // Mode handling: default = 'add' (left pane full-width). 'edit' shows manager full-width.
  const containerEl = mb.querySelector('#ae_container');
  const leftPane = mb.querySelector('#ae_left');
  const rightPane = mb.querySelector('#ae_right');
  const headerEl = null;
  const tabAdd = mb.querySelector('#tab_add');
  const tabStudents = mb.querySelector('#tab_students');
  function setMode(mode) {
    mb.dataset.mode = mode || 'add';
    if (mode === 'edit') {
      // hide add form, show manager full-width
      leftPane.style.display = 'none';
      rightPane.style.display = 'block';
      containerEl.style.gridTemplateColumns = '1fr';
      // header text removed; tabs indicate mode
      tabStudents.setAttribute('aria-selected', 'true'); tabStudents.classList.add('active');
      tabAdd.setAttribute('aria-selected', 'false'); tabAdd.classList.remove('active');
      // hide save button when editing list
      const saveBtn = mb.querySelector('#ae_save'); if (saveBtn) saveBtn.style.display = 'none';
    } else {
      leftPane.style.display = 'block';
      rightPane.style.display = 'none';
      containerEl.style.gridTemplateColumns = '1fr';
      // header text removed; tabs indicate mode
      tabAdd.setAttribute('aria-selected', 'true'); tabAdd.classList.add('active');
      tabStudents.setAttribute('aria-selected', 'false'); tabStudents.classList.remove('active');
      const saveBtn = mb.querySelector('#ae_save'); if (saveBtn) { saveBtn.style.display = ''; saveBtn.textContent = 'Add Student'; }
    }
  }
  // initialize in add mode (left occupies the full modal)
  setMode('add');
  // Tab click handlers
  tabAdd.addEventListener('click', () => { setMode('add'); try { safeFocusEl(mb.querySelector('#ae_stuName')); } catch (e) { } });
  tabStudents.addEventListener('click', () => { setMode('edit'); try { safeFocusEl(mb.querySelector('#ae_stuSearch')); } catch (e) { } });

  // Tidy up visual styles for the modal panes and buttons
  try {
    leftPane.style.background = '#fff'; leftPane.style.borderRadius = '12px'; leftPane.style.padding = '14px';
    rightPane.style.background = '#fff'; rightPane.style.borderRadius = '12px'; rightPane.style.padding = '14px';
    const saveBtnInit = mb.querySelector('#ae_save'); if (saveBtnInit) { saveBtnInit.style.background = 'linear-gradient(135deg,#7b46ff,#b86bff)'; saveBtnInit.style.boxShadow = '0 12px 32px rgba(123,70,255,0.14)'; saveBtnInit.style.borderRadius = '28px'; saveBtnInit.style.padding = '10px 16px'; }
    const cancelBtnInit = mb.querySelector('#ae_cancel'); if (cancelBtnInit) { cancelBtnInit.style.color = '#7b46ff'; cancelBtnInit.style.background = 'transparent'; cancelBtnInit.style.border = '0'; cancelBtnInit.style.fontWeight = '800'; }
    // style tab buttons
    try { const tA = mb.querySelector('#tab_add'); const tS = mb.querySelector('#tab_students'); if (tA) { tA.style.padding = '8px 12px'; tA.style.borderRadius = '8px'; } if (tS) { tS.style.padding = '8px 12px'; tS.style.borderRadius = '8px'; } } catch (e) { }
  } catch (e) { }

  // local helpers and data
  const emojiList = ['🦄', '🧚‍♀️', '🦸‍♂️', '👾', '🐻', '🐲', '👽', '🐙', '🦊', '🐼', '🐵', '🦁'];
  const bgColors = ['#fff2fb', '#e8fbff', '#fff7e6', '#fff3d9', '#e8ffe8', '#fff0f0', '#f0f4ff'];
  function createEmojiAvatar(emoji, bg) { const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 120'><rect width='120' height='120' rx='16' fill='${bg}'/><text x='50%' y='52%' font-size='56' text-anchor='middle' dominant-baseline='middle'>${emoji}</text></svg>`; return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`; }

  const previewImg = mb.querySelector('#ae_previewImg');
  const avatarList = mb.querySelector('#ae_avatarList');
  const colorGrid = mb.querySelector('#ae_colorGrid');
  const choosePhotoBtn = mb.querySelector('#ae_choosePhotoBtn');
  const clearPhotoBtn = mb.querySelector('#ae_clearPhotoBtn');
  const openAvatarListBtn = mb.querySelector('#ae_openAvatarListBtn');

  // prepare avatars
  if (avatarList) {
    avatarList.style.display = 'grid'; avatarList.style.gridTemplateColumns = 'repeat(auto-fill,84px)'; avatarList.style.gap = '12px'; avatarList.style.justifyContent = 'center';
    for (let i = 0; i < emojiList.length; i++) {
      const av = createEmojiAvatar(emojiList[i], bgColors[i % bgColors.length]);
      const b = document.createElement('button'); b.type = 'button'; b.dataset.avatar = av; b.tabIndex = 0;
      b.style.padding = '0'; b.style.border = '2px solid #ddd'; b.style.borderRadius = '10px'; b.style.width = '72px'; b.style.height = '72px';
      b.style.backgroundImage = 'url("' + av + '")'; b.style.backgroundSize = 'cover'; b.style.backgroundPosition = 'center'; b.title = 'Avatar ' + emojiList[i]; b.setAttribute('aria-label', 'Avatar ' + emojiList[i]);
      b.addEventListener('click', () => { previewImg.src = av; mb.querySelector('#ae_previewCaption').textContent = 'Avatar chosen'; previewImg.dataset.uploaded = ''; mb.dataset.photoSource = 'avatar'; });
      avatarList.appendChild(b);
    }
  }

  // color grid
  const doorColors = ['#ffd1f0', '#b3e6ff', '#ffe6b3', '#d1ffb3', '#ffb3d1', '#b3d1ff', '#ffd9b3', '#d9b3ff'];
  doorColors.forEach(c => { const b = document.createElement('button'); b.style.width = '100%'; b.style.height = '40px'; b.style.borderRadius = '8px'; b.style.border = '2px solid #fff'; b.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.04)'; b.style.background = c; b.title = c; b.onclick = () => { mb.dataset.doorTheme = c; Array.from(colorGrid.children).forEach(ch => { ch.style.outline = 'none'; ch.style.boxShadow = 'inset 0 0 0 2px rgba(0,0,0,0.04)'; }); b.style.outline = '3px solid rgba(0,0,0,0.06)'; b.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; }; colorGrid.appendChild(b); });
  if (!mb.dataset.doorTheme) mb.dataset.doorTheme = '#ffd1f0';

  // file input
  const photoInput = document.createElement('input'); photoInput.type = 'file'; photoInput.accept = 'image/*'; photoInput.style.display = 'none'; photoInput.onchange = async (ev) => { const f = ev.target.files[0]; if (!f) return; try { const data = await fileToDataURL(f); previewImg.src = data; mb.querySelector('#ae_previewCaption').textContent = 'Uploaded'; previewImg.dataset.uploaded = '1'; mb.dataset.photoSource = 'upload'; } catch (e) { console.warn(e); } };
  mb.appendChild(photoInput);
  choosePhotoBtn.onclick = () => photoInput.click();
  clearPhotoBtn.onclick = () => { previewImg.dataset.uploaded = ''; mb.dataset.photoSource = 'avatar'; try { previewImg.src = createEmojiAvatar('🦄', '#fff2fb'); mb.querySelector('#ae_previewCaption').textContent = 'Random'; } catch (e) { previewImg.src = ''; mb.querySelector('#ae_previewCaption').textContent = 'Random'; } };
  openAvatarListBtn.setAttribute('aria-expanded', 'true'); openAvatarListBtn.onclick = () => { const show = avatarList.style.display === 'none'; avatarList.style.display = show ? 'grid' : 'none'; openAvatarListBtn.setAttribute('aria-expanded', String(show)); if (show) { setTimeout(() => { try { const first = avatarList.querySelector('button[data-avatar]'); if (first) try { safeFocusEl(first); } catch (e) { } } catch (e) { } }, 20); } };

  // gender buttons
  const genderBtns = mb.querySelectorAll('.ae-gender-btn'); genderBtns.forEach(gb => { gb.addEventListener('click', () => { const val = gb.dataset.gender || 'other'; mb.dataset.gender = val; genderBtns.forEach(x => { x.style.borderColor = '#ddd'; x.style.background = '#fff'; }); gb.style.borderColor = '#7b46ff'; gb.style.background = '#f6f0ff'; }); });
  if (!mb.dataset.gender) { mb.dataset.gender = 'other'; Array.from(genderBtns).forEach(x => { x.style.borderColor = '#ddd'; x.style.background = '#fff'; if (x.dataset.gender === 'other') { x.style.borderColor = '#7b46ff'; x.style.background = '#f6f0ff'; } }); }

  // populate defaults
  previewImg.src = createEmojiAvatar('🦄', '#fff2fb');

  // manager area rendering
  const mgrArea = mb.querySelector('#ae_mgrArea'); const search = mb.querySelector('#ae_stuSearch');
  function renderMgr() {
    mgrArea.innerHTML = ''; (snap.students || []).forEach((s, idx) => {
      const card = document.createElement('div'); card.style.cssText = 'background:#fff;border-radius:12px;padding:12px;box-shadow:0 10px 30px rgba(20,30,80,0.04);display:flex;gap:12px;position:relative;align-items:center';
      const actionsCol = document.createElement('div'); actionsCol.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:center;justify-content:flex-start;min-width:84px';
      const edit = document.createElement('button'); edit.className = 'small-btn'; edit.textContent = 'Edit'; edit.style.width = '72px';
      const reset = document.createElement('button'); reset.className = 'small-btn'; reset.textContent = 'Reset'; reset.style.width = '72px'; reset.style.background = 'linear-gradient(135deg,#f0f2f8,#e6e9ef)'; reset.style.color = '#222'; reset.style.fontWeight = '800';
      const del = document.createElement('button'); del.className = 'small-btn'; del.textContent = 'Delete'; del.style.width = '72px'; del.style.background = 'linear-gradient(135deg,#ff6b6b,#ff4b4b)';
      actionsCol.appendChild(edit); actionsCol.appendChild(reset); actionsCol.appendChild(del);
      const content = document.createElement('div'); content.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex:1;gap:8px';
      const img = document.createElement('img'); img.src = (s.photo && typeof s.photo === 'string' && s.photo.indexOf('ref:') === 0) ? (getPhotoDataById(s.photo.slice(4)) || '') : (s.photo || ''); img.alt = s.name; img.style.cssText = 'width:84px;height:84px;border-radius:12px;object-fit:cover;box-shadow:0 8px 20px rgba(0,0,0,0.08)';
      const name = document.createElement('div'); name.textContent = s.name; name.className = 'mgr-stu-name'; name.style.fontWeight = '800'; name.style.fontSize = '15px';
      const pts = document.createElement('div'); pts.textContent = (s.total || 0) + ' pts'; pts.style.color = '#666'; pts.style.fontWeight = '700';
      edit.onclick = () => { // switch to Add mode and populate left form for editing
        try { setMode('add'); } catch (e) { }
        editingId = s.id; mb.querySelector('#ae_save').textContent = 'Save'; mb.querySelector('#ae_stuName').value = s.name || ''; 
// Clear any previous upload state
previewImg.dataset.uploaded = '';
mb.dataset.photoSource = 'avatar';

if (s.photo && typeof s.photo === 'string' && s.photo.startsWith('ref:')) { 
  const photoId = s.photo.slice(4);
  const photoData = getPhotoDataById(photoId);
  if (photoData) {
    previewImg.src = photoData;
    // Mark as existing photo (not a new upload)
    mb.dataset.photoSource = 'existing';
  } else {
    // Fallback to default avatar if photo not found
    previewImg.src = createEmojiAvatar('🦄', '#fff2fb');
  }
} else if (s.photo && s.photo.includes('data:image')) {
  previewImg.src = s.photo;
  mb.dataset.photoSource = 'existing';
} else {
  previewImg.src = createEmojiAvatar('🦄', '#fff2fb');
}
        mb.dataset.doorTheme = s.doorTheme || '#ffd1f0'; mb.dataset.gender = s.gender || 'other'; genderBtns.forEach(x => { x.style.borderColor = '#ddd'; x.style.background = '#fff'; if (x.dataset.gender === mb.dataset.gender) { x.style.borderColor = '#7b46ff'; x.style.background = '#f6f0ff'; } }); try { safeFocusEl(mb.querySelector('#ae_stuName')); } catch (e) { }
      };
      reset.onclick = () => { openConfirm('Reset points for ' + s.name + ' to 0?', { confirmLabel: 'Reset', cancelLabel: 'Cancel' }).then(async ok => { if (!ok) return; s.total = 0; try { await saveClassroom(classId, snap); } catch (e) { console.warn('reset failed', e); } renderMgr(); try { openClass(classId); } catch (e) { } }); };
      del.onclick = () => {
        openConfirm('Delete ' + s.name + '? This cannot be undone.', { confirmLabel: 'Delete', cancelLabel: 'Cancel' }).then(async ok => {
          if (!ok) return; snap.students.splice(idx, 1); try { await saveClassroom(classId, snap); } catch (e) { console.warn('delete failed', e); } renderMgr(); try { openClass(classId); } catch (e) { } if (editingId === s.id) { // cleared editing
            editingId = null; mb.querySelector('#ae_save').textContent = 'Add Student'; mb.querySelector('#ae_stuName').value = ''; previewImg.src = createEmojiAvatar('🦄', '#fff2fb');
          }
        });
      };
      content.appendChild(img); content.appendChild(name); content.appendChild(pts); card.appendChild(actionsCol); card.appendChild(content); mgrArea.appendChild(card);
    });
  }

  search.addEventListener('input', () => { const q = search.value.trim().toLowerCase(); Array.from(mgrArea.children).forEach(c => { const nameEl = c.querySelector('.mgr-stu-name'); const n = nameEl ? nameEl.textContent.toLowerCase() : ''; c.style.display = n.indexOf(q) === -1 ? 'none' : ''; }); });

  // Save / Cancel wiring
  mb.querySelector('#ae_cancel').onclick = () => closeModal(mb);
  mb.querySelector('#ae_save').onclick = async () => {
    const name = mb.querySelector('#ae_stuName').value.trim(); if (!name) { showFieldError(mb, '#ae_stuName', 'Enter name'); return; }
    let photoRef = null;
    if (previewImg.dataset.uploaded) {
      const data = previewImg.src;
      try { const pid = storePhotoData(data); } catch (e) { }
      photoRef = data;
    } else if (previewImg.src && previewImg.src.indexOf('data:image') === 0) { photoRef = previewImg.src; }
    const doorTheme = mb.dataset.doorTheme || '#ffd1f0'; const chosenGender = mb.dataset.gender || 'other';
    if (editingId) { 
  const existing = (snap.students || []).find(s => s.id === editingId); 
  if (existing) { 
    existing.name = name; 
    existing.doorTheme = doorTheme; 
    existing.gender = chosenGender; 
    
    // Handle photo update properly - always use the new photo if uploaded
    if (previewImg.dataset.uploaded === '1' && photoRef) {
      // New photo uploaded - store it and use the reference
      const photoId = storePhotoData(photoRef);
      existing.photo = `ref:${photoId}`;
    } else if (previewImg.src && previewImg.src.includes('data:image')) {
      // Avatar was selected - use the data URL directly
      existing.photo = previewImg.src;
    }
    // If no new photo selected, keep the existing photo (do nothing)
  } 
}else { const st = { id: 's-' + Math.random().toString(36).slice(2), name, gender: chosenGender, doorTheme, photo: photoRef, total: 0, history: [] }; snap.students = snap.students || []; snap.students.push(st); }
    try { await saveClassroom(classId, snap); } catch (e) { console.warn('save student failed', e); }
    closeModal(mb); openClass(classId);
  };

  attachModalBehavior(mb, '#ae_stuName'); renderMgr();
}

function openReportsModal(classId) {
  const snap = loadClassroom(classId) || { students: [], tasks: [], __classroomName: '' };
  const mb = document.createElement('div'); mb.className = 'modal-backdrop';
  const dialog = document.createElement('div'); dialog.className = 'modal'; dialog.style.maxWidth = '920px'; dialog.style.minWidth = '320px';
  // Header
  const h = document.createElement('h3'); h.textContent = 'Reports'; dialog.appendChild(h);
  // Controls container
  const controls = document.createElement('div'); controls.className = 'report-controls'; controls.style.display = 'flex'; controls.style.gap = '8px'; controls.style.marginBottom = '12px'; controls.style.alignItems = 'center'; controls.style.width = '100%';
  // Student select
  const sel = document.createElement('select'); sel.id = 'repStu'; sel.style.flex = '0 0 auto'; sel.style.width = '180px'; sel.style.maxWidth = '36ch'; sel.style.padding = '10px 12px'; sel.style.borderRadius = '10px'; sel.style.border = '1px solid #eef2f8'; sel.style.background = '#fff'; sel.style.fontSize = '15px';
  const emptyOpt = document.createElement('option'); emptyOpt.value = ''; emptyOpt.textContent = 'Select student'; sel.appendChild(emptyOpt);
  (snap.students || []).forEach(s => { try { const o = document.createElement('option'); o.value = s.id || ''; o.textContent = s.name || '(unnamed)'; sel.appendChild(o); } catch (e) { } });
  controls.appendChild(sel);
  // From date (compact)
  const fromInput = document.createElement('input'); fromInput.id = 'repFrom'; fromInput.type = 'date'; fromInput.placeholder = 'From'; fromInput.style.flex = '0 0 auto'; fromInput.style.width = '140px'; fromInput.style.padding = '8px 10px'; fromInput.style.borderRadius = '8px'; fromInput.style.border = '1px solid #eef2f8'; fromInput.style.background = '#fff'; fromInput.style.fontSize = '14px'; controls.appendChild(fromInput);
  // To date (compact)
  const toInput = document.createElement('input'); toInput.id = 'repTo'; toInput.type = 'date'; toInput.placeholder = 'To'; toInput.style.flex = '0 0 auto'; toInput.style.width = '140px'; toInput.style.padding = '8px 10px'; toInput.style.borderRadius = '8px'; toInput.style.border = '1px solid #eef2f8'; toInput.style.background = '#fff'; toInput.style.fontSize = '14px'; controls.appendChild(toInput);
  // Generate button
  const genBtn = document.createElement('button'); genBtn.id = 'gen'; genBtn.className = 'action-btn'; genBtn.type = 'button'; genBtn.style.flex = '0 0 auto'; genBtn.style.whiteSpace = 'nowrap'; genBtn.textContent = 'Generate'; controls.appendChild(genBtn);
  // Download button (initially hidden)
  const downloadBtn = document.createElement('button'); downloadBtn.id = 'downloadPdf'; downloadBtn.className = 'small-btn'; downloadBtn.type = 'button'; downloadBtn.style.display = 'none'; downloadBtn.style.marginLeft = '8px'; downloadBtn.style.flex = '0 0 auto'; downloadBtn.textContent = 'Download PDF'; controls.appendChild(downloadBtn);
  dialog.appendChild(controls);
  // Report area & actions
  const area = document.createElement('div'); area.id = 'repArea'; dialog.appendChild(area);
  const actions = document.createElement('div'); actions.className = 'actions'; dialog.appendChild(actions);
  mb.appendChild(dialog);
  document.body.appendChild(mb);
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
    if (!sid) { showToast('Choose student', { type: 'warning' }); return; }
    const st = (snap.students || []).find(x => x.id === sid); if (!st) return;
    area.innerHTML = '';

    // date filters (optional)
    const fromVal = (fromInput && fromInput.value) ? fromInput.value : null;
    const toVal = (toInput && toInput.value) ? toInput.value : null;
    const fromTs = fromVal ? new Date(fromVal + 'T00:00:00').getTime() : null;
    const toTs = toVal ? new Date(toVal + 'T23:59:59.999').getTime() : null;

    // raw history then filter by date range if provided
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
    if (!hist || hist.length === 0) { area.innerHTML = '<div style="color:#666">No history for selected date range</div>'; downloadBtn.style.display = 'none'; return; }

    // Build SVG-based donut + legend + connectors (wedge slices + clean separators)
    const colors = ['#4CCFF9', '#8FB3FF', '#FFD166', '#8DE7A6', '#C78CFF', '#F86DA0', '#FFB3A7', '#A7FFD1'];
    // aggregate points by task label
    const map = {};
    (snap.tasks || []).forEach(t => { try { map[t.label] = { label: t.label, points: 0, count: 0 }; } catch (e) { } });
    hist.forEach(h => { try { const key = h.task || h.label || 'unknown'; if (!map[key]) map[key] = { label: key, points: 0, count: 0 }; map[key].points += (h.points || 0); map[key].count = (map[key].count || 0) + 1; } catch (e) { } });
    const entries = Object.keys(map).map(k => ({ label: map[k].label, points: map[k].points, count: map[k].count }));
    const filtered = entries.filter(e => Math.abs(e.points) > 0 || e.count > 0);
    if (!filtered || !filtered.length) { area.innerHTML = '<div style="color:#666">No scored events</div>'; downloadBtn.style.display = 'none'; return; }
    filtered.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
    const total = Math.max(1, filtered.reduce((s, e) => s + Math.abs(e.points), 0));

    const VIEW = 720; const cx = VIEW / 2, cy = VIEW / 2; const radius = Math.round(VIEW * 0.36); const innerR = Math.round(radius * 0.48);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', `0 0 ${VIEW} ${VIEW}`); svg.style.width = '100%'; svg.style.maxWidth = '560px'; svg.style.height = 'auto'; svg.style.display = 'block'; svg.style.borderRadius = '10px'; svg.style.boxShadow = '0 18px 44px rgba(0,0,0,0.10)';

    // polar helper
    function polarToCartesian(cx, cy, r, angleDeg) { const rad = angleDeg * Math.PI / 180; return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r }; }

    // draw wedge slices with white radial separators
    let angleAcc = -90;
    const sliceEls = [];
    filtered.forEach((e, i) => {
      const v = Math.abs(e.points); const angle = (v / total) * 360; if (angle <= 0) return;
      const startA = angleAcc; const endA = angleAcc + angle;
      const start = polarToCartesian(cx, cy, radius, endA); const end = polarToCartesian(cx, cy, radius, startA);
      const largeArc = angle > 180 ? 1 : 0;
      const d = `M ${cx} ${cy} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', d); p.setAttribute('fill', colors[i % colors.length]); svg.appendChild(p);
      // separators: two white lines from innerR->radius at start and end angles to create crisp wedge edges
      try {
        const innerS = polarToCartesian(cx, cy, innerR, startA); const outerS = polarToCartesian(cx, cy, radius, startA);
        const l1 = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l1.setAttribute('x1', innerS.x); l1.setAttribute('y1', innerS.y); l1.setAttribute('x2', outerS.x); l1.setAttribute('y2', outerS.y); l1.setAttribute('stroke', '#fff'); l1.setAttribute('stroke-width', String(Math.max(8, Math.round(radius * 0.04)))); l1.setAttribute('stroke-linecap', 'butt'); svg.appendChild(l1);
        const innerE = polarToCartesian(cx, cy, innerR, endA); const outerE = polarToCartesian(cx, cy, radius, endA);
        const l2 = document.createElementNS('http://www.w3.org/2000/svg', 'line'); l2.setAttribute('x1', innerE.x); l2.setAttribute('y1', innerE.y); l2.setAttribute('x2', outerE.x); l2.setAttribute('y2', outerE.y); l2.setAttribute('stroke', '#fff'); l2.setAttribute('stroke-width', String(Math.max(8, Math.round(radius * 0.04)))); l2.setAttribute('stroke-linecap', 'butt'); svg.appendChild(l2);
      } catch (err) { }
      // percentage label for sufficiently large slices
      const midA = startA + angle / 2; const midRad = midA * Math.PI / 180; const labelR = innerR + (radius - innerR) * 0.55;
      const lx = cx + Math.cos(midRad) * labelR; const ly = cy + Math.sin(midRad) * labelR; const pct = Math.round((v / total) * 100);
      if (angle >= 7) {
        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text'); txt.setAttribute('x', lx); txt.setAttribute('y', ly + 6); txt.setAttribute('text-anchor', 'middle'); txt.setAttribute('font-weight', '800'); txt.setAttribute('font-size', Math.max(12, Math.round(18 * (Math.min(1, angle / 60))))); txt.setAttribute('fill', '#fff'); txt.textContent = pct + '%'; svg.appendChild(txt);
      }
      p.__meta = { startA, endA };
      sliceEls.push(p);
      angleAcc += angle;
    });

    // white center hole
    const hole = document.createElementNS('http://www.w3.org/2000/svg', 'circle'); hole.setAttribute('cx', cx); hole.setAttribute('cy', cy); hole.setAttribute('r', innerR - 2); hole.setAttribute('fill', '#fff'); svg.appendChild(hole);
    // center percent
    const pos = filtered.reduce((s, e) => s + (e.points > 0 ? e.points : 0), 0); const neg = filtered.reduce((s, e) => s + (e.points < 0 ? Math.abs(e.points) : 0), 0);
    const pctPos = (pos + neg) > 0 ? Math.round(100 * pos / (pos + neg)) : 0;
    const t1 = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t1.setAttribute('x', cx); t1.setAttribute('y', cy - 8); t1.setAttribute('text-anchor', 'middle'); t1.setAttribute('font-weight', '800'); t1.setAttribute('font-size', '48'); t1.setAttribute('fill', '#222'); t1.textContent = pctPos + '%'; svg.appendChild(t1);
    const t2 = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t2.setAttribute('x', cx); t2.setAttribute('y', cy + 30); t2.setAttribute('text-anchor', 'middle'); t2.setAttribute('font-weight', '700'); t2.setAttribute('font-size', '14'); t2.setAttribute('fill', '#666'); t2.textContent = 'positive'; svg.appendChild(t2);

    // layout: svg left, legend right (styled to match screenshot)
    const wrap = document.createElement('div'); wrap.style.display = 'flex'; wrap.style.gap = '18px'; wrap.style.alignItems = 'flex-start'; wrap.style.width = '100%';
    const svgWrap = document.createElement('div'); svgWrap.style.flex = '1'; svgWrap.style.display = 'flex'; svgWrap.style.justifyContent = 'center'; svgWrap.style.position = 'relative'; svgWrap.appendChild(svg);
    // on-chart labels removed per user request (show legend only)
    const legend = document.createElement('div'); legend.style.width = '320px'; legend.style.boxSizing = 'border-box'; legend.style.padding = '6px 12px'; legend.style.display = 'flex'; legend.style.flexDirection = 'column'; legend.style.gap = '18px';
    // populate legend rows to the right similar to screenshot
    filtered.forEach((e, i) => {
      const row = document.createElement('div'); row.style.display = 'flex'; row.style.alignItems = 'center'; row.style.gap = '12px';
      const num = document.createElement('div'); num.textContent = String(i + 1).padStart(2, '0'); num.style.color = '#d33'; num.style.fontWeight = '800'; num.style.minWidth = '30px'; num.style.textAlign = 'right';
      const col = document.createElement('div'); col.style.flex = '1'; col.style.display = 'flex'; col.style.flexDirection = 'column';
      const title = document.createElement('div'); title.textContent = e.label || 'Label'; title.style.fontWeight = '700'; title.style.color = '#222';
      const desc = document.createElement('div'); desc.textContent = `${Math.round(100 * Math.abs(e.points) / total)}% · ${e.points} pts · ${e.count} events`; desc.style.color = '#666'; desc.style.fontSize = '12px';
      col.appendChild(title); col.appendChild(desc);
      row.appendChild(num); row.appendChild(col);
      legend.appendChild(row);
    });

    svgWrap.style.minWidth = '420px';
    wrap.appendChild(svgWrap); wrap.appendChild(legend); area.appendChild(wrap);

    // create printed legend (used only in the printable view) - not visible in modal
    const printLegend = document.createElement('div'); printLegend.style.display = 'none'; filtered.forEach((e, i) => { const p = document.createElement('div'); p.textContent = `${e.label} — ${e.points} pts · ${e.count} events`; printLegend.appendChild(p); });

    // On-chart labels and connector graphics removed per user request.
    // Only the SVG donut and the right-hand legend are rendered.

    // insights below
    const insights = document.createElement('div'); insights.style.marginTop = '12px'; insights.style.color = '#333'; insights.style.fontSize = '14px'; insights.style.lineHeight = '1.5'; insights.textContent = generateInsights(filtered, hist);
    area.appendChild(insights);

    // enable download button and ensure compact presentation on small viewports
    downloadBtn.style.display = 'inline-flex';

    // helper: toggle compact inline styles when on narrow viewports
    const _applyCompactDownloadBtn = () => {
      try {
        if (window.innerWidth <= 560) {
          downloadBtn.style.width = 'auto';
          downloadBtn.style.maxWidth = '180px';
          downloadBtn.style.padding = '6px 10px';
          downloadBtn.style.fontSize = '13px';
          downloadBtn.style.boxSizing = 'border-box';
          downloadBtn.style.display = 'inline-flex';
        } else {
          // clear inline sizing to allow stylesheet rules to take precedence
          downloadBtn.style.width = '';
          downloadBtn.style.maxWidth = '';
          downloadBtn.style.padding = '';
          downloadBtn.style.fontSize = '';
          downloadBtn.style.boxSizing = '';
        }
      } catch (e) { }
    };

    // apply now and on resize
    _applyCompactDownloadBtn();
    const _dlResizeHandler = () => { try { _applyCompactDownloadBtn(); } catch (e) { } };
    window.addEventListener('resize', _dlResizeHandler);

    // listen for modal close signal so we can remove the resize listener
    const _cleanupOnClose = () => {
      try { window.removeEventListener('resize', _dlResizeHandler); document.removeEventListener('modal:maybeClosed', _cleanupOnClose); } catch (e) { }
    };
    document.addEventListener('modal:maybeClosed', _cleanupOnClose);

    downloadBtn.onclick = () => {
      try {
        // serialize the SVG chart to PNG via an offscreen canvas
        const chartSvg = svg;
        if (!chartSvg) throw new Error('No chart available');
        const serializer = new XMLSerializer();
        let svgStr = serializer.serializeToString(chartSvg);
        // ensure proper XML namespace
        if (!svgStr.match(/^<svg[^>]+xmlns="http/)) svgStr = svgStr.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
        const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          try {
            const canvasOut = document.createElement('canvas');
            // use SVG viewBox if available for high-quality export
            const vb = chartSvg.viewBox && chartSvg.viewBox.baseVal && chartSvg.viewBox.baseVal.width ? chartSvg.viewBox.baseVal : { width: VIEW, height: VIEW };
            canvasOut.width = vb.width; canvasOut.height = vb.height;
            const ctx = canvasOut.getContext('2d');
            ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvasOut.width, canvasOut.height);
            ctx.drawImage(img, 0, 0, canvasOut.width, canvasOut.height);
            const imgData = canvasOut.toDataURL('image/png');
            const printWin = window.open('', '_blank');
            const title = `${snap.__classroomName || 'Class'} — ${st.name} Report`;
            const printedOn = new Date().toLocaleString();
            const html = `<!doctype html><html><head><meta charset='utf-8'><title>${title}</title><style>body{font-family:system-ui;padding:28px;color:#111;background:#fff}.card{max-width:900px;margin:0 auto}h1{font-size:22px;margin:0 0 6px 0}.meta{color:#666;font-size:13px;margin-bottom:12px}.insights{margin-top:18px;font-size:15px;color:#333;line-height:1.5}img.chart{width:100%;border-radius:8px;box-shadow:0 18px 44px rgba(0,0,0,0.10)}@media print{ body{padding:12mm} .card{max-width:100%} }</style></head><body><div class='card'><h1>${title}</h1><div class='meta'>Generated: ${printedOn}</div><div style='max-width:900px;margin:0 auto'><img class='chart' src='${imgData}'/></div><div class='insights'>${generateInsights(filtered, hist)}</div></div></body></html>`;
            printWin.document.open(); printWin.document.write(html); printWin.document.close(); setTimeout(() => { try { printWin.focus(); printWin.print(); } catch (e) { try { printWin.print(); } catch (_) { } } }, 450);
          } finally { URL.revokeObjectURL(url); }
        };
        img.onerror = () => { URL.revokeObjectURL(url); showToast('Unable to create printable image from chart', { type: 'error' }); };
        img.src = url;
      } catch (e) { showToast('Unable to open print dialog: ' + String(e), { type: 'error' }); }
    };
  };
  try {
    const _ensureX = () => {
      const dialog = mb.querySelector('.modal');
      let x = dialog && dialog.querySelector('.modal-close-x');
      if (!x) {
        x = document.createElement('button'); x.type = 'button'; x.className = 'modal-close-x'; x.setAttribute('aria-label', 'Close');
        const icon = (mb && mb.dataset && mb.dataset.closeIcon) ? mb.dataset.closeIcon : ((mb && mb.dataset && mb.dataset.closeLabel) ? mb.dataset.closeLabel : '✕');
        x.innerHTML = icon;
        if (dialog) dialog.appendChild(x);
        if (dialog) setTimeout(() => dialog.classList.add('modal-open'), 10);
      }
      return x;
    };
    const rX = _ensureX(); rX.addEventListener('click', () => closeModal(mb));
    const oldR = mb.querySelector('#rClose'); if (oldR) oldR.remove();
  } catch (e) { }
}
// Enhanced photo handling with better error handling and preview
async function handlePhotoUpload(file, previewElement, captionElement) {
  try {
    if (!file) return null;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showToast('Invalid file type. Please upload JPG, PNG, GIF, or WebP images.', { type: 'warning' });
      return null;
    }
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      showToast('Image too large. Maximum size is 2MB.', { type: 'warning' });
      return null;
    }
    
    // Show loading state
    captionElement.textContent = 'Processing...';
    previewElement.style.opacity = '0.7';
    
    // Convert to data URL
    const dataURL = await fileToDataURL(file);
    
    // Update preview
    previewElement.src = dataURL;
    previewElement.dataset.uploaded = '1';
    captionElement.textContent = 'Uploaded';
    previewElement.style.opacity = '1';
    
    return dataURL;
  } catch (error) {
    console.error('Photo upload failed:', error);
    showToast('Failed to process image. Please try again.', { type: 'error' });
    previewElement.style.opacity = '1';
    return null;
  }
}

    
// util
// function fileToDataURL(file) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); }); }
// Improved file to data URL function
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    
    reader.onerror = (error) => {
      reject(new Error('Failed to read file: ' + error.message));
    };
    
    reader.readAsDataURL(file);
  });
}
// init
renderSidebar();
// optional: open first class if any
const first = listClassrooms()[0]; if (first) openClass(first.id);



(function forceTopline() {
  function injectCSS(css) {
    try { const s = document.createElement('style'); s.appendChild(document.createTextNode(css)); document.head.appendChild(s); } catch (e) { console.warn('injectCSS failed', e); }
  }
  // Keep styling focused on the wrapper. Account will live inside it, not separately fixed.
  injectCSS('\n.force-top-topline{position:fixed !important;top:0;left:0;right:0;z-index:2200;background:rgba(255,255,255,0.98);box-shadow:0 8px 30px rgba(10,12,30,0.06);}\n.force-top-topline .account-inline{display:flex;align-items:center;gap:8px;}\n.force-top-topline .account-inline #accountBtn{padding:4px;height:32px;border-radius:999px;}\n.force-top-topline .account-inline #accountAvatar{width:20px;height:20px;border-radius:999px;object-fit:cover;}\n/* Force hamburger visible and styled inside the topline */\n.app-topline #mobileMenuBtn{display:inline-flex !important;visibility:visible !important;opacity:1 !important;border:0;background:transparent !important;font-size:20px !important;padding:6px !important;margin-right:8px !important;}\n.app-topline #mobileMenuBtn svg, .app-topline #mobileMenuBtn img{width:20px;height:20px;}\n');

  function ensureWrapper() {
    // Ensure there is an `.app-topline` wrapper that contains #currentMeta and #classCounts.
    let wrapper = document.querySelector('.app-topline');
    const cur = document.getElementById('currentMeta');
    const counts = document.getElementById('classCounts');
    const main = document.querySelector('.main');
    if (!cur || !counts || !main) return wrapper;
    if (!wrapper) {
      wrapper = document.createElement('div'); wrapper.className = 'app-topline';
      wrapper.style.display = 'flex'; wrapper.style.gap = '12px'; wrapper.style.alignItems = 'center'; wrapper.style.justifyContent = 'space-between';
      wrapper.style.position = 'relative';

      // LEFT: mobile menu button (hamburger)
      const left = document.createElement('div'); left.style.display = 'flex'; left.style.alignItems = 'center'; left.style.gap = '8px';
      const mobileBtn = document.getElementById('mobileMenuBtn');
      if (mobileBtn) {
        mobileBtn.style.display = 'inline-flex'; mobileBtn.style.border = '0'; mobileBtn.style.background = 'transparent'; mobileBtn.style.fontSize = '20px'; mobileBtn.style.padding = '6px';
        mobileBtn.setAttribute('aria-label', 'Open menu');
        left.appendChild(mobileBtn);
      }

      // CENTER: class name + counts stacked
      const center = document.createElement('div'); center.style.display = 'flex'; center.style.flexDirection = 'column'; center.style.alignItems = 'center'; center.style.justifyContent = 'center'; center.style.minWidth = '0';
      center.appendChild(cur);
      center.appendChild(counts);

      // RIGHT: account/menu actions
      const right = document.createElement('div'); right.style.display = 'flex'; right.style.alignItems = 'center'; right.style.gap = '8px'; right.className = 'account-inline';
      const acct = document.getElementById('accountMenu');
      if (acct) { right.appendChild(acct); }

      wrapper.appendChild(left);
      wrapper.appendChild(center);
      wrapper.appendChild(right);

      // place wrapper as the first child of .main (so it's visually at top of app)
      main.insertBefore(wrapper, main.firstChild);
    }
    return wrapper;
  }

  function ensureSidebarControls() {
    
    // Ensure collapseBtn is visible and mobileBtn toggles sidebar
    try {
      const sidebar = document.getElementById('sidebar'); if (!sidebar) return;
      const collapseBtn = document.getElementById('collapseBtn');
      if (collapseBtn) { collapseBtn.style.display = 'inline-flex'; collapseBtn.setAttribute('aria-expanded', String(!sidebar.classList.contains('collapsed'))); }
      
      const mobileBtn = document.getElementById('mobileMenuBtn');
      if (mobileBtn) {
        // wire toggle behavior to open/close overlay sidebar on small screens
        mobileBtn.addEventListener('click', function () {
          try {
            const isOpen = sidebar.classList.toggle('open');
            // ensure overlay backdrop
            let back = document.getElementById('sidebarBack');
            if (isOpen) {
              if (!back) { back = document.createElement('div'); back.id = 'sidebarBack'; back.style.position = 'fixed'; back.style.left = '0'; back.style.top = '0'; back.style.right = '0'; back.style.bottom = '0'; back.style.background = 'rgba(0,0,0,0.28)'; back.style.zIndex = '2100'; document.body.appendChild(back); back.addEventListener('click', () => { sidebar.classList.remove('open'); back.remove(); }); }
              if (collapseBtn) collapseBtn.setAttribute('aria-expanded', 'true');
            } else {
              if (back) back.remove(); if (collapseBtn) collapseBtn.setAttribute('aria-expanded', 'false');
            }
          } catch (e) { console.warn('mobile menu toggle failed', e); }
        });
      }
    } catch (e) { console.warn('ensureSidebarControls failed', e); }
    
    
  }

  function apply() {
    try {
      const wrapper = ensureWrapper();
      const main = document.querySelector('.main');
      if (wrapper) {
        wrapper.classList.add('force-top-topline');
        wrapper.style.padding = wrapper.style.padding || '8px 12px';
        // avoid overlap: add top padding to main equal to wrapper height
        if (main) {
          const h = Math.ceil(wrapper.getBoundingClientRect().height || 48);
          main.style.paddingTop = (h + 8) + 'px';
        }
      }

      // compact account visuals when inside the wrapper
      const acct = document.getElementById('accountMenu');
      if (acct) {
        acct.classList.remove('force-top-account');
        const btn = acct.querySelector('#accountBtn');
        if (btn) { btn.style.padding = '4px'; btn.style.height = '32px'; }
        const img = acct.querySelector('#accountAvatar'); if (img) { img.style.width = '20px'; img.style.height = '20px'; }
      }

      ensureSidebarControls();
    } catch (e) { console.warn('forceTopline apply failed', e); }
  }

  document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('resize', function () { setTimeout(apply, 60); });
  // run once in case DOMContentLoaded already fired
  setTimeout(apply, 80);
})();