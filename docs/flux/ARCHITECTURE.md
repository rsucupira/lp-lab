# UEBEY Flux V1

Experimento de identidade generativa para a página principal da UEBEY.

## Objetivo

Manter **UEBEY** e **serviços digitais** invariantes enquanto a manifestação visual muda de forma perceptualmente distante a cada visita ou clique.

## Princípio

O sistema não sorteia um tema pronto. Cada rodada:

1. cria entropia criptográfica e uma seed de 128 bits;
2. gera 48 candidatos independentes;
3. deriva topologia, tipografia, paleta, geometria, superfície, densidade, rotação, escala, espaçamento e movimento;
4. transforma cada candidato em um fingerprint perceptual;
5. compara os candidatos com as últimas 60 experiências locais;
6. penaliza repetição recente de topologia, geometria, tipografia, modo de paleta e assinatura categórica;
7. escolhe o candidato de maior distância mínima;
8. gera SVG procedural determinístico a partir da seed;
9. salva somente o fingerprint compacto no navegador.

## Espaço gerativo

- 9 topologias estruturais;
- 10 famílias de geometria procedural;
- 7 famílias tipográficas;
- 5 superfícies;
- 6 harmonias cromáticas;
- parâmetros contínuos para hue, saturação, luminosidade, escala X, tracking, peso, tamanho, rotação, deslocamento, densidade, velocidade e proporções;
- seed de 128 bits: 2^128 estados de origem possíveis.

Esses números não são tratados como uma multiplicação de templates. A seed alimenta funções contínuas e construção SVG, de modo que a aparência final é calculada em tempo de execução.

## Novelty Engine

A novidade é calculada por distância numérica entre fingerprints, com bônus/penalidades categóricas. O algoritmo usa a menor distância do candidato para o histórico como referência: um candidato só é interessante se estiver longe de **todas** as experiências recentes.

Além disso, `recencyPenalty()` pune fortemente:

- mesma topologia nas últimas experiências;
- mesma família geométrica;
- mesma família tipográfica;
- hue muito próximo;
- repetição da mesma assinatura `topologia|geometria|tipografia|modo|superfície`.

Isto é deliberadamente diferente de random puro: o objetivo é maximizar **novidade percebida**, não aleatoriedade estatística isolada.

## Reprodutibilidade

A URL `?seed=<32 hex>` reproduz uma composição específica. O acesso normal sem seed gera uma nova experiência. O botão **Fixar esta versão** cria a URL reproduzível.

## Persistência

`localStorage` mantém:

- um ID aleatório do dispositivo;
- até 60 fingerprints recentes.

Se o armazenamento não estiver disponível, o motor continua funcionando sem memória persistente.

## Restrições preservadas

- texto principal sempre contém `UEBEY`;
- subtítulo sempre contém `serviços digitais`;
- serviços principais permanecem legíveis;
- contraste base é controlado pela geração de paleta;
- layout possui breakpoints móveis;
- `prefers-reduced-motion` desliga movimentos longos;
- nenhum framework ou API externa é necessário.

## Próxima evolução recomendada

1. substituir stacks de sistema por 2–3 variable fonts locais;
2. adicionar teste visual automatizado com Playwright em múltiplos viewports;
3. calcular métricas de colisão perceptual em lotes de 1.000+ seeds;
4. instrumentar CTA, scroll e tempo de permanência por fingerprint;
5. evoluir de novidade pura para multi-armed bandit, mantendo uma cota de exploração visual;
6. migrar o motor aprovado para a rota principal da UEBEY somente após validação.
