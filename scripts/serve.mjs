import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const args=process.argv.slice(2),port=Number(args[args.indexOf('--port')+1])||8080,host=args.includes('--host')?args[args.indexOf('--host')+1]:'127.0.0.1';
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png','.svg':'image/svg+xml'};
http.createServer(async(req,res)=>{try{const p=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve('.','.'+(p.endsWith('/')?p+'index.html':p));if(!file.startsWith(process.cwd()+path.sep))throw Error();res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end('Not found');}}).listen(port,host,()=>console.log(`http://${host}:${port}`));
