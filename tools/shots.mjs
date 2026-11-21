import {spawn} from 'node:child_process';
import {mkdir, stat, readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';

const seed={earned:[2,3,4,8,9,16,21,28,35,39,44,53,55],counts:{15:137,19:11,31:42,32:23},notes:{},spoilers:true};
const key='vice-platinum-save-v2';
const server=spawn(process.execPath,['serve.ts'],{stdio:['ignore','pipe','pipe']});
let serverError='';
server.stderr.on('data',data=>serverError+=data);
let browser;
try {
 await new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>reject(new Error('Server did not start: '+serverError)),10000);
  server.stdout.on('data',data=>{if(String(data).includes('http://localhost:8080')){clearTimeout(timeout);resolve();}});
  server.on('exit',code=>{clearTimeout(timeout);reject(new Error('Server exited '+code+': '+serverError));});
 });
 await mkdir('screenshots',{recursive:true});
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:1});
 await context.addInitScript(({key,seed})=>{if(!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));},{key,seed});
 const page=await context.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://localhost:8080/#/checklist');
 await page.locator('.trophy-row').first().waitFor();
 assert.equal(await page.locator('.trophy-row').count(),55);
 assert.match(await page.locator('.earned-number').innerText(),/13 of 55/);
 assert.equal(await page.locator('.row-copy strong').filter({hasText:'Hidden trophy'}).count(),11);
 for (const [name,route] of [['1-checklist','checklist'],['2-save','save'],['3-guide','guide/37'],['4-roadmap','roadmap']]) {
  await page.goto('http://localhost:8080/#/'+route);
  await page.locator('h1').waitFor();
  await page.evaluate(()=>document.fonts.ready);
  if(route==='save') {
   for(const selector of ['.save-summary','#export','#import']) {
    const box=await page.locator(selector).boundingBox();
    assert.ok(box&&box.y>=0&&box.y+box.height<=800,selector+' must fit on the first screen');
   }
   assert.match(await page.locator('.save-summary').innerText(),/4 counted trophies in progress/);
  }
  if(route==='guide/37') {
   for(const selector of ['.guide-prose','.watch-out','.sources']) {
    const box=await page.locator(selector).boundingBox();
    assert.ok(box&&box.y+box.height<=800,selector+' must be visible');
   }
  }
  let quality=82;
  const file=`screenshots/${name}.jpg`;
  let bytes;
  do {await page.screenshot({path:file,type:'jpeg',quality,fullPage:false});bytes=(await stat(file)).size;quality-=8;} while(bytes>262144&&quality>=18);
  assert.ok(bytes<=262144,'Screenshot exceeds the byte cap');
  const jpeg=await readFile(file);
  let dimensions;
  for(let offset=2;offset<jpeg.length;) {
   assert.equal(jpeg[offset],0xff,'Expected JPEG marker');
   const marker=jpeg[offset+1],length=jpeg.readUInt16BE(offset+2);
   if([0xc0,0xc1,0xc2].includes(marker)) {
    dimensions={width:jpeg.readUInt16BE(offset+7),height:jpeg.readUInt16BE(offset+5)};
    break;
   }
   offset+=2+length;
  }
  assert.deepEqual(dimensions,{width:1280,height:800});
  console.log(`${file}: ${bytes} bytes · ${dimensions.width}×${dimensions.height}`);
 }
 // Exercise the live UI in a separate record after producing the seeded captures.
 await page.goto('http://localhost:8080/#/checklist');
 await page.locator('[data-kind="missable"]').click();
 assert.equal(await page.locator('.trophy-row').count(),4);
 await page.locator('[data-kind="all"]').click();
 await page.locator('#search').fill('Cunning Stunts');
 assert.equal(await page.locator('.trophy-row').count(),1);
 await page.locator('#search').fill('');
 await page.locator('#grade').selectOption('silver');
 assert.equal(await page.locator('.trophy-row').count(),6);
 await page.locator('#grade').selectOption('all');
 await page.locator('#unearned').check();
 assert.equal(await page.locator('.trophy-row').count(),42);
 await page.locator('.trophy-row').first().locator('.medal').click();
 await page.waitForURL('**/#/guide/1');
 await page.goto('http://localhost:8080/#/guide/15');
 await page.locator('[data-count-step="1"]').click();
 assert.equal(await page.locator('#count').inputValue(),'138');
 await page.locator('#count').fill('140');
 await page.locator('#notes').fill('Test route and checkpoint');
 await page.locator('[data-earn="15"]').check();
 await page.reload();
 assert.equal(await page.locator('#count').inputValue(),'140');
 assert.equal(await page.locator('#notes').inputValue(),'Test route and checkpoint');
 assert.equal(await page.locator('[data-earn="15"]').isChecked(),true);
 await page.goto('http://localhost:8080/#/save');
 const downloadPromise=page.waitForEvent('download');
 await page.locator('#export').click();
 const download=await downloadPromise;
 const saved=JSON.parse(await readFile(await download.path(),'utf8'));
 assert.equal(saved.notes[15],'Test route and checkpoint');
 assert.equal(saved.counts[15],140);
 assert.ok(saved.earned.includes(15));
 await page.locator('#import').setInputFiles({name:'invalid.json',mimeType:'application/json',buffer:Buffer.from('{"earned":[]}')});
 assert.match(await page.locator('#save-status').innerText(),/Import not applied/);
 assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).earned.length,key),14);
 await page.locator('#import').setInputFiles({name:'restore.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(seed))});
 await page.waitForFunction(()=>document.querySelector('#save-status')?.textContent.includes('Backup imported'));
 assert.match(await page.locator('.save-big').innerText(),/13 of 55/);
 await page.locator('.save-settings [data-action="spoilers"]').uncheck();
 await page.goto('http://localhost:8080/#/guide/48');
 assert.equal(await page.locator('h1').innerText(),'Actions Speak Louder');
 await page.goto('http://localhost:8080/#/save');
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#reset').click();
 assert.match(await page.locator('.save-big').innerText(),/0 of 55/);
 await page.setViewportSize({width:390,height:844});
 for(const route of ['checklist','save','guide/37','roadmap','missables','next']) {
  await page.goto('http://localhost:8080/#/'+route);
  await page.locator('h1').waitFor();
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Mobile overflow on '+route);
 }
 assert.deepEqual(errors,[]);
 console.log('UI checks passed: filters, spoiler shield, persistence, counters, notes, export/import, invalid-import protection, reset, all mobile routes; no browser errors.');
} finally {
 if(browser)await browser.close();
 server.kill('SIGTERM');
}
