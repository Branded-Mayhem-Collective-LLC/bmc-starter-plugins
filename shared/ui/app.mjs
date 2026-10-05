import {App} from '@modelcontextprotocol/ext-apps';
const el=id=>document.getElementById(id);
const app=new App({name:'BMC Starter Result',version:'0.1.0'},{},{autoResize:true});
let connected=false, original='',result=null, dirty=false,pending=null;
const status=text=>{el('status').textContent=text;};
function row(parent,heading,text){const section=document.createElement('section');section.className='result-row';if(heading){const h=document.createElement('h2');h.textContent=heading;section.append(h);}const p=document.createElement('p');p.textContent=text;section.append(p);parent.append(section);return section;}
function overview(r){const container=el('assessment');container.replaceChildren();if(!r)return;
 if(r.whatWorks?.length)row(container,'What already works',r.whatWorks.map(x=>`[${x.kind}] ${x.text} (${x.evidenceRefs.join(', ')})`).join('\n'));
 for(const [i,p] of (r.priorities??[]).entries()){const section=row(container,`Priority ${i+1}`,p.action);const check=document.createElement('p');check.className='acceptance';check.textContent='Acceptance: '+p.acceptance;section.append(check);const refs=document.createElement('p');refs.className='note';refs.textContent='Evidence: '+p.evidenceRefs.join(', ')+' · Owner: '+(p.owner||'Unknown')+' · Deadline: '+(p.deadline||'Not set');section.append(refs);}
 if(r.nextTests?.length)row(container,'Next test',r.nextTests.map(t=>t.action+'\nAcceptance: '+t.acceptance).join('\n\n'));
 if(r.unknowns?.length)row(container,'Still unknown',r.unknowns.join('\n'));
}
function show(payload){
 const d=payload?.structuredContent??payload;
 if(!d?.markdown)return;
 if(dirty){pending=payload;el('replace').hidden=false;status('A new result is available. Export your edits before using the new result.');return;}
 result=d.result;document.documentElement.dataset.brand=['ai-rescue','workflow-test'].includes(result?.starter)?'br8n':'8gnc';original=d.markdown;el('title').textContent=result?.title??'Your check result';el('decision').textContent=result?.decision??'';el('summary').textContent=result?.summary??'';el('editor').value=original;el('print-text').textContent=original;
 el('evidence').textContent=(result?.evidence??[]).map(e=>`${e.id} · ${e.kind} · ${e.collectedAt}${e.url?' · '+e.url:''}`).join('\n');
 overview(result);status('Complete result ready. Edits stay in this view until you copy or export.');
}
app.ontoolresult=show;
app.onhostcontextchanged=ctx=>{if(ctx.theme)document.documentElement.dataset.theme=ctx.theme;};
// OpenAI legacy adapter reads host-provided data only; it never stores answers in widget state.
window.addEventListener('openai:set_globals',e=>show(e.detail?.globals?.toolOutput));
window.addEventListener('starter:fixture',e=>show(e.detail)); // private preview supplies fictional fixtures
el('editor').addEventListener('input',()=>{dirty=true;el('print-text').textContent=el('editor').value;status('Edited by you. These changes are unverified. The overview shows the original check; exports use your edited text.');});
el('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(el('editor').value);status('Copied Markdown.');}catch{el('editor').focus();el('editor').select();status('Select all text and copy with your keyboard.');}});
el('download').addEventListener('click',async()=>{
 const text=el('editor').value,filename=(result?.starter??'starter')+'-result.md';
 if(connected){try{const r=await app.downloadFile({contents:[{type:'resource',resource:{uri:'file:///'+filename,mimeType:'text/markdown',text}}]});if(!r.isError){status('Download requested from your host.');return;}}catch{}}
 const url=URL.createObjectURL(new Blob([text],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status('Markdown download prepared. If blocked, copy the complete text.');
});
el('print').addEventListener('click',()=>{el('print-text').textContent=el('editor').value;window.print();});
el('replace').addEventListener('click',()=>{if(pending&&window.confirm('Use the new result? Export your local edits first.')){const next=pending;pending=null;dirty=false;el('replace').hidden=true;show(next);}});
el('reset').addEventListener('click',()=>{if(!dirty||window.confirm('Replace your local edits with the original result?')){dirty=false;el('editor').value=original;el('print-text').textContent=original;status('Original result restored.');}});
el('share').addEventListener('click',async()=>{if(!connected){status('Host context sharing is unavailable; paste the Markdown into your conversation.');return;}try{await app.updateModelContext({content:[{type:'text',text:'User-edited result; changes are unverified:\n'+el('editor').value}]});status('Your edited result was explicitly shared with this conversation.');}catch{status('Sharing was unavailable. Copy and paste the text.');}});
if(window.openai?.toolOutput)show(window.openai.toolOutput);
if(window.parent!==window)app.connect().then(()=>{connected=true;}).catch(()=>status('Use the complete text result in your conversation. Host UI connection is unavailable.'));
window.starterPreview={show};
