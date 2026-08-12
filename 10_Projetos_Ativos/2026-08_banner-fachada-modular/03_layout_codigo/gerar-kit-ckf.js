const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const PROJECT = path.resolve(__dirname, '..');
const WORKSPACE = path.resolve(PROJECT, '..', '..');
const ASSETS = path.join(PROJECT, '01_assets_transparentes');
const PREVIEWS = path.join(PROJECT, '02_previews');
const EXPORTS = path.join(PROJECT, '04_exportacoes');

const SOURCE_LOGO = path.join(
  WORKSPACE,
  '01_Marca',
  '02_Logos',
  '03_Variacoes',
  'ckf-manutencao_logo-horizontal-com-simbolo-preto-amarelo.jpeg'
);

const C = {
  black: '#090c0d',
  black2: '#111517',
  graphite: '#202527',
  yellow: '#f6b900',
  yellow2: '#ffd33d',
  white: '#f7f7f4',
  muted: '#cfd2d1',
};

const copy = {
  title: 'SOLUÇÕES EM MANUTENÇÃO GERAL',
  phones: ['(47) 99121-4232', '(47) 99913-0409'],
  specialties: [
    { slug: 'caminhoes-maquinas-pesadas', lines: ['CAMINHÕES E', 'MÁQUINAS PESADAS'], icon: 'machines' },
    { slug: 'central-concreto', lines: ['CENTRAL DE', 'CONCRETO'], icon: 'concrete' },
    { slug: 'reforma-equipamentos-chassis', lines: ['REFORMA DE', 'EQUIPAMENTOS', 'E CHASSIS'], icon: 'reform' },
    { slug: 'estruturas-metalicas', lines: ['ESTRUTURAS', 'METÁLICAS'], icon: 'structure' },
  ],
  services: [
    { label: 'SUSPENSÃO', color: C.yellow },
    { label: 'SOLDA', color: C.yellow },
    { label: 'PREVENTIVA', color: C.yellow },
    { label: 'FREIOS', color: C.white },
    { label: 'HIDRÁULICA', color: C.white },
    { label: 'REFORMA', color: C.yellow },
    { label: 'PINTURA', color: C.yellow },
    { label: 'EMBREAGEM', color: C.yellow },
  ],
};

function mkdirs() {
  for (const dir of [ASSETS, PREVIEWS, EXPORTS]) fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function svgDoc(width, height, body, options = {}) {
  const physical = options.physical
    ? ` width="1050mm" height="150mm" data-final-width-mm="10500" data-final-height-mm="1500"`
    : ` width="${width}" height="${height}"`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"${physical} viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(options.label || 'Asset CKF Manutenção')}">
${body}
</svg>`;
}

function fontAttrs(size, fill = C.white, extra = '') {
  return `font-family="Arial Narrow, Arial, sans-serif" font-size="${size}" font-weight="700" fill="${fill}" ${extra}`;
}

function write(file, contents) {
  fs.writeFileSync(file, contents, 'utf8');
}

async function renderSvg(svg, output, width) {
  await sharp(Buffer.from(svg), { density: 144 })
    .resize({ width, withoutEnlargement: false })
    .png({ compressionLevel: 9, palette: false })
    .toFile(output);
}

async function writeAsset(name, width, height, body, pngWidth = width * 2, label = name) {
  const svg = svgDoc(width, height, body, { label });
  const svgPath = path.join(ASSETS, `${name}.svg`);
  const pngPath = path.join(ASSETS, `${name}.png`);
  write(svgPath, svg);
  await renderSvg(svg, pngPath, pngWidth);
  return { name, svg: svgPath, png: pngPath, width, height, transparent: true };
}

async function extractLogo() {
  const { data, info } = await sharp(SOURCE_LOGO).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.from(data);
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const distanceFromWhite = 255 - Math.min(r, g, b);
    const alpha = distanceFromWhite <= 38 ? 0 : distanceFromWhite >= 92 ? 255 : Math.round(((distanceFromWhite - 38) / 54) * 255);
    const isYellow = r > 145 && g > 70 && b < 135 && r > b * 1.5;
    const replacement = isYellow ? [246, 185, 0] : [247, 247, 244];
    rgba[i] = replacement[0];
    rgba[i + 1] = replacement[1];
    rgba[i + 2] = replacement[2];
    rgba[i + 3] = alpha;
  }

  const logoPath = path.join(ASSETS, 'logo-ckf-oficial-transparente.png');
  await sharp(rgba, { raw: info })
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 12 })
    .resize({ width: 3600, withoutEnlargement: false, kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.7 })
    .png({ compressionLevel: 9 })
    .toFile(logoPath);

  const meta = await sharp(logoPath).metadata();
  const b64 = fs.readFileSync(logoPath).toString('base64');
  const wrapper = svgDoc(
    meta.width,
    meta.height,
    `<image x="0" y="0" width="${meta.width}" height="${meta.height}" href="data:image/png;base64,${b64}"/>`,
    { label: 'Logo oficial CKF Manutenção' }
  );
  const wrapperPath = path.join(ASSETS, 'logo-ckf-oficial-transparente.svg');
  write(wrapperPath, wrapper);
  return {
    name: 'logo-ckf-oficial-transparente',
    svg: wrapperPath,
    png: logoPath,
    width: meta.width,
    height: meta.height,
    transparent: true,
    note: 'SVG com PNG oficial incorporado; não é vetorização em curvas.',
    b64,
  };
}

function whatsappIcon() {
  return `
  <g fill="none" stroke="${C.yellow}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="120" cy="96" r="69"/>
    <path d="M72 151 L58 179 L91 170"/>
    <path d="M86 61 C79 65 77 73 80 83 C89 112 105 130 136 141 C147 145 157 140 162 132 L151 113 C148 109 143 108 139 111 L128 119 C111 111 101 101 94 84 L101 74 C104 70 103 65 99 62 L86 61 Z" stroke-width="10"/>
  </g>`;
}

function machinesIcon() {
  return `
  <g fill="none" stroke="${C.white}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M36 118 L24 96 L33 55 L54 33 L84 49 L108 81"/>
    <path d="M33 55 L74 77 L97 110"/>
    <path d="M24 96 L16 125 L43 143 L64 132 L50 118 Z"/>
    <path d="M101 75 H149 V120 H95 L93 95 Z"/>
    <path d="M149 88 H177 V120 H149"/>
    <path d="M113 75 V55 H144 L155 88"/>
  </g>
  <g fill="none" stroke="${C.yellow}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="83" y="123" width="104" height="35" rx="18"/>
    <circle cx="106" cy="140" r="8"/><circle cx="135" cy="140" r="8"/><circle cx="164" cy="140" r="8"/>
  </g>`;
}

function concreteIcon() {
  return `
  <g fill="none" stroke="${C.white}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M33 25 H76 V117 H33 Z M29 42 H80 M29 90 H80 M33 117 L25 151 M76 117 L84 151 M33 117 L76 151 M76 117 L33 151"/>
    <path d="M37 25 L43 13 H66 L73 25" stroke="${C.yellow}"/>
    <path d="M85 108 H135 L151 127 H191 V151 H85 Z"/>
    <circle cx="110" cy="153" r="14"/><circle cx="171" cy="153" r="14"/>
    <path d="M145 100 L177 104 L188 127 H151 Z M158 108 V126 H184"/>
    <path d="M91 78 C107 62 137 66 150 85 C160 101 147 123 124 127 C104 130 87 115 84 98 C82 90 84 84 91 78 Z"/>
    <path d="M101 73 L143 119" stroke="${C.yellow}"/>
  </g>`;
}

function gearPoints(cx, cy, outer, inner, teeth = 12) {
  const pts = [];
  for (let i = 0; i < teeth * 4; i++) {
    const phase = i % 4;
    const radius = phase === 0 || phase === 3 ? outer : inner;
    const angle = -Math.PI / 2 + (i * Math.PI * 2) / (teeth * 4);
    pts.push(`${(cx + Math.cos(angle) * radius).toFixed(1)},${(cy + Math.sin(angle) * radius).toFixed(1)}`);
  }
  return pts.join(' ');
}

function reformIcon() {
  return `
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="${gearPoints(91, 91, 67, 57)}" stroke="${C.white}" stroke-width="8"/>
    <circle cx="91" cy="91" r="26" stroke="${C.white}" stroke-width="8"/>
    <path d="M96 55 C108 46 124 47 136 57 L119 72 L123 88 L139 93 L156 77 C166 93 163 113 149 126 C135 139 114 139 100 127 L67 160 C59 168 46 168 39 160 C32 153 32 141 40 133 L73 100 C64 86 65 68 76 57 C81 52 88 48 96 47 Z" fill="${C.black}" stroke="${C.yellow}" stroke-width="9"/>
  </g>`;
}

function structureIcon() {
  return `
  <g fill="none" stroke="${C.white}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path d="M25 158 V60 L112 22 L199 60 V158 M25 60 H199 M38 158 V76 H186 V158"/>
    <path d="M38 76 L62 54 L87 76 L112 48 L137 76 L162 54 L186 76" stroke="${C.yellow}"/>
    <path d="M62 54 V76 M87 76 V43 M112 48 V76 M137 76 V43 M162 54 V76" stroke="${C.yellow}"/>
    <path d="M38 112 H186"/>
  </g>`;
}

const iconBodies = {
  whatsapp: whatsappIcon(),
  machines: machinesIcon(),
  concrete: concreteIcon(),
  reform: reformIcon(),
  structure: structureIcon(),
};

function iconAt(kind, x, y, scale = 1) {
  return `<g transform="translate(${x} ${y}) scale(${scale})">${iconBodies[kind]}</g>`;
}

function specialtyAssetBody(item) {
  const lineCount = item.lines.length;
  const startY = lineCount === 2 ? 205 : 150;
  const size = lineCount === 2 ? 150 : 125;
  const leading = lineCount === 2 ? 165 : 135;
  const tspans = item.lines
    .map((line, index) => `<tspan x="430" y="${startY + index * leading}">${escapeXml(line)}</tspan>`)
    .join('');
  return `${iconAt(item.icon, 55, 145, 1.35)}
  <line x1="395" y1="85" x2="395" y2="520" stroke="${C.yellow}" stroke-width="8"/>
  <text ${fontAttrs(size)} letter-spacing="3">${tspans}</text>`;
}

function specialtyTextBody(item) {
  const lineCount = item.lines.length;
  const startY = lineCount === 2 ? 165 : 115;
  const size = lineCount === 2 ? 150 : 125;
  const leading = lineCount === 2 ? 165 : 135;
  const tspans = item.lines
    .map((line, index) => `<tspan x="20" y="${startY + index * leading}">${escapeXml(line)}</tspan>`)
    .join('');
  return `<text ${fontAttrs(size)} letter-spacing="3">${tspans}</text>`;
}

function titleBody() {
  return `<text x="20" y="222" ${fontAttrs(230)} letter-spacing="4">${escapeXml(copy.title)}</text>
  <rect x="20" y="258" width="1180" height="12" fill="${C.yellow}"/>`;
}

function phoneBody(number) {
  return `<text x="20" y="190" ${fontAttrs(180)} letter-spacing="4">${escapeXml(number)}</text>`;
}

function contactsBody() {
  return `${iconAt('whatsapp', 30, 80, 2.25)}
  <text x="610" y="250" ${fontAttrs(205)} letter-spacing="5">${escapeXml(copy.phones[0])}</text>
  <text x="610" y="500" ${fontAttrs(205)} letter-spacing="5">${escapeXml(copy.phones[1])}</text>`;
}

function servicesStripBody(fontSize = 102) {
  const slots = [0, 665, 1085, 1800, 2310, 3060, 3650, 4210];
  let body = '';
  copy.services.forEach((service, index) => {
    body += `<text x="${slots[index]}" y="125" ${fontAttrs(fontSize, service.color)} letter-spacing="1">${escapeXml(service.label)}</text>`;
    if (index < copy.services.length - 1) {
      body += `<circle cx="${slots[index + 1] - 54}" cy="92" r="9" fill="${C.white}"/>`;
    }
  });
  return body;
}

function serviceAssetBody(service) {
  return `<text x="20" y="135" ${fontAttrs(125, service.color)} letter-spacing="2">${escapeXml(service.label)}</text>`;
}

function dividerBody() {
  return `<path d="M45 0 V590 L175 750 L45 910 V1500" fill="none" stroke="${C.yellow}" stroke-width="24" stroke-linejoin="miter"/>`;
}

function specialtyCard(item, x, y, w, h, options = {}) {
  const primary = options.primary;
  const iconScale = primary ? 1.65 : 1.15;
  const iconX = primary ? x + 110 : x + w / 2 - 138;
  const iconY = primary ? y + 190 : y + 60;
  const fill = primary ? '#121719' : '#0d1112';
  const stroke = primary ? C.yellow : '#303638';
  const strokeWidth = primary ? 11 : 5;
  let body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="32" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
  body += iconAt(item.icon, iconX, iconY, iconScale);

  if (primary) {
    body += `<text x="${x + 590}" y="${y + 250}" ${fontAttrs(188)} letter-spacing="3">
      <tspan x="${x + 590}" y="${y + 250}">${escapeXml(item.lines[0])}</tspan>
      <tspan x="${x + 590}" y="${y + 465}">${escapeXml(item.lines[1])}</tspan>
    </text>`;
    body += `<text x="${x + 595}" y="${y + 585}" ${fontAttrs(72, C.yellow)} letter-spacing="5">ESPECIALIDADE PRINCIPAL</text>`;
  } else {
    const startY = item.lines.length === 3 ? y + 405 : y + 440;
    const size = item.lines.length === 3 ? 91 : 104;
    const leading = item.lines.length === 3 ? 100 : 116;
    const center = x + w / 2;
    const lines = item.lines.map((line, i) => `<tspan x="${center}" y="${startY + i * leading}">${escapeXml(line)}</tspan>`).join('');
    body += `<text text-anchor="middle" ${fontAttrs(size)} letter-spacing="1">${lines}</text>`;
    body += `<rect x="${x + w / 2 - 80}" y="${y + h - 36}" width="160" height="8" fill="${C.yellow}"/>`;
  }
  return body;
}

function fullLayoutV1(logoB64) {
  const logoY = 155;
  const rightX = 3600;
  const primary = copy.specialties[0];
  const secondaries = copy.specialties.slice(1);

  let body = `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#07090a"/>
      <stop offset="0.55" stop-color="#111516"/>
      <stop offset="1" stop-color="#07090a"/>
    </linearGradient>
    <pattern id="lines" width="120" height="120" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
      <line x1="0" y1="0" x2="0" y2="120" stroke="#ffffff" stroke-opacity="0.025" stroke-width="2"/>
    </pattern>
  </defs>
  <rect width="10500" height="1500" fill="url(#bg)"/>
  <rect width="10500" height="1500" fill="url(#lines)"/>
  <rect x="0" y="0" width="32" height="1500" fill="${C.yellow}"/>
  <rect x="0" y="0" width="10500" height="18" fill="${C.yellow}"/>
  <image x="250" y="${logoY}" width="2800" height="640" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${logoB64}"/>
  ${iconAt('whatsapp', 235, 830, 2.25)}
  <text x="850" y="1050" ${fontAttrs(225)} letter-spacing="5">${escapeXml(copy.phones[0])}</text>
  <text x="850" y="1320" ${fontAttrs(225)} letter-spacing="5">${escapeXml(copy.phones[1])}</text>
  ${dividerBody().replaceAll('45', '3460').replace('175', '3590')}
  <text x="${rightX + 170}" y="235" ${fontAttrs(255)} letter-spacing="4">${escapeXml(copy.title)}</text>
  <rect x="${rightX + 170}" y="285" width="1210" height="12" fill="${C.yellow}"/>
  ${specialtyCard(primary, rightX + 170, 365, 2550, 745, { primary: true })}`;

  const cardX = [rightX + 2855, rightX + 4080, rightX + 5305];
  secondaries.forEach((item, i) => {
    body += specialtyCard(item, cardX[i], 365, 1110, 745, { primary: false });
  });

  body += `<g transform="translate(${rightX + 185} 1255) scale(1.12)">${servicesStripBody(102)}</g>
  <rect x="${rightX + 170}" y="1195" width="6580" height="3" fill="#3a3f40"/>
  <text x="10170" y="1420" text-anchor="end" ${fontAttrs(52, '#7d8587')} letter-spacing="6">CKF MANUTENÇÃO</text>`;

  return svgDoc(10500, 1500, body, { physical: true, label: 'Banner CKF 10,50 por 1,50 metros - layout modular v1' });
}

function specialtyCardV2(item, x, y, w, h, options = {}) {
  const primary = options.primary;
  const fill = primary ? '#121719' : '#0c1011';
  const stroke = primary ? C.yellow : '#353b3d';
  const strokeWidth = primary ? 12 : 5;
  let body = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="34" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

  if (primary) {
    body += iconAt(item.icon, x + 90, y + 180, 1.9);
    body += `<text x="${x + 650}" y="${y + 270}" ${fontAttrs(198)} letter-spacing="3">
      <tspan x="${x + 650}" y="${y + 270}">${escapeXml(item.lines[0])}</tspan>
      <tspan x="${x + 650}" y="${y + 500}">${escapeXml(item.lines[1])}</tspan>
    </text>`;
    body += `<rect x="${x + 650}" y="${y + 585}" width="760" height="13" fill="${C.yellow}"/>`;
  } else {
    const iconScale = 1.42;
    body += iconAt(item.icon, x + w / 2 - 156, y + 40, iconScale);
    const startY = item.lines.length === 3 ? y + 405 : y + 455;
    const size = item.lines.length === 3 ? 94 : 108;
    const leading = item.lines.length === 3 ? 102 : 120;
    const center = x + w / 2;
    const lines = item.lines.map((line, i) => `<tspan x="${center}" y="${startY + i * leading}">${escapeXml(line)}</tspan>`).join('');
    body += `<text text-anchor="middle" ${fontAttrs(size)} letter-spacing="1">${lines}</text>`;
    body += `<rect x="${center - 105}" y="${y + h - 38}" width="210" height="9" fill="${C.yellow}"/>`;
  }
  return body;
}

function fullLayoutV2(logoB64) {
  const rightX = 3600;
  const primary = copy.specialties[0];
  const secondaries = copy.specialties.slice(1);
  let body = `<defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#060809"/>
      <stop offset="0.52" stop-color="#121617"/>
      <stop offset="1" stop-color="#07090a"/>
    </linearGradient>
    <pattern id="lines2" width="115" height="115" patternUnits="userSpaceOnUse" patternTransform="rotate(22)">
      <line x1="0" y1="0" x2="0" y2="115" stroke="#ffffff" stroke-opacity="0.025" stroke-width="2"/>
    </pattern>
  </defs>
  <g id="fundo">
    <rect width="10500" height="1500" fill="url(#bg2)"/>
    <rect width="10500" height="1500" fill="url(#lines2)"/>
    <rect x="0" y="0" width="32" height="1500" fill="${C.yellow}"/>
    <rect x="0" y="0" width="10500" height="18" fill="${C.yellow}"/>
  </g>
  <g id="identidade-e-contatos">
  <image x="245" y="145" width="2820" height="655" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${logoB64}"/>
  ${iconAt('whatsapp', 235, 830, 2.22)}
  <text x="850" y="1050" ${fontAttrs(225)} letter-spacing="5">${escapeXml(copy.phones[0])}</text>
  <text x="850" y="1320" ${fontAttrs(225)} letter-spacing="5">${escapeXml(copy.phones[1])}</text>
  </g>
  <path d="M3460 0 V590 L3590 750 L3460 910 V1500" fill="none" stroke="${C.yellow}" stroke-width="24"/>
  <g id="titulo-e-especialidades">
  <text x="${rightX + 170}" y="235" ${fontAttrs(255)} letter-spacing="4">${escapeXml(copy.title)}</text>
  <rect x="${rightX + 170}" y="285" width="1210" height="12" fill="${C.yellow}"/>
  ${specialtyCardV2(primary, rightX + 170, 355, 2650, 750, { primary: true })}`;

  const cardX = [rightX + 2960, rightX + 4160, rightX + 5360];
  secondaries.forEach((item, i) => {
    body += specialtyCardV2(item, cardX[i], 355, 1080, 750, { primary: false });
  });

  body += `</g>
  <g id="faixa-de-servicos">
    <rect x="${rightX}" y="1180" width="6900" height="320" fill="#060809" fill-opacity="0.92"/>
    <rect x="${rightX + 170}" y="1180" width="6570" height="7" fill="${C.yellow}"/>
    <g transform="translate(${rightX + 190} 1265) scale(1.12)">${servicesStripBody(102)}</g>
  </g>`;

  return svgDoc(10500, 1500, body, { physical: true, label: 'Banner CKF 10,50 por 1,50 metros - layout modular v2 refinado' });
}

function assetBoard(logoB64) {
  let body = `<rect width="2400" height="1800" fill="${C.black}"/>
  <text x="100" y="110" ${fontAttrs(72)} letter-spacing="3">KIT MODULAR CKF — ASSETS TRANSPARENTES</text>
  <image x="100" y="170" width="850" height="300" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${logoB64}"/>
  <g transform="translate(1100 175) scale(.48)">${contactsBody()}</g>
  <g transform="translate(100 520) scale(.55)">${titleBody()}</g>`;

  const positions = [[100, 770], [1220, 770], [100, 1130], [1220, 1130]];
  copy.specialties.forEach((item, index) => {
    body += `<g transform="translate(${positions[index][0]} ${positions[index][1]}) scale(.56)">${specialtyAssetBody(item)}</g>`;
  });
  body += `<g transform="translate(100 1600) scale(.45)">${servicesStripBody(102)}</g>
  <text x="2300" y="1740" text-anchor="end" ${fontAttrs(42, C.muted)} letter-spacing="2">SVG + PNG • SEM FUNDO</text>`;
  return svgDoc(2400, 1800, body, { label: 'Prévia do kit modular CKF' });
}

async function main() {
  mkdirs();
  const manifest = [];
  const logo = await extractLogo();
  manifest.push({ ...logo, b64: undefined });

  manifest.push(await writeAsset('icone-whatsapp-amarelo', 240, 200, iconBodies.whatsapp, 1200, 'Ícone WhatsApp amarelo'));
  manifest.push(await writeAsset('icone-caminhoes-maquinas-pesadas', 220, 180, iconBodies.machines, 1320, 'Ícone caminhões e máquinas pesadas'));
  manifest.push(await writeAsset('icone-central-concreto', 220, 180, iconBodies.concrete, 1320, 'Ícone central de concreto'));
  manifest.push(await writeAsset('icone-reforma-equipamentos', 220, 180, iconBodies.reform, 1320, 'Ícone reforma de equipamentos'));
  manifest.push(await writeAsset('icone-estruturas-metalicas', 220, 180, iconBodies.structure, 1320, 'Ícone estruturas metálicas'));

  manifest.push(await writeAsset('texto-titulo-solucoes-manutencao-geral', 3900, 300, titleBody(), 3900, copy.title));
  copy.phones.forEach((phone, index) => manifest.push({ pending: true, phone, index }));
  const phoneResults = await Promise.all(copy.phones.map((phone, index) =>
    writeAsset(`texto-contato-0${index + 1}`, 1700, 230, phoneBody(phone), 3400, phone)
  ));
  manifest.splice(manifest.findIndex(item => item.pending), copy.phones.length, ...phoneResults);
  manifest.push(await writeAsset('bloco-contatos-whatsapp', 2700, 600, contactsBody(), 4050, 'Contatos WhatsApp CKF'));

  for (let index = 0; index < copy.specialties.length; index++) {
    const item = copy.specialties[index];
    manifest.push(await writeAsset(
      `especialidade-0${index + 1}-${item.slug}`,
      1800,
      620,
      specialtyAssetBody(item),
      3600,
      item.lines.join(' ')
    ));
    manifest.push(await writeAsset(
      `texto-especialidade-0${index + 1}-${item.slug}`,
      1420,
      520,
      specialtyTextBody(item),
      2840,
      item.lines.join(' ')
    ));
  }

  for (let index = 0; index < copy.services.length; index++) {
    const service = copy.services[index];
    manifest.push(await writeAsset(
      `servico-0${index + 1}-${service.label.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()}`,
      720,
      170,
      serviceAssetBody(service),
      1440,
      service.label
    ));
  }

  manifest.push(await writeAsset('faixa-servicos-completa', 5000, 165, servicesStripBody(102), 6000, 'Faixa completa de serviços'));
  manifest.push(await writeAsset('divisor-angular-amarelo', 230, 1500, dividerBody(), 460, 'Divisor angular amarelo'));

  const layout = fullLayoutV1(logo.b64);
  const drafts = path.join(PREVIEWS, 'rascunhos');
  fs.mkdirSync(drafts, { recursive: true });
  const layoutSvg = path.join(drafts, 'ckf-banner-modular-layout-v01-escala-1-10.svg');
  const layoutPng = path.join(drafts, 'ckf-banner-modular-layout-v01-7000x1000.png');
  write(layoutSvg, layout);
  await renderSvg(layout, layoutPng, 7000);

  const layoutV2 = fullLayoutV2(logo.b64);
  const layoutV2Svg = path.join(EXPORTS, 'ckf-banner-modular-layout-v02-refinado-escala-1-10.svg');
  const layoutV2Png = path.join(EXPORTS, 'ckf-banner-modular-layout-v02-refinado-7000x1000.png');
  write(layoutV2Svg, layoutV2);
  await renderSvg(layoutV2, layoutV2Png, 7000);

  const board = assetBoard(logo.b64);
  const boardSvg = path.join(PREVIEWS, 'preview-assets.svg');
  const boardPng = path.join(PREVIEWS, 'preview-assets.png');
  write(boardSvg, board);
  await renderSvg(board, boardPng, 2400);

  const exactCopy = [
    copy.title,
    '',
    'CONTATOS',
    ...copy.phones,
    '',
    'ESPECIALIDADES',
    ...copy.specialties.map((item, index) => `${index + 1}. ${item.lines.join(' ')}`),
    '',
    'SERVIÇOS — ORDEM E CORES',
    ...copy.services.map((service, index) => `${index + 1}. ${service.label} — ${service.color === C.white ? 'BRANCO' : 'AMARELO'}`),
  ].join('\n');
  write(path.join(PROJECT, 'TEXTOS-EXATOS.txt'), exactCopy + '\n');

  const cleanManifest = manifest.map(item => ({
    name: item.name,
    svg: path.relative(PROJECT, item.svg),
    png: path.relative(PROJECT, item.png),
    viewBox: `${item.width}x${item.height}`,
    transparent: item.transparent,
    note: item.note,
  }));
  write(path.join(PROJECT, 'manifesto-assets.json'), JSON.stringify({
    project: 'CKF — Banner de Fachada Modular',
    finalSizeMm: { width: 10500, height: 1500 },
    ratio: '7:1',
    colors: C,
    copy,
    assets: cleanManifest,
    layouts: {
      draftV1: {
        svg: path.relative(PROJECT, layoutSvg),
        png: path.relative(PROJECT, layoutPng),
      },
      refinedV2: {
        svg: path.relative(PROJECT, layoutV2Svg),
        png: path.relative(PROJECT, layoutV2Png),
      },
    },
  }, null, 2));

  console.log(JSON.stringify({
    assetCount: cleanManifest.length,
    layoutSvg,
    layoutPng,
    layoutV2Svg,
    layoutV2Png,
    boardPng,
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
