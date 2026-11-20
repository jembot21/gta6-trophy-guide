export const kinds = { all: 'All', story: 'Story', side: 'Side missions', activities: 'Activities', collectibles: 'Collectibles', feats: 'Feats & crimes', missable: 'Missable' };
export const grades = ['platinum', 'gold', 'silver', 'bronze'];
export const stages = [
  { name: 'Story', strategy: 'Play the chapters in order. Keep separate saves before the airport, early beats and decisions.', ids: [2,3,4,5,6,7,8,9,10,11,37,12,13,44,47,48,49] },
  { name: 'Strangers & strands', strategy: 'Finish contact strands, track eight completed strands, then beat Cal at fishing.', ids: [22,23,24,25,26,27,29,20] },
  { name: 'Activities', strategy: 'Survey every activity, then build stunt, race and challenge totals in small sessions.', ids: [15,16,17,18,19,21,32,46,51] },
  { name: 'Collect & explore', strategy: 'Sweep by region: meditation, three card sets, 100 WAiNK spots and 100 vehicle discoveries.', ids: [28,30,31,35,42,55] },
  { name: 'Money & mayhem', strategy: 'Prepare escapes, save for garages, then clear crime feats and the two money targets.', ids: [33,34,36,38,39,40,41,43,45,50,52,53,54] },
  { name: 'Completion', strategy: 'Audit the in-game 100% record, finish remaining requirements, then verify all 54 for platinum.', ids: [14,1] },
];
export async function loadTrophies() {
  const response = await fetch('/data/trophies.json');
  if (!response.ok) throw new Error('The local trophy list could not be opened.');
  const data = await response.json();
  return data.trophies;
}
