# CKF Design

<p align="center">
  <img src="01_Marca/02_Logos/03_Variacoes/ckf-manutencao_logo-horizontal-branco-fundo-preto.jpeg" alt="CKF Manutenção" width="720">
</p>

Fonte oficial da identidade visual, dos materiais impressos e das entregas de design da **CKF Manutenção**.

Este repositório concentra os arquivos canônicos da marca. Os repositórios de produto podem consumir exportações aprovadas, mas alterações de logo, cores, tipografia ou peças institucionais devem nascer e ser versionadas aqui.

## Ecossistema CKF

Os projetos são independentes e se conectam por responsabilidade, sem submódulos ou dependências desnecessárias.

| Repositório | Responsabilidade | Acesso |
| --- | --- | --- |
| **[CKF Design](https://github.com/Kauerc10/ckf-design)** | Marca, assets, campanhas, impressos e entregas aprovadas | Este repositório |
| [Site Institucional](https://github.com/Kauerc10/ckf-site-institucional) | Presença pública, apresentação dos serviços e captação de contatos | GitHub |
| [Sistema de Orçamentos](https://github.com/Kauerc10/ckf-manutencao-orcamentos) | Operação interna, clientes, orçamentos e documentos comerciais | GitHub |

### Regra de fonte oficial

- A versão oficial de cada asset visual fica neste repositório.
- Cópias usadas no site ou no sistema devem vir de uma entrega aprovada.
- Ajustes de marca não devem ser feitos diretamente nos repositórios de produto.
- Quando uma entrega afetar outro projeto, a pull request deve informar a origem e a versão do asset.

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `00_Gestao_Design` | Planejamento, briefings, calendário e aprovações |
| `01_Marca` | Estratégia, logos, cores, tipografia e diretrizes |
| `02_Sistema_de_Design` | Componentes, tokens, padrões e documentação |
| `03_Produto_Digital` | UX/UI, pesquisas, fluxos e telas de produto |
| `04_Marketing_e_Campanhas` | Campanhas, landing pages e peças de aquisição |
| `05_Redes_Sociais` | Calendário e peças por canal |
| `06_Conteudo` | Blog, e-mail, infográficos e materiais ricos |
| `07_Impressos_e_Eventos` | Materiais físicos, sinalização e brindes |
| `08_Apresentacoes` | Materiais institucionais, comerciais e internos |
| `09_Assets` | Fotos, ilustrações, ícones, vídeos e fontes licenciadas |
| `10_Projetos_Ativos` | Arquivos em produção, organizados por projeto |
| `11_Entregas_Aprovadas` | Exportações finais prontas para distribuição |
| `12_Arquivo` | Projetos encerrados e versões antigas |
| `99_Modelos` | Modelos reutilizáveis de briefing, arquivos e apresentações |

## Organização dos arquivos

Use o padrão:

```text
AAAA-MM-DD_projeto_peca_v01.ext
```

Exemplo:

```text
2026-08-12_fachada-galpao_banner-v03.pdf
```

Durante a produção, avance as versões (`v01`, `v02`, `v03`). Somente materiais aprovados devem ser copiados para `11_Entregas_Aprovadas`.

## Fluxo de trabalho

A branch `main` recebe mudanças exclusivamente por pull request.

1. Crie uma branch curta e descritiva, como `design/fachada-galpao` ou `docs/manual-da-marca`.
2. Faça commits pequenos, claros e relacionados a uma única entrega.
3. Abra uma pull request com contexto, arquivos alterados e validações realizadas.
4. Revise nomes, dimensões, sangria, cores e arquivos finais antes do merge.

As regras completas estão em [CONTRIBUTING.md](CONTRIBUTING.md).

## Documentação e suporte

- [Guia do repositório](docs/REPOSITORY_GUIDE.md) — organização, Git LFS e fluxo das entregas.
- [Como contribuir](CONTRIBUTING.md) — branches, commits e pull requests.
- [Código de conduta](CODE_OF_CONDUCT.md) — regras de convivência e colaboração.
- [Segurança](SECURITY.md) — reporte responsável de credenciais, assets e materiais sensíveis.
- [Suporte](SUPPORT.md) — canal adequado para dúvidas e solicitações.
- [Termos de uso](LICENSE.md) — direitos sobre a marca e os materiais.

## Arquivos grandes

Imagens, PDFs, fontes, vídeos e arquivos nativos de design são armazenados com [Git LFS](https://git-lfs.com/). Antes de clonar este repositório, instale e habilite o Git LFS:

```bash
git lfs install
git clone https://github.com/Kauerc10/ckf-design.git
```

## Uso da marca

Os materiais deste repositório pertencem à CKF Manutenção. A visualização pública do código e dos assets não concede permissão para copiar, redistribuir ou usar comercialmente a marca. Consulte [LICENSE.md](LICENSE.md).
