# Guia do repositório de design

## Finalidade

Este repositório é a fonte oficial da identidade visual, dos assets e das entregas aprovadas da CKF Manutenção. Ele não substitui os repositórios de software: o [site institucional](https://github.com/Kauerc10/ckf-site-institucional) e o [sistema de orçamentos](https://github.com/Kauerc10/ckf-manutencao-orcamentos) consomem apenas exportações aprovadas.

## Organização atual

| Área | Uso |
| --- | --- |
| `01_Marca` | Logos, aplicações e diretrizes de marca |
| `10_Projetos_Ativos` | Arquivos em produção, kits e versões de trabalho |
| `11_Entregas_Aprovadas` | Arquivos finais liberados para uso e produção |
| `12_Arquivo` | Versões anteriores e materiais encerrados |
| `99_Modelos` | Modelos reutilizáveis para briefings e novos projetos |

As demais pastas reservam áreas de sistema de design, produto, marketing, conteúdo, impressos, apresentações e assets para evolução organizada.

## Fluxo de entrega

1. Desenvolva o material em `10_Projetos_Ativos` com versões incrementais.
2. Valide conteúdo, medidas, acabamento, licença e exportação.
3. Mova ou copie a versão aprovada para `11_Entregas_Aprovadas`.
4. Inclua instruções específicas quando houver gráfica, fornecedor ou escala de produção.
5. Registre alterações em uma branch e pull request.

## Arquivos grandes

O Git LFS já acompanha os formatos binários e vetoriais configurados em `.gitattributes`. Antes de adicionar ou clonar arquivos de design, execute:

```bash
git lfs install
```

Verifique a integridade local com:

```bash
git lfs fsck
```

## Banner de fachada atual

A entrega aprovada está em `11_Entregas_Aprovadas/2026_Banner_Fachada_CKF`. O arquivo prioritário para produção é `ckf-manutencao_banner-fachada-oficial.svg`; as medidas, orientações de escala e cuidados de gráfica estão em `INSTRUCOES_PARA_GRAFICA.md` na mesma pasta.

## Governança

O trabalho entra na `main` apenas por pull request. Consulte [CONTRIBUTING.md](../CONTRIBUTING.md), [SECURITY.md](../SECURITY.md) e [SUPPORT.md](../SUPPORT.md) antes de abrir uma contribuição ou compartilhar materiais.
