import {state} from './state.js';
import {trophy} from './catalog.js';
import * as pages from './pages.js';
const view = document.querySelector('#view');
function render() {
 const [route='checklist',id] = location.hash.replace(/^#\/?/,'').split('/');
 const name = route || 'checklist';
 document.querySelector('#masthead').innerHTML = pages.header();
 document.querySelectorAll('nav a').forEach(a=>{
  const active = a.dataset.route === name || (name==='guide' && a.dataset.route==='checklist');
  a.classList.toggle('active',active);
  if (active) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
 });
 const routes = {checklist:pages.checklist,roadmap:pages.roadmap,missables:pages.missables,next:pages.next,save:pages.save};
 view.innerHTML = name==='guide'?pages.guide(id):(routes[name]||pages.checklist)();
 document.title = `${name==='guide'?'Trophy guide':name==='save'?'Save & transfer':name[0].toUpperCase()+name.slice(1)} — Vice Platinum`;
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);});
document.addEventListener('click',event=>{
 const row = event.target.closest('.trophy-row');
 if(row && !event.target.closest('a,input,label,button')) location.hash=row.querySelector('.row-copy').getAttribute('href');
 const jump = event.target.closest('[data-stage-jump]');
 if(jump) {event.preventDefault();document.getElementById('stage-'+jump.dataset.stageJump)?.scrollIntoView({behavior:'smooth',block:'start'});}
 const chip = event.target.closest('[data-kind]');
 if(chip) {pages.filters.kind=chip.dataset.kind;render();}
 const step = event.target.closest('[data-count-step]');
 if(step) {const id=Number(step.dataset.id);state.count(id,(state.data.counts[id]||0)+Number(step.dataset.countStep),trophy(id).target);render();}
 if(event.target.closest('#export')) {
  const blob = new Blob([JSON.stringify(state.data,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob), link=document.createElement('a');
  link.href=url;link.download='vice-platinum-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.querySelector('#save-status').textContent='Backup exported. Keep the JSON file somewhere safe.';
 }
 if(event.target.closest('#reset') && confirm('Reset all earned trophies, counters, notes and spoiler preferences on this device? Export a backup first if you want to keep them.')) {state.reset();render();document.querySelector('#save-status').textContent='Progress reset. Your new field record is ready.';}
});
document.addEventListener('input',event=>{
 const el=event.target;
 if(el.id==='search') {pages.filters.search=el.value;document.querySelector('#checklist-results').innerHTML=pages.results();}
 if(el.dataset.notes) state.note(Number(el.dataset.notes),el.value);
 if(el.dataset.count) state.count(Number(el.dataset.count),el.value,trophy(el.dataset.count).target);
});
document.addEventListener('change',async event=>{
 const el=event.target;
 if(el.dataset.earn) {state.toggle(Number(el.dataset.earn));render();}
 if(el.dataset.action==='spoilers') {state.spoilers(el.checked);render();}
 if(el.id==='grade') {pages.filters.grade=el.value;document.querySelector('#checklist-results').innerHTML=pages.results();}
 if(el.id==='unearned') {pages.filters.unearned=el.checked;document.querySelector('#checklist-results').innerHTML=pages.results();}
 if(el.id==='import' && el.files[0]) {
  try {state.replace(JSON.parse(await el.files[0].text()));render();document.querySelector('#save-status').textContent='Backup imported. Your trophies, counters, notes and spoiler setting are restored.';}
  catch(error) {document.querySelector('#save-status').textContent=`Import not applied: ${error.message}`;}
 }
});
if(!location.hash) history.replaceState(null,'','#/checklist');
render();
