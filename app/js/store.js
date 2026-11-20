export const KEY = 'vice-platinum-v1';
const fresh = () => ({ earned: [], counts: {}, notes: {}, spoilers: true });
let state = fresh();
let persistent = true;
const validId = id => Number.isInteger(Number(id)) && Number(id) >= 1 && Number(id) <= 55;
export function validate(value) {
  if (!value || typeof value !== 'object' || !Array.isArray(value.earned) || !value.counts || typeof value.counts !== 'object' || Array.isArray(value.counts) || !value.notes || typeof value.notes !== 'object' || Array.isArray(value.notes) || typeof value.spoilers !== 'boolean') throw new Error('Choose a Vice Platinum export with earned, counts, notes and spoilers.');
  if (value.earned.some(id => !Number.isInteger(id) || !validId(id))) throw new Error('Earned entries must be trophy IDs from 1 to 55.');
  const clean = fresh();
  clean.earned = [...new Set(value.earned)];
  for (const [id, count] of Object.entries(value.counts)) {
    if (!validId(id) || !Number.isSafeInteger(count) || count < 0) throw new Error('Counters must be non-negative whole numbers for valid trophies.');
    clean.counts[Number(id)] = count;
  }
  for (const [id, note] of Object.entries(value.notes)) {
    if (!validId(id) || typeof note !== 'string' || note.length > 20000) throw new Error('Notes must be text under 20,000 characters for valid trophies.');
    clean.notes[Number(id)] = note;
  }
  clean.spoilers = value.spoilers;
  return clean;
}
try {
  const saved = localStorage.getItem(KEY);
  if (saved) state = validate(JSON.parse(saved));
} catch { persistent = false; }
export const getState = () => state;
export const isEarned = id => state.earned.includes(id);
export const canPersist = () => persistent;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); persistent = true; }
  catch { persistent = false; }
  return persistent;
}
export function toggleEarned(id) {
  state.earned = isEarned(id) ? state.earned.filter(item => item !== id) : [...state.earned, id];
  return save();
}
export function setCount(id, value, target) {
  state.counts[id] = Math.min(target, Math.max(0, Math.trunc(Number(value) || 0)));
  return save();
}
export function setNote(id, value) { state.notes[id] = value; return save(); }
export function setSpoilers(value) { state.spoilers = value; return save(); }
export function replace(value) { state = validate(value); return save(); }
export function reset() { state = fresh(); return save(); }
