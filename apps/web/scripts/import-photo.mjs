// Re-encodes imported media to WebP, removing source EXIF/GPS by default.
// Requires sharp installed in apps/web. Never copies original media into public/.
import sharp from 'sharp';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomUUID, createHash } from 'node:crypto';
import { join, resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const args={};
for(let i=2;i<process.argv.length;i++) if(process.argv[i]?.startsWith('--')) args[process.argv[i].slice(2)]=process.argv[++i] ?? '';
if(!args.file) {
  console.error('Usage: npm run photos:import -- --file /path/picture.jpg [--title "标题"] [--date 2026-11-13]');
  process.exit(2);
}
const source=resolve(args.file);
const raw=await readFile(source);
if(raw.length>50*1024*1024) throw new Error('Image is larger than 50 MB limit.');
const metadata=await sharp(raw,{failOn:'error',limitInputPixels:40000000}).metadata();
if(!['jpeg','png','webp','heif','tiff','avif'].includes(metadata.format)) throw new Error('Unsupported raster image format.');
if(!metadata.width || !metadata.height) throw new Error('Invalid image dimensions.');
const vault=resolve(process.env.LIFE_OS_VAULT_DIR ?? fileURLToPath(new URL('../../../vault/',import.meta.url)));
const date=/^\d{4}-\d{2}-\d{2}$/.test(args.date??'') ? args.date : new Date().toISOString().slice(0,10);
const title=(args.title ?? '一张值得保存的照片').trim().slice(0,80);
const identity=createHash('sha256').update(raw).digest('hex').slice(0,20);
const photoName=identity+'.webp';
const photoDir=join(vault,'Photo-Media');
const noteDir=join(vault,'Photos');
await mkdir(photoDir,{recursive:true});
await mkdir(noteDir,{recursive:true});
const optimized=await sharp(raw,{failOn:'error',limitInputPixels:40000000})
  .rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true})
  .webp({quality:82,effort:4}).toBuffer();
try { await writeFile(join(photoDir,photoName),optimized,{flag:'wx',mode:0o600}); }
catch(error) { if(error.code!=='EEXIST') throw error; }
const quote=(value)=>JSON.stringify(String(value).replaceAll('\n',' ').replaceAll('\r',' '));
const note=[
  '---',
  'title: '+quote(title),
  'type: photo',
  'date: '+quote(date),
  'summary: '+quote('照片记录 · '+date),
  'visibility: private',
  'photo_file: '+quote(photoName),
  'tags: [photography]',
  '---',
  '',
  '# '+title.replaceAll('\n',' '),
  '',
  '这张照片已被转码为 WebP，来源文件保持不变。相册默认不公开。',
  '',
].join('\n');
const target=join(noteDir,date+'-'+identity+'.md');
try { await writeFile(target,note,{flag:'wx',mode:0o600}); }
catch(error) { if(error.code!=='EEXIST') throw error; }
console.log('Private photo imported: '+target);
console.log('Re-encoded WebP: '+join(photoDir,photoName));
console.log('Original EXIF/location metadata is not included in the generated WebP.');
