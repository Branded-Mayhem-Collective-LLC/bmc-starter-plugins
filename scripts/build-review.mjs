import {build} from 'esbuild';await build({entryPoints:['review-preview/host.mjs'],bundle:true,format:'iife',outfile:'review-preview/host.js',target:'es2022'});
