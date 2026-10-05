import {build} from 'esbuild';import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
const bundle=await build({entryPoints:['shared/ui/app.mjs'],bundle:true,write:false,format:'iife',minify:true,target:'es2022'});
const html=readFileSync('shared/ui/template.html','utf8').replace('/* BUNDLE */',()=>bundle.outputFiles[0].text.replaceAll('</script','<\/script'));
writeFileSync('shared/ui/result.html',html);
for(const host of ['openai','claude'])for(const id of ['ai-rescue','workflow-test','brand-velocity','website-enquiry']){const p=`plugins/${host}/${id}/ui`;mkdirSync(p,{recursive:true});writeFileSync(p+'/result.html',html);}
console.log('Built one shared view into eight candidate packages.');
