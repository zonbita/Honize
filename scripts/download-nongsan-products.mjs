import { createWriteStream } from 'fs';
import { mkdir } from 'fs/promises';
import { pipeline } from 'stream/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public/images/Demo/NongSan/products');
await mkdir(outDir, { recursive: true });

const p = (id) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=640&h=640&fit=crop`;

/** Pexels photo id per product file — each id chosen for food type variety */
const items = {
  'ca-hoi.jpg': p(248444),
  'tom-hum.jpg': p(566345),
  'bach-tuoc.jpg': p(1267320),
  'so-diep.jpg': p(1431335),
  'cua-hoang-de.jpg': p(724536),
  'tom-su.jpg': p(566566),
  'ca-loc.jpg': p(725991),
  'muc-ong.jpg': p(5737680),
  'ngheu.jpg': p(1431335),
  'ca-thu.jpg': p(725997),
  'nho-xanh.jpg': p(230693),
  'cherry.jpg': p(70746),
  'kiwi.jpg': p(867933),
  'le.jpg': p(102104),
  'xa-lach.jpg': p(2255935),
  'cai-ngot.jpg': p(1300975),
  'bi-dao.jpg': p(1435904),
  'thit-bo.jpg': p(361184),
  'thit-ga.jpg': p(60616),
  'suon-heo.jpg': p(769542),
  'ba-chi-bo.jpg': p(769289),
  'yen-mach.jpg': p(115740),
  'rau-dong-lanh.jpg': p(143133),
  'ngu-coc.jpg': p(793759),
  'thanh-long.jpg': p(5946077),
  'xoai.jpg': p(2339171),
  'dua-hau.jpg': p(1313267),
  'chuoi.jpg': p(61127),
  'sua-tuoi.jpg': p(236010),
  'nuoc-ep-cam.jpg': p(162763),
  'sua-hat.jpg': p(416471),
  'matcha.jpg': p(162754),
};

for (const [file, url] of Object.entries(items)) {
  const dest = join(outDir, file);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 HonizeDemo/1.0' },
      redirect: 'follow',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await pipeline(res.body, createWriteStream(dest));
    console.log('OK', file);
  } catch (err) {
    console.error('FAIL', file, err.message);
  }
}
