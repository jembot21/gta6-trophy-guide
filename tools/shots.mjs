import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { readFile, stat, readdir, unlink } from 'node:fs/promises';
import assert from 'node:assert/strict';

const seed = { earned:[2,3,4,8,9,16,21,28,35,39,44,53,55], counts:{15:137,19:11,31:42,32:23}, notes:{}, spoilers:true };
const key = 'vice-platinum-v1';
const data = JSON.parse(await readFile('app/data/trophies.json','utf8')).trophies;
const original = JSON.parse(execFileSync('git',['show','HEAD:app/data/trophies.json'],{encoding:'utf8'})).trophies;
assert.equal(data.length,55);
for (const t of data) {
  const before = original.find(item => item.id === t.id);
  for (const field of ['id','name','description','grade']) assert.equal(t[field], before[field], `${t.id}: ${field} changed`);
  const words = t.guide.split(/\s+/).length;
  assert.ok(words >= 45 && words <= 90, `Guide ${t.id}: ${words} words`);
  assert.ok(t.sources.includes('Exophase') && t.sources.includes('PSNProfiles'));
}
assert.deepEqual(data.filter(t => t.missable).map(t => t.id),[37,44,48,49]);
const stageIds = [[2,3,4,5,6,7,8,9,10,11,12,13,37,44,47,48,49],[22,23,24,25,26,27,29,20],[15,16,17,18,19,21,32,46,51],[28,30,31,35,42,55],[33,34,36,38,39,40,41,43,45,50,52,53,54],[14,1]];
stageIds.forEach((ids,i) => ids.forEach(id => assert.equal(data.find(t => t.id === id).stage,i+1)));
assert.deepEqual(stageIds.flat().sort((a,b)=>a-b),Array.from({length:55},(_,i)=>i+1));
const expectedTargets = {15:250,19:20,25:8,30:3,31:100,32:50,34:3,35:100,40:5,52:250000,53:100000,55:10};
for (const t of data) {
  const expectedKind = t.id === 37 ? 'feats' : t.id === 20 || t.id === 14 ? 'activities' : ['story','side','activities','collectibles','feats','story'][t.stage-1];
  assert.equal(t.kind,expectedKind,`Kind for ${t.id}`);
  assert.equal(t.target,expectedTargets[t.id],`Target for ${t.id}`);
}
console.log('Data verified: 55 exact official entries, original cited guides, six stages, four missable flags.');

const server = spawn(process.execPath,['serve.ts'],{stdio:['ignore','pipe','pipe']});
let browser;
const errors = [];
try {
  await new Promise((resolve,reject) => {
    const timeout = setTimeout(() => reject(new Error('Server startup timed out')),10000);
    server.stdout.on('data',chunk => { if (String(chunk).includes('http://localhost:8080')) {clearTimeout(timeout);resolve();} });
    server.on('error',reject);
    server.on('exit',code => { if(code) reject(new Error(`Server exited ${code}`)); });
  });
  browser = await chromium.launch({headless:true});
  const context = await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
  await context.addInitScript(({key,seed}) => { if(!localStorage.getItem(key)) localStorage.setItem(key,JSON.stringify(seed)); },{key,seed});
  const page = await context.newPage();
  page.on('pageerror',error => errors.push(error.message));
  page.on('request',request => assert.ok(request.url().startsWith('http://localhost:8080/'),'Unexpected external request'));
  await page.goto('http://localhost:8080/#/checklist');
  await page.waitForSelector('.trophy-row');
  assert.equal(await page.locator('.earned-count').innerText(),'13 of 55');
  assert.equal(await page.locator('.trophy-row').count(),55);
  assert.equal(await page.locator('.trophy-row.earned').count(),13);
  for(const file of await readdir('screenshots')) if(/\.(jpg|jpeg|png)$/i.test(file)) await unlink(`screenshots/${file}`);
  for(const [file,route] of [['1-checklist.jpg','checklist'],['2-guide.jpg','guide/37'],['3-roadmap.jpg','roadmap'],['4-missables.jpg','missables']]) {
    await page.goto(`http://localhost:8080/#/${route}`);
    await page.waitForSelector(route === 'checklist' ? '.trophy-row' : route.startsWith('guide') ? '.guide-paper' : route === 'roadmap' ? '.stage-card' : '.missable-card');
    await page.evaluate(() => document.fonts.ready);
    if(route === 'guide/37') {
      assert.ok(await page.locator('.sources').isVisible());
      assert.ok(await page.locator('.watch-out').isVisible());
      assert.ok(await page.locator('.sources').evaluate(el => el.getBoundingClientRect().bottom <= 800));
    }
    const path = `screenshots/${file}`;
    let size;
    for(let quality=82;quality>=32;quality-=10) {
      await page.screenshot({path,type:'jpeg',quality});
      size=(await stat(path)).size;
      if(size<=262144) break;
    }
    assert.ok(size<=262144,`${file} exceeds size limit`);
    // Read actual encoded dimensions via Chromium decoding, without serving the screenshot directory.
    const bytes = await readFile(path);
    const actual = await page.evaluate(async base64 => {
      const image=new Image();image.src=`data:image/jpeg;base64,${base64}`;await image.decode();return [image.naturalWidth,image.naturalHeight];
    },bytes.toString('base64'));
    assert.deepEqual(actual,[1280,800]);
    console.log(`${path}: ${size} bytes · ${actual.join('×')} · quality ≤82`);
  }

  await page.goto('http://localhost:8080/#/checklist');
  await page.getByRole('button',{name:'Missable',exact:true}).click();
  assert.equal(await page.locator('.trophy-row').count(),4);
  await page.getByRole('button',{name:'All',exact:true}).click();
  await page.locator('#grade').selectOption('silver');
  assert.equal(await page.locator('.trophy-row').count(),6);
  await page.locator('#grade').selectOption('');
  await page.locator('#search').fill('Vice City, Baby');
  assert.equal(await page.locator('.trophy-row').count(),0,'Spoiler search leaked a hidden name');
  await page.locator('#search').fill('');
  await page.locator('#unearned').check();
  assert.equal(await page.locator('.trophy-row').count(),42);
  await page.goto('http://localhost:8080/#/guide/5');
  assert.equal(await page.locator('.guide-paper h2').innerText(),'Hidden trophy');
  await page.locator('[data-earned="5"]').check();
  assert.equal(await page.locator('.guide-paper h2').innerText(),'Vice City, Baby!');
  await page.reload();
  await page.waitForSelector('.guide-earned input:checked');
  await page.goto('http://localhost:8080/#/guide/15');
  await page.locator('[data-delta="1"]').click();
  assert.equal(await page.locator('#count').inputValue(),'138');
  await page.locator('#count').fill('999');
  await page.locator('#count').dispatchEvent('change');
  assert.equal(await page.locator('#count').inputValue(),'250');
  await page.locator('#notes').fill('Test note: verify persistence <safe>');
  await page.reload();
  await page.waitForSelector('#notes');
  assert.equal(await page.locator('#notes').inputValue(),'Test note: verify persistence <safe>');
  await page.goto('http://localhost:8080/#/next');
  assert.equal(await page.locator('.next-item').count(),5);
  assert.equal(await page.locator('.next-item .row-link').first().getAttribute('href'),'#/guide/37');
  await page.goto('http://localhost:8080/#/save');
  await page.locator('main [data-spoilers]').uncheck();
  const downloadEvent=page.waitForEvent('download');
  await page.locator('#export').click();
  const download=await downloadEvent;
  const exported=JSON.parse(await readFile(await download.path(),'utf8'));
  assert.equal(exported.spoilers,false);
  assert.equal(exported.counts['15'],250);
  assert.ok(exported.earned.includes(5));
  await page.locator('#import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"earned":[]}')});
  await page.waitForFunction(() => document.querySelector('#import-status').textContent.includes('Import not applied'));
  assert.match(await page.locator('#import-status').innerText(),/Import not applied/);
  await page.locator('#import').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(seed))});
  await page.waitForFunction(() => JSON.parse(localStorage.getItem('vice-platinum-v1')).earned.length === 13);
  assert.equal(await page.locator('.earned-count').innerText(),'13 of 55');
  await page.locator('#reset').click();
  await page.locator('#cancel-reset').click();
  assert.equal(await page.locator('.earned-count').innerText(),'13 of 55');
  await page.locator('#reset').click();
  await page.locator('#confirm-reset').click();
  assert.equal(await page.locator('.earned-count').innerText(),'0 of 55');
  await page.setViewportSize({width:390,height:844});
  for(const route of ['checklist','guide/37','roadmap','missables','next','save']) {
    await page.goto(`http://localhost:8080/#/${route}`);
    await page.waitForTimeout(70);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),`Mobile overflow on ${route}`);
  }
  assert.deepEqual(errors,[]);
  console.log('Browser verified: filters, spoiler-safe search/reveal, persistence, bounded counts, notes, next queue, JSON export/import, invalid import, reset/cancel, six mobile routes, no page errors.');
} finally { await browser?.close(); server.kill(); }
