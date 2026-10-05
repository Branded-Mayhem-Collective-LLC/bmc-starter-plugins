const starters=new Set(['ai-rescue','workflow-test','brand-velocity','website-enquiry']);
export function preparedConversation(starter,platform){
 if(!starters.has(starter)||!['chatgpt','claude'].includes(platform))throw Error('Unknown starter/platform');
 const text=`Help me complete the ${starter} starter check. Ask for one permitted source and explain any missing evidence. If the starter plugin is installed, use its focused tools; otherwise guide me in this conversation and label the result as conversation-only.`;
 const u=new URL(platform==='chatgpt'?'https://chatgpt.com/':'https://claude.ai/new');u.searchParams.set(platform==='chatgpt'?'q':'q',text);return {label:platform==='chatgpt'?'Open in ChatGPT':'Open in Claude',url:u.href,kind:'prepared-conversation',requiresHostVerification:true};
}
export function resourceArrival(resource,starter,platform){
 if(!starters.has(starter)||!['chatgpt','claude'].includes(platform))throw Error('Unknown starter/platform');const u=new URL(resource);if(u.protocol!=='https:'||!['br8n.io','8gnc.io'].includes(u.hostname)||u.search||u.hash||u.username||u.password)throw Error('Resource scope');
 u.searchParams.set('utm_source',platform);u.searchParams.set('utm_medium','starter');u.searchParams.set('utm_campaign','bmc-starters');u.searchParams.set('utm_content',starter);return u.href;
}
