const response = await fetch('/data/trophies.json');
if (!response.ok) throw new Error('The local trophy catalog could not be loaded.');
export const trophies = (await response.json()).trophies;
export const kinds = {story:'Story', side:'Side missions', activities:'Activities', collectibles:'Collectibles', feats:'Feats & crimes'};
export const grades = ['platinum','gold','silver','bronze'];
export const stages = [
 {name:'Story', tip:'Keep branching saves. Clear Ocean Beach early and the VCIA departure before closing its story window.', ids:[2,3,4,5,6,7,8,9,10,11,12,13,37,44,47,48,49]},
 {name:'Strangers & strands', tip:'Finish contact chains, count eight completed strands, then beat Cal at fishing.', ids:[22,23,24,25,26,27,29,20]},
 {name:'Activities', tip:'Survey each activity, then build distinct wins and challenge totals in focused sessions.', ids:[15,16,17,18,19,21,32,46,51]},
 {name:'Collect & explore', tip:'Sweep Leonida by region: complete three card sets, 100 WAiNK spots, 100 discoveries and ten registrations.', ids:[28,30,31,35,42,55]},
 {name:'Money & mayhem', tip:'Prepare escapes first. Combine robbery cleanup with laundering, shop spending and garage savings.', ids:[33,34,36,38,39,40,41,43,45,50,52,53,54]},
 {name:'Completion', tip:'Audit the game’s own 100% checklist, then confirm every remaining medal for the platinum.', ids:[14,1]}
];
export const trophy = id => trophies.find(t => t.id === Number(id));
export const ordered = stages.flatMap(s => s.ids.map(trophy));
