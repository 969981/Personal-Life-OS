import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const importer=fileURLToPath(new URL('./import-photo.mjs',import.meta.url));
const preparer=fileURLToPath(new URL('../../../scripts/prepare-photos.mjs',import.meta.url));
const repoGallery=fileURLToPath(new URL('../public/_gallery/',import.meta.url));

test('photo import strips metadata and public build excludes private images',async (t)=>{
  const tmp=await mkdtemp(join(tmpdir(),'life-os-photos-'));
  const vault=join(tmp,'vault');
  t.after(async()=>{await rm(tmp,{recursive:true,force:true});await rm(repoGallery,{recursive:true,force:true});});
  const original=join(tmp,'original.jpg');
  await sharp({create:{width:50,height:50,channels:3,background:'#335577'}})
    .jpeg().withMetadata().toFile(original);
  const run=(script,argv)=>spawnSync(process.execPath,[script,...argv],{
    env:{...process.env,LIFE_OS_VAULT_DIR:vault,LIFE_OS_PRIVATE_BUILD:''},encoding:'utf8'
  });
  const imported=run(importer,['--file',original,'--title','安全测试','--date','2026-11-13']);
  assert.equal(imported.status,0,imported.stderr);
  const imageName=(await readdir(join(vault,'Photo-Media')))[0];
  const image=join(vault,'Photo-Media',imageName);
  const meta=await sharp(image).metadata();
  assert.equal(meta.format,'webp');
  assert.equal(meta.exif,undefined);
  const noteName=(await readdir(join(vault,'Photos')))[0];
  const note=await readFile(join(vault,'Photos',noteName),'utf8');
  assert.match(note,/visibility: private/);
  const publicBuild=run(preparer,[]);
  assert.equal(publicBuild.status,0,publicBuild.stderr);
  assert.equal((await readdir(repoGallery)).length,0,'must not copy private photos into public gallery');
  const privateDev=run(preparer,['--include-private','--trusted-local-preview']);
  assert.equal(privateDev.status,0,privateDev.stderr);
  await access(join(repoGallery,imageName));
});
