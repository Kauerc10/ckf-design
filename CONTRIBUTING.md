# Como contribuir

Este repositório é a fonte oficial dos materiais de design da CKF Manutenção. Toda alteração deve manter rastreabilidade entre briefing, arquivo de trabalho e entrega aprovada.

## Antes de começar

1. Atualize sua referência local de `main`.
2. Confirme que o Git LFS está ativo com `git lfs install`.
3. Crie uma branch antes de alterar ou adicionar arquivos.

Nunca faça commit diretamente em `main`.

## Nomes de branch

Use nomes curtos, em minúsculas e separados por hífen:

- `design/fachada-galpao`
- `design/bandeira-promocional`
- `docs/manual-da-marca`
- `fix/exportacao-banner`
- `chore/organiza-assets`

## Commits

Cada commit deve representar uma unidade lógica de trabalho. Prefira um título natural, direto e no presente:

```text
Organiza os arquivos finais da fachada
Atualiza as variações oficiais da marca
Corrige as dimensões do banner para impressão
```

Quando a mudança precisar de contexto, use um corpo curto para registrar a intenção e as decisões relevantes:

```text
Organiza o kit de impressão da fachada

Separa os arquivos editáveis das exportações aprovadas.
Documenta as dimensões finais e mantém os binários no Git LFS.
```

Não inclua nomes de ferramentas, agentes ou assinaturas automáticas na mensagem.

## Pull requests

Toda mudança entra em `main` por pull request. A descrição deve informar:

- objetivo da entrega;
- principais arquivos alterados;
- dimensões e formato final, quando aplicável;
- validações realizadas;
- impacto no site ou no sistema de orçamentos.

Antes do merge, revise a visualização dos assets, nomes dos arquivos, links e rastreamento pelo Git LFS.

## Entregas de impressão

Para materiais enviados à gráfica, registre junto da entrega:

- dimensão final e escala do arquivo;
- sangria e margem de segurança;
- modo de cor e perfil utilizado;
- resolução efetiva;
- fontes convertidas ou incorporadas;
- formato solicitado pelo fornecedor.

## Relação com os outros repositórios

O site institucional e o sistema de orçamentos recebem apenas exportações aprovadas. Alterações na identidade visual devem ser feitas primeiro aqui e referenciadas na pull request do repositório consumidor.
