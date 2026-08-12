const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT = path.resolve(__dirname, '..');
const ASSETS = path.join(PROJECT, '01_assets_transparentes');
const EXPORTS = path.join(PROJECT, '04_exportacoes');
const MANIFEST = path.join(PROJECT, 'manifesto-assets.json');
const LAYOUT_SVG = path.join(EXPORTS, 'ckf-banner-modular-layout-v02-refinado-escala-1-10.svg');
const LAYOUT_PNG = path.join(EXPORTS, 'ckf-banner-modular-layout-v02-refinado-7000x1000.png');

const requiredCopy = [
  'SOLUÇÕES EM MANUTENÇÃO GERAL',
  '(47) 99121-4232',
  '(47) 99913-0409',
  'CAMINHÕES E',
  'MÁQUINAS PESADAS',
  'CENTRAL DE',
  'CONCRETO',
  'REFORMA DE',
  'EQUIPAMENTOS',
  'E CHASSIS',
  'ESTRUTURAS',
  'METÁLICAS',
  'SUSPENSÃO',
  'SOLDA',
  'PREVENTIVA',
  'FREIOS',
  'HIDRÁULICA',
  'REFORMA',
  'PINTURA',
  'EMBREAGEM',
];

function fail(message) {
  throw new Error(message);
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const pngs = fs.readdirSync(ASSETS).filter(name => name.endsWith('.png')).sort();
  const svgs = fs.readdirSync(ASSETS).filter(name => name.endsWith('.svg')).sort();
  if (pngs.length !== 28 || svgs.length !== 28) fail(`Esperados 28 PNG e 28 SVG; encontrados ${pngs.length} PNG e ${svgs.length} SVG.`);
  if (manifest.assets.length !== 28) fail(`Manifesto possui ${manifest.assets.length} assets, esperado 28.`);

  const alphaFailures = [];
  for (const file of pngs) {
    const filePath = path.join(ASSETS, file);
    const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let min = 255;
    let max = 0;
    for (let i = 3; i < data.length; i += info.channels) {
      if (data[i] < min) min = data[i];
      if (data[i] > max) max = data[i];
    }
    if (min !== 0 || max !== 255) alphaFailures.push({ file, min, max });
  }
  if (alphaFailures.length) fail(`Falha de transparência: ${JSON.stringify(alphaFailures)}`);

  const svg = fs.readFileSync(LAYOUT_SVG, 'utf8');
  if (!svg.includes('width="1050mm"') || !svg.includes('height="150mm"') || !svg.includes('viewBox="0 0 10500 1500"')) {
    fail('SVG não está em escala 1:10 ou não possui viewBox final 10500x1500.');
  }
  for (const id of ['fundo', 'identidade-e-contatos', 'titulo-e-especialidades', 'faixa-de-servicos']) {
    if (!svg.includes(`id="${id}"`)) fail(`Grupo editável ausente: ${id}`);
  }
  for (const text of requiredCopy) {
    if (!svg.includes(text)) fail(`Texto exato ausente no layout: ${text}`);
  }

  const layoutMeta = await sharp(LAYOUT_PNG).metadata();
  if (layoutMeta.width !== 7000 || layoutMeta.height !== 1000) {
    fail(`Prévia deveria ser 7000x1000; encontrada ${layoutMeta.width}x${layoutMeta.height}.`);
  }

  const logo = path.join(ASSETS, 'logo-ckf-oficial-transparente.png');
  const { data: logoData, info: logoInfo } = await sharp(logo).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let yellowPixels = 0;
  let transparentPixels = 0;
  for (let i = 0; i < logoData.length; i += logoInfo.channels) {
    const r = logoData[i];
    const g = logoData[i + 1];
    const b = logoData[i + 2];
    const a = logoData[i + 3];
    if (a === 0) transparentPixels++;
    if (a > 200 && r > 200 && g > 120 && b < 60) yellowPixels++;
  }
  if (!yellowPixels || !transparentPixels) fail('Logo não preservou simultaneamente amarelo e transparência.');

  console.log(JSON.stringify({
    status: 'PASS',
    assets: { png: pngs.length, svg: svgs.length, alpha: '0..255 em todos' },
    layout: { svgScale: '1050x150 mm (1:10)', finalSize: '10500x1500 mm', png: '7000x1000 px', groups: 4 },
    exactCopyItemsChecked: requiredCopy.length,
    logo: { yellowPixels, transparentPixels },
  }, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
