// Account page logic
// Assumes Supabase is loaded globally (from teachers.html or add here if needed)

// Always initialize Supabase client for account page, independent of teachers page or localStorage
if (typeof window._lf_supabase === 'undefined') {
  const supabaseUrl = 'https://cnjmvgkvbhlcruwuqubk.supabase.co';
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNuam12Z2t2YmhsY3J1d3VxdWJrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2NTQwNDUsImV4cCI6MjA4MTIzMDA0NX0.zkDZK7lhSoO38bxb-nQ-x9QVdeyk7RDDDqHPGyuYGyk';
  if (window.supabase) {
    window._lf_supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  }
}

document.addEventListener('DOMContentLoaded', function () {
  // (removed duplicate declarations)
  const sup = window._lf_supabase;
  const avatarEdit = document.getElementById('accountAvatarEdit');
  const nameInput = document.getElementById('accountNameInput');
  const emailInput = document.getElementById('accountEmailInput');
  const oldPasswordInput = document.getElementById('oldPasswordInput');
  const passwordInput = document.getElementById('accountPasswordInput');
  const avatarInput = document.getElementById('accountAvatarInput');
  const form = document.getElementById('accountForm');
  const signOutBtn = document.getElementById('signOutBtn');
  const avatarChoices = document.getElementById('avatarChoices');

  // Avatar emoji choices
  const emojiList = ['🦄','🦊','🐻','🐼','🐸','🐵','🐧','🐱','🐶','🦁','🐯','🐨','🐰','🐙','🐢','🐦','🦉','🦋','🐝','🐞','🦕','🦖','🐲','🐳','🐬','🐋','🐊','🦓','🦒','🦌','🦘','🦥','🦦','🦨','🦡','🦔','🐾'];
  function createEmojiAvatar(emoji) {
    return `data:image/svg+xml;utf8,<svg width='88' height='88' viewBox='0 0 88 88' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='44' cy='44' r='44' fill='%23e0e6f0'/><text x='50%' y='54%' text-anchor='middle' fill='%23888' font-size='44' font-family='Arial' dy='.3em'>${emoji}</text></svg>`;
  }
  function setAvatar(emoji) {
    avatarEdit.src = createEmojiAvatar(emoji);
    avatarEdit.dataset.emoji = emoji;
    avatarEdit.dataset.uploaded = '';
  }
  // Render avatar choices
  avatarChoices.innerHTML = '';
  emojiList.forEach(emoji => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'avatar-choice-btn';
    btn.innerText = emoji;
    btn.onclick = () => {
      setAvatar(emoji);
      document.querySelectorAll('.avatar-choice-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    };
    avatarChoices.appendChild(btn);
  });

  // Load user info
  (async () => {
    if (!sup) return;
    try {
      const s = await sup.auth.getSession();
      const user = s && s.data && (s.data.session?.user || s.data.user) ? (s.data.session?.user || s.data.user) : null;
      if (user) {
        nameInput.value = (user.user_metadata && user.user_metadata.full_name) ? user.user_metadata.full_name : '';
        emailInput.value = user.email || '';
        emailInput.readOnly = true;
        emailInput.disabled = true;
        // Avatar
        if (user.user_metadata && user.user_metadata.avatar) {
          avatarEdit.src = user.user_metadata.avatar;
        } else if (user.user_metadata && user.user_metadata.emoji_avatar) {
          setAvatar(user.user_metadata.emoji_avatar);
        } else {
          setAvatar('🦄');
        }
      }
    } catch (e) {}
  })();

  // Avatar upload/preview
  if (avatarInput) avatarInput.onchange = function(e) {
    const file = avatarInput.files && avatarInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(ev) {
        if (avatarEdit) {
          avatarEdit.src = ev.target.result;
          avatarEdit.dataset.emoji = '';
          avatarEdit.dataset.uploaded = '1';
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes
  if (form) form.onsubmit = async function(e) {
    e.preventDefault();
    const name = nameInput.value.trim();
    const oldPassword = oldPasswordInput.value;
    const newPassword = passwordInput.value;
    let avatarData = {};
    if (avatarEdit.dataset.uploaded === '1') {
      avatarData.avatar = avatarEdit.src;
      avatarData.emoji_avatar = '';
    } else if (avatarEdit.dataset.emoji) {
      avatarData.emoji_avatar = avatarEdit.dataset.emoji;
      avatarData.avatar = '';
    }
    try {
      if (!sup) throw new Error('No Supabase');
      // Update name and avatar
      const updates = { data: { full_name: name, ...avatarData } };
      await sup.auth.updateUser(updates);
      // Password change: require old password
      if (newPassword) {
        if (!oldPassword) throw new Error('Enter your current password to change password.');
        // Re-authenticate (Supabase: signInWithPassword)
        const s = await sup.auth.getSession();
        const user = s && s.data && (s.data.session?.user || s.data.user) ? (s.data.session?.user || s.data.user) : null;
        if (!user) throw new Error('User not found.');
        const { error: signInErr } = await sup.auth.signInWithPassword({ email: user.email, password: oldPassword });
        if (signInErr) throw new Error('Current password is incorrect.');
        await sup.auth.updateUser({ password: newPassword });
      }
      alert('Profile updated!');
      oldPasswordInput.value = '';
      passwordInput.value = '';
    } catch (err) {
      alert('Failed to update profile: ' + (err.message || err));
    }
  };

  // Log Out
  if (signOutBtn) signOutBtn.onclick = async function(e) {
    e.preventDefault();

    if (sup) await sup.auth.signOut();
    window.location.href = 'teachers.html';
  };
});
