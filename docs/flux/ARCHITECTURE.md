# UEBEY Flux V1.1

Experimento de identidade generativa para a página principal da UEBEY.

## Objetivo

Manter **UEBEY** e **serviços digitais** invariantes enquanto a manifestação visual muda de forma perceptualmente distante a cada visita ou clique.

A V1.1 usa dois mecanismos independentes:

1. **Novelty Engine**: tenta escolher a composição mais distante das experiências recentes.
2. **Anti-Repeat Gate**: depois da geração, impede que uma assinatura categórica já vista seja exibida novamente dentro da memória longa.

## Fluxo

```text
visita / clique
    ↓
entropia + seed 128-bit
    ↓
48 candidatos invisíveis
    ↓
gramática visual procedural
    ↓
fingerprint perceptual
    ↓
Novelty Engine
    ↓
melhor candidato
    ↓
tratamento tipográfico derivado da seed
    ↓
Anti-Repeat Gate (até 4.000 assinaturas)
    ↓
assinatura inédita? ── não ──► reroll
    │
   sim
    ↓
render
```

## Motor generativo

Cada candidato deriva da seed:

- 9 topologias estruturais;
- 10 famílias de geometria SVG procedural;
- 7 famílias tipográficas;
- 5 escolhas de superfície (4 manifestações distintas);
- 6 harmonias cromáticas;
- parâmetros contínuos de hue, saturação, luminosidade, escala X, tracking, peso, tamanho, rotação, deslocamento, densidade, velocidade e proporções;
- microcopy secundária variável;
- seed de 128 bits (`2^128` estados de origem possíveis).

Não são páginas armazenadas. A aparência é calculada em tempo de execução.

## Novelty Engine

`flux.js` gera 48 candidatos por rodada. Cada candidato recebe um fingerprint numérico que representa estrutura, geometria, tipografia, paleta, densidade, rotação, escala, movimento e outras dimensões.

A seleção usa a **menor distância do candidato para o histórico**. Assim, um candidato só pontua bem se estiver distante de todas as experiências recentes, e não apenas da última.

A memória perceptual guarda até 60 fingerprints compactos no navegador.

Também há penalidades explícitas para repetição recente de:

- topologia;
- família geométrica;
- família tipográfica;
- modo de paleta;
- hue próximo;
- assinatura categórica.

## Anti-Repeat Gate

`flux-hardening.js` é deliberadamente separado do gerador.

Depois que o Novelty Engine escolhe uma composição, a camada de hardening:

1. lê a seed integral da composição;
2. deriva deterministicamente um dos 7 tratamentos tipográficos (`solid`, `outline`, `layered`, `boxed`, `soft`, `slash`, `inverse`);
3. cria a assinatura:

```text
topologia | geometria | tipografia | paleta | superfície | tratamento
```

4. compara com uma memória de até **4.000 assinaturas**;
5. se a assinatura já existir, manda o motor gerar outra composição;
6. repete por até 24 rerolls antes de aceitar um fallback.

Essa camada não tenta produzir novidade; ela funciona como uma barreira explícita contra revisitação categórica.

## Reprodutibilidade

A URL `?seed=<32 hex>` reproduz uma composição específica do motor. O acesso normal sem seed cria uma nova experiência. **Fixar esta versão** expõe a URL reproduzível.

## Persistência

`localStorage` mantém três estados locais:

- ID aleatório do dispositivo;
- até 60 fingerprints perceptuais;
- até 4.000 assinaturas categóricas aceitas.

Se o armazenamento estiver indisponível, a página continua funcionando; apenas perde memória entre carregamentos.

## Restrições preservadas

- `UEBEY` sempre visível;
- `serviços digitais` sempre visível;
- `sites · design · conteúdo · vídeo` preservado;
- paleta gerada dentro de faixas de contraste controladas;
- breakpoints móveis;
- `prefers-reduced-motion` respeitado;
- nenhum framework, API externa ou chamada a IA em runtime.

## Validação executada

### V1

- 80 gerações consecutivas: 80 seeds, 80 assinaturas, 0 repetição imediata;
- 500 gerações: 500 seeds e 484 assinaturas categóricas, revelando a limitação da memória curta de 60.

Esse teste motivou a V1.1.

### V1.1 / hardening

- teste do mecanismo longo: 500/500 assinaturas únicas;
- teste ampliado do motor endurecido: 1.000/1.000 assinaturas únicas no ensaio;
- camada Anti-Repeat isolada: 1.000 cliques aceitos, 1.000 assinaturas aceitas diferentes, 0 repetição imediata;
- JavaScript validado sintaticamente com Node.

Os testes de runtime foram feitos em DOM simulado porque o navegador headless do ambiente bloqueia navegação local por política administrativa. A validação visual definitiva deve ser feita na rota publicada.

## Próxima evolução

1. teste visual automatizado em ambiente de CI com Chromium/Playwright;
2. variable fonts locais em vez de apenas stacks de sistema;
3. métricas de CTA, scroll e permanência vinculadas ao fingerprint;
4. cálculo de similaridade visual também por screenshot/embedding em processo offline;
5. após validação humana, transportar o motor aprovado para a home principal da UEBEY.
