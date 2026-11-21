export const KEY = 'vice-platinum-save-v2';
const empty = () => ({earned:[], counts:{}, notes:{}, spoilers:true});
export function validate(value) {
 if (!value || !Array.isArray(value.earned) || typeof value.counts !== 'object' || !value.counts || Array.isArray(value.counts) || typeof value.notes !== 'object' || !value.notes || Array.isArray(value.notes) || typeof value.spoilers !== 'boolean') throw new Error('Choose a Vice Platinum progress JSON with earned, counts, notes and spoilers.');
 const valid = id => Number.isInteger(Number(id)) && Number(id) >= 1 && Number(id) <= 55;
 if (!value.earned.every(id => Number.isInteger(id) && valid(id))) throw new Error('The backup contains an unknown trophy ID.');
 const counts = {}, notes = {};
 for (const [id,n] of Object.entries(value.counts)) {
  if (!valid(id) || !Number.isFinite(n) || n < 0) throw new Error('Progress counts must be nonnegative numbers for valid trophies.');
  counts[id] = Math.floor(n);
 }
 for (const [id,note] of Object.entries(value.notes)) {
  if (!valid(id) || typeof note !== 'string') throw new Error('Notes must be text attached to valid trophies.');
  notes[id] = note;
 }
 return {earned:[...new Set(value.earned)], counts, notes, spoilers:value.spoilers};
}
let data = empty();
try { const raw = localStorage.getItem(KEY); if (raw) data = validate(JSON.parse(raw)); } catch { /* An unreadable backup never prevents opening the guide. */ }
let storageError = '';
function persist() {
 try { localStorage.setItem(KEY, JSON.stringify(data)); storageError = ''; }
 catch { storageError = 'Device storage is unavailable. Export a backup to keep this session.'; }
}
export const state = {
 get data() { return data; },
 get error() { return storageError; },
 earned(id) { return data.earned.includes(id); },
 toggle(id) { data.earned = this.earned(id) ? data.earned.filter(n => n !== id) : [...data.earned,id]; persist(); },
 count(id,n,max) { data.counts[id] = Math.min(max, Math.max(0, Math.floor(Number(n) || 0))); persist(); },
 note(id,text) { data.notes[id] = text; persist(); },
 spoilers(value) { data.spoilers = value; persist(); },
 replace(value) { data = validate(value); persist(); },
 reset() { data = empty(); persist(); }
};
