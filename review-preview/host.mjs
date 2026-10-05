import {AppBridge,PostMessageTransport} from '@modelcontextprotocol/ext-apps/app-bridge';
async function boot(){
const frame=document.getElementById('view');let bridge;
window.previewReceipts={downloads:[],contexts:[],ready:false};
const params=new URLSearchParams(location.search);const host=params.get('host')??'OpenAI mock';const id=params.get('starter')??'ai-rescue';
document.getElementById('starter').value=id;document.getElementById('host').value=host;
const payload=await (await fetch(id+'.json')).json();
document.getElementById('starter').addEventListener('change',e=>location.search='?starter='+e.target.value+'&host='+encodeURIComponent(host));
document.getElementById('host').addEventListener('change',e=>location.search='?starter='+id+'&host='+encodeURIComponent(e.target.value));
bridge=new AppBridge(null,{name:host,version:'fixture-v1'},{downloadFile:{},updateModelContext:{},logging:{}},{hostContext:{theme:'light',displayMode:'inline'}});
bridge.ondownloadfile=async params=>{window.previewReceipts.downloads.push(params);return {};};
bridge.onupdatemodelcontext=async params=>{window.previewReceipts.contexts.push(params);return {};};
bridge.oninitialized=async()=>{await bridge.sendToolInput({arguments:{fictionalPreview:true}});await bridge.sendToolResult({content:[{type:'text',text:payload.markdown}],structuredContent:payload});window.previewReceipts.ready=true;};
await bridge.connect(new PostMessageTransport(frame.contentWindow,frame.contentWindow));
frame.src='../shared/ui/result.html';

}
boot().catch(e=>{document.body.dataset.error=e.message;});
