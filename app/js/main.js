import { loadTrophies } from './data.js';
import * as store from './store.js';
import * as views from './views.js';
const content = document.querySelector('#content');
const filters = { kind: 'all', grade: '', search: '', unearned: false };
let trophies = [];
let toastTimer;
function toast(message) {
  document.querySelector('#toast').textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { document.querySelector('#toast').textContent = ''; }, 4500);
}
function saved(ok, message = 'Progress saved on this device.') { toast(ok ? message : 'Storage unavailable. Export a backup to keep this session.'); }
function render() {
  const [route = 'checklist', id] = location.hash.replace(/^#\//, '').split('/');
  const active = route || 'checklist';
  document.querySelector('#header').innerHTML = views.header(trophies);
  document.querySelector('#nav').innerHTML = views.navigation(active === 'guide' ? 'checklist' : active);
  const pages = {
    checklist: () => views.checklist(trophies, filters),
    guide: () => views.guide(trophies.find(t => t.id === Number(id))),
    roadmap: () => views.roadmap(trophies),
    missables: () => views.missables(trophies),
    next: () => views.next(trophies),
    save: () => views.saveView(),
  };
  content.innerHTML = (pages[active] || pages.checklist)();
  document.title = `${active === 'guide' ? views.title(trophies.find(t => t.id === Number(id)) || {kind:'',name:'Not found'}) : { checklist:'The checklist',roadmap:'Road to platinum',missables:'Missable watch',next:'Next up',save:'Your save' }[active] || 'The checklist'} — Vice Platinum`;
}
document.addEventListener('change', async event => {
  const element = event.target;
  if (element.matches('[data-earned]')) {
    saved(store.toggleEarned(Number(element.dataset.earned)));
    render();
  } else if (element.matches('[data-spoilers]')) {
    saved(store.setSpoilers(element.checked), element.checked ? 'Spoiler shield on.' : 'Story details revealed.');
    render();
  } else if (element.id === 'grade') { filters.grade = element.value; render(); }
  else if (element.id === 'unearned') { filters.unearned = element.checked; render(); }
  else if (element.matches('[data-count]')) {
    const t = trophies.find(t => t.id === Number(element.dataset.count));
    saved(store.setCount(t.id, element.value, t.target)); render();
  } else if (element.id === 'import' && element.files[0]) {
    try {
      const file = element.files[0];
      if (file.size > 2000000) throw new Error('This file is too large. Choose a progress export under 2 MB.');
      const value = JSON.parse(await file.text());
      saved(store.replace(value), 'Progress imported. This device now uses your backup.'); render();
      document.querySelector('#import-status').textContent = 'Import complete: earned trophies, counts, notes and spoiler preference restored.';
    } catch (error) {
      document.querySelector('#import-status').textContent = `Import not applied: ${error.message}`;
      element.value = '';
    }
  }
});
document.addEventListener('input', event => {
  const element = event.target;
  if (element.id === 'search') {
    const position = element.selectionStart;
    filters.search = element.value;
    render();
    const search = document.querySelector('#search');
    search.focus();
    if (position !== null) search.setSelectionRange(position, position);
  } else if (element.matches('[data-notes]')) {
    const ok = store.setNote(Number(element.dataset.notes), element.value);
    document.querySelector('#note-status').textContent = ok ? 'Saved on this device.' : 'Storage unavailable — export to keep this note.';
  }
});
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.kind) { filters.kind = button.dataset.kind; render(); }
  else if (button.dataset.delta) {
    const id = Number(button.dataset.id), t = trophies.find(t => t.id === id);
    saved(store.setCount(id, (store.getState().counts[id] || 0) + Number(button.dataset.delta), t.target)); render();
    document.querySelector(`[data-delta="${button.dataset.delta}"]`)?.focus();
  } else if (button.id === 'export') {
    const blob = new Blob([JSON.stringify(store.getState(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'vice-platinum-progress.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Progress exported. Keep this file as your backup.');
  } else if (button.id === 'reset') {
    document.querySelector('#reset-confirm').hidden = false;
    document.querySelector('#confirm-reset').focus();
  } else if (button.id === 'cancel-reset') {
    document.querySelector('#reset-confirm').hidden = true;
    document.querySelector('#reset').focus();
  } else if (button.id === 'confirm-reset') {
    saved(store.reset(), 'Fresh record started. Spoiler shield is on.'); render();
  }
});
window.addEventListener('hashchange', () => { render(); window.scrollTo(0,0); content.focus({ preventScroll: true }); });
window.addEventListener('storage', event => {
  if (event.key !== store.KEY) return;
  try { store.replace(event.newValue ? JSON.parse(event.newValue) : { earned: [], counts: {}, notes: {}, spoilers: true }); render(); }
  catch { toast('Another tab supplied an unreadable record. Your current session is retained.'); }
});
try {
  trophies = await loadTrophies();
  if (!location.hash) history.replaceState(null, '', '#/checklist');
  render();
  if (!store.canPersist()) toast('Saved data could not be read. Export a backup of this session.');
} catch (error) {
  content.innerHTML = `<section class="empty"><h2>The guide could not open.</h2><p>${views.esc(error.message)} Serve app/ at the root with node serve.ts, then reload.</p></section>`;
}
