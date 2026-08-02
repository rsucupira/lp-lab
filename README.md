# LP Lab

Laboratório central para criar, testar e organizar landing pages reutilizáveis.

## Objetivo

- manter modelos de landing pages;
- guardar componentes reutilizáveis;
- padronizar briefing, publicação e entrega;
- criar cada projeto final em um repositório independente.

## Estrutura

```text
lp-lab/
├── templates/      Modelos completos de landing pages
├── components/     Blocos HTML reutilizáveis
├── manual/         Briefings, padrões e checklists
├── scripts/        Automação para iniciar uma nova LP
├── docs/           Página pública do laboratório no GitHub Pages
└── .github/        Formulário interno para registrar novos projetos
```

## Fluxo recomendado

1. Registrar o projeto usando o briefing em `manual/briefing-template.md`.
2. Criar uma cópia do modelo com `scripts/nova-lp.ps1`.
3. Trabalhar em um repositório separado chamado `lp-nome-do-negocio`.
4. Publicar provisoriamente no GitHub Pages.
5. Após aprovação, transferir o repositório ao responsável pelo site.

## Criar uma nova LP no Windows

Abra o PowerShell dentro da pasta `lp-lab` e execute:

```powershell
.\scripts\nova-lp.ps1 `
  -Slug "ana-nutricao" `
  -Nome "Ana Martins" `
  -Servico "Nutrição clínica" `
  -WhatsApp "5531999999999"
```

O projeto será criado ao lado do laboratório:

```text
lp-lab/
lp-ana-nutricao/
```

## Convenção de nomes

- landing page: `lp-nome-do-negocio`
- site com várias páginas: `site-nome-do-negocio`
- somente letras minúsculas, números e hífens
- não usar espaços, acentos ou nomes como `site-final-2`

## Regra principal

Não guardar os projetos finais de clientes dentro deste repositório. O `lp-lab` guarda os modelos; cada site final deve ter seu próprio repositório.
