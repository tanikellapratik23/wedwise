export type BackupShape = {
  meta: { createdAt: string };
  user?: any;
  onboardingCompleted?: string | boolean;
  guests?: any;
  todos?: any;
  budget?: any;
  favoriteVendors?: any;
  ceremonies?: any;
  playlists?: any;
  seatingCharts?: any;
};

export function collectBackup(): BackupShape {
  const ocRaw = localStorage.getItem('onboardingCompleted');
  let ocVal: string | boolean | undefined = undefined;
  if (ocRaw !== null) {
    if (ocRaw === 'true') ocVal = true;
    else if (ocRaw === 'false') ocVal = false;
    else ocVal = ocRaw;
  }

  return {
    meta: { createdAt: new Date().toISOString() },
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    onboardingCompleted: ocVal,
    guests: JSON.parse(localStorage.getItem('guests') || 'null'),
    todos: JSON.parse(localStorage.getItem('todos') || 'null'),
    budget: JSON.parse(localStorage.getItem('budget') || 'null'),
    favoriteVendors: JSON.parse(localStorage.getItem('favoriteVendors') || 'null'),
    ceremonies: JSON.parse(localStorage.getItem('ceremonies') || 'null'),
    playlists: JSON.parse(localStorage.getItem('playlists') || 'null'),
    seatingCharts: JSON.parse(localStorage.getItem('seatingCharts') || 'null'),
  };
}

export function downloadBackupFile(filename = 'vivaha-backup.json') {
  const data = collectBackup();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadBackupAsDoc(filename = 'vivaha-backup.doc') {
  const data = collectBackup();
  // Create a simple HTML representation which Word can open as a document
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Vivaha Backup</title></head><body>` +
    `<h1>Vivaha Backup</h1><p>Created: ${data.meta.createdAt}</p>` +
    `<h2>User</h2><pre>${escapeHtml(JSON.stringify(data.user, null, 2) || 'No user data')}</pre>` +
    `<h2>Onboarding Completed</h2><p>${String(data.onboardingCompleted)}</p>` +
    `<h2>Guests</h2><pre>${escapeHtml(JSON.stringify(data.guests, null, 2) || 'No guests')}</pre>` +
    `<h2>Todos</h2><pre>${escapeHtml(JSON.stringify(data.todos, null, 2) || 'No todos')}</pre>` +
    `<h2>Budget</h2><pre>${escapeHtml(JSON.stringify(data.budget, null, 2) || 'No budget')}</pre>` +
    `<h2>Favorite Vendors</h2><pre>${escapeHtml(JSON.stringify(data.favoriteVendors, null, 2) || 'No favorites')}</pre>` +
    `<h2>Ceremonies</h2><pre>${escapeHtml(JSON.stringify(data.ceremonies, null, 2) || 'No ceremonies')}</pre>` +
    `<h2>Playlists</h2><pre>${escapeHtml(JSON.stringify(data.playlists, null, 2) || 'No playlists')}</pre>` +
    `<h2>Seating Charts</h2><pre>${escapeHtml(JSON.stringify(data.seatingCharts, null, 2) || 'No seating charts')}</pre>` +
    `</body></html>`;

  const blob = new Blob([html], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function escapeHtml(unsafe: string) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function importBackupFile(file: File) {
  const text = await file.text();
  const data = JSON.parse(text) as BackupShape;
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  if (typeof data.onboardingCompleted !== 'undefined') localStorage.setItem('onboardingCompleted', String(data.onboardingCompleted));
  if (data.guests) localStorage.setItem('guests', JSON.stringify(data.guests));
  if (data.todos) localStorage.setItem('todos', JSON.stringify(data.todos));
  if (data.budget) localStorage.setItem('budget', JSON.stringify(data.budget));
  if (data.favoriteVendors) localStorage.setItem('favoriteVendors', JSON.stringify(data.favoriteVendors));
  if (data.ceremonies) localStorage.setItem('ceremonies', JSON.stringify(data.ceremonies));
  if (data.playlists) localStorage.setItem('playlists', JSON.stringify(data.playlists));
  if (data.seatingCharts) localStorage.setItem('seatingCharts', JSON.stringify(data.seatingCharts));
}
