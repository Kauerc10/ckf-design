# CKF — Kit modular para banner de fachada

Kit produzido para permitir que a arte seja remontada em Illustrator, CorelDRAW,
Affinity Designer, Inkscape, Figma ou outro editor compatível com SVG/PNG.

## Medida e proporção

- Medida final: **10.500 × 1.500 mm**.
- Proporção: **7:1**.
- O SVG da montagem utiliza escala **1:10: 1.050 × 150 mm**.
- A prévia PNG da montagem possui **7.000 × 1.000 px**.

## Pastas

- `01_assets_transparentes`: cada elemento separado em SVG e PNG transparente.
- `02_previews`: pranchas para conferência visual; possuem fundo apenas para visualização.
- `03_layout_codigo`: gerador determinístico do kit e da montagem.
- `04_exportacoes`: primeira tentativa e versão refinada editável em proporção 7:1.
- `TEXTOS-EXATOS.txt`: conteúdo aprovado para copiar e colar.
- `manifesto-assets.json`: inventário, cores e dimensões de todos os arquivos.

## Observação sobre a logo

A logo disponível no acervo estava somente em JPEG. O PNG transparente preserva
a aparência da marca e o SVG incorpora esse PNG para facilitar importação, mas
não é uma vetorização em curvas. Para impressão de máxima nitidez, solicite o
arquivo original da marca em AI, EPS, PDF vetorial ou SVG verdadeiro.

## Montagens por código

- `layout-v01`: primeira tentativa, preservada para comparação.
- `layout-v02-refinado`: versão recomendada, com a especialidade principal maior,
  ícones secundários ampliados e serviços organizados em faixa própria.

## Cores principais

- Preto: `#090C0D`
- Amarelo: `#F6B900`
- Branco: `#F7F7F4`

## Regenerar

O script requer Node.js e o pacote `sharp`:

```powershell
$env:NODE_PATH='C:\Users\Kauerc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
& 'C:\Users\Kauerc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\03_layout_codigo\gerar-kit-ckf.js'
```

Para conferir quantidade de arquivos, transparência, textos e proporção:

```powershell
& 'C:\Users\Kauerc\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe' '.\03_layout_codigo\validar-kit-ckf.js'
```
