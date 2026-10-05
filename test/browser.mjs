import {chromium} from 'playwright-core';import assert from 'node:assert/strict';import {mkdirSync,readFileSync,writeFileSync} from 'node:fs';
const browser=await chromium.launch({executablePath:'/home/michael/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
mkdirSync('release/browser-evidence',{recursive:true});const receipt=[];
try{for(const host of ['OpenAI mock','Claude mock'])for(const id of ['ai-rescue','workflow-test','brand-velocity','website-enquiry']){
 const context=await browser.newContext({viewport:{width:1000,height:900},permissions:['clipboard-read','clipboard-write']});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4361/review-preview/?starter='+id+'&host='+encodeURIComponent(host));await page.waitForFunction(()=>window.previewReceipts.ready);const frame=page.frameLocator('#view');
 await frame.locator('#edit-panel summary').click();await frame.locator('#editor').waitFor();const text=await frame.locator('#editor').inputValue();assert.ok(text.includes('## Next tests'));
 // Keyboard edit, real clipboard and host-mediated embedded Markdown download.
 await frame.locator('#editor').focus();await page.keyboard.press('Control+End');await page.keyboard.type('\nUser review note: next test pending.');assert.ok((await frame.locator('#status').textContent()).includes('unverified'));
 await frame.locator('#copy').click();assert.ok((await page.evaluate(()=>navigator.clipboard.readText())).includes('User review note'));
 await frame.locator('#download').click();await page.waitForFunction(()=>window.previewReceipts.downloads.length===1);assert.ok((await page.evaluate(()=>window.previewReceipts.downloads[0].contents[0].resource.text)).includes('User review note'));
 await frame.locator('#share').click();await page.waitForFunction(()=>window.previewReceipts.contexts.length===1);assert.ok((await page.evaluate(()=>window.previewReceipts.contexts[0].content[0].text)).includes('unverified'));
 await frame.locator('#edit-panel summary').click();
 await frame.locator('#useful').click();await page.waitForFunction(()=>window.previewReceipts.feedback.length===1);const signal=await page.evaluate(()=>window.previewReceipts.feedback[0]);assert.equal(signal.arguments.feedback.useful,true);assert.deepEqual(Object.keys(signal.arguments),['feedback']);assert.deepEqual(Object.keys(signal.arguments.feedback).sort(),['id','useful']);
 // Cross-host rendering uses the same shared view. Screenshot and keyboard are actual browser evidence, not host-install evidence.
 await page.screenshot({path:`release/browser-evidence/${id}-${host.startsWith('OpenAI')?'openai':'claude'}.png`,fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:`release/browser-evidence/${id}-${host.startsWith('OpenAI')?'openai':'claude'}-mobile.png`,fullPage:true});
 const overflow=await frame.locator('body').evaluate(el=>el.scrollWidth>el.clientWidth);assert.equal(overflow,false);
 const buttons=frame.locator('button');for(let i=0;i<await buttons.count();i++){if(await buttons.nth(i).isVisible()){const box=await buttons.nth(i).boundingBox();assert.ok(box.height>=44);}}
 // Printing: verify the print CSS and produce a PDF from the actual result view.
 const view=page.frames().find(f=>f.url().endsWith('/shared/ui/result.html'));await page.emulateMedia({media:'print'});assert.equal(await frame.locator('#editor').isVisible(),false);assert.equal(await frame.locator('#print-text').isVisible(),true);
 const printPage=await context.newPage();await printPage.goto('http://127.0.0.1:4361/shared/ui/result.html');await printPage.evaluate(data=>window.starterPreview.show(data),JSON.parse(readFileSync('review-preview/'+id+'.json','utf8')));await printPage.pdf({path:`release/browser-evidence/${id}.pdf`,format:'A4',printBackground:true});
 assert.deepEqual(errors,[]);receipt.push({host,id,editing:'pass',clipboard:'pass',hostMarkdownDownload:'pass',anonymousUsefulSignal:'pass',explicitShare:'pass',mobile:'pass',printLayout:'pass',keyboardEdit:'pass',realHostInstall:'not_run'});await context.close();
}
// Legacy OpenAI output adapter and malicious text are tested without the MCP bridge.
const p=await browser.newPage();await p.goto('http://127.0.0.1:4361/shared/ui/result.html');await p.evaluate(()=>{window.dispatchEvent(new CustomEvent('openai:set_globals',{detail:{globals:{toolOutput:{markdown:'<img src=x onerror="window.leaked=1">\n## Next tests',result:{title:'Unsafe text sample',decision:'hold',summary:'',evidence:[]}}}}}));});assert.equal(await p.locator('img').count(),0);assert.ok((await p.locator('#editor').inputValue()).includes('<img'));
writeFileSync('release/browser-evidence/receipt.json',JSON.stringify({mode:'mock-host protocol browser test; not host acceptance',cases:receipt,legacyOpenAIAdapter:'pass',sourceHtmlInjection:'pass'},null,2));console.log(JSON.stringify({browserCases:receipt.length,legacyAdapter:'pass',injection:'pass',hostInstallation:'not_run'}));
}finally{await browser.close();}
