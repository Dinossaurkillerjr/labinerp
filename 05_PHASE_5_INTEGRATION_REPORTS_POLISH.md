# FASE 5 — INTEGRAÇÃO INTERNA + RELATÓRIOS + NOTIFICAÇÕES + POLISH

Leia `00_MASTER_CONTEXT.md`, o Design System e todas as fases anteriores.

## Objetivo
Conectar os módulos e transformar o protótipo funcional em uma aplicação coerente.

# RELAÇÕES INTERNAS

Garantir que:
Venda ↔ Contato
Venda ↔ Produto
Venda ↔ Receita
Produto ↔ Custos
Transação ↔ Categoria
Transação ↔ Produto quando aplicável
Tarefa ↔ relações opcionais
Canvas ↔ conteúdo criativo

## DASHBOARD

Prioridade:
1. Caixa
2. Vendas
3. Tarefas
4. Lucro
5. Despesas

Adicionar:
- fluxo de caixa;
- contas próximas;
- vendas recentes;
- tarefas prioritárias;
- alertas.

Implementar:
- visão simples;
- visão detalhada;
- cards personalizáveis.

## NOTIFICAÇÕES

Usar inbox interno, não spam de popups.

Exemplos:
- conta vencendo;
- tarefa atrasada;
- venda registrada;
- período pronto para fechamento;
- inconsistência relevante;
- margem abaixo de determinado valor, se configurável.

Notificações devem ter relação com entidades quando possível.

## BUSCA GLOBAL

Ctrl+K deve pesquisar:
- produtos;
- vendas;
- contatos;
- tarefas;
- transações;
- Canvas.

Mostrar resultados agrupados por tipo.

## RELATÓRIOS

Criar visões úteis, não BI empresarial.

Relatórios mínimos:
- vendas por período;
- receita por canal;
- vendas por produto;
- lucro por produto;
- despesas por categoria;
- fluxo de caixa;
- evolução de lucro;
- aportes e retiradas;
- capital do proprietário.

Filtros por:
- período;
- categoria;
- produto;
- canal;
- contato.

## UX POLISH

Revisar:
- empty states;
- loading;
- erros;
- confirmação de ações destrutivas;
- feedback de salvamento;
- teclado;
- acessibilidade;
- foco;
- drawers;
- tabelas;
- filtros;
- responsividade;
- consistência visual.

## PERFORMANCE
- evitar renders desnecessários;
- lazy load para Canvas quando adequado;
- não carregar dados gigantes sem necessidade;
- otimizar imagens;
- garantir navegação fluida.

## SEGURANÇA
Mesmo sendo single-user:
- validar dados no servidor;
- não confiar em inputs do cliente;
- proteger secrets;
- não colocar chaves privadas no frontend;
- preparar autenticação caso seja necessária.

## Critérios de aceite
A aplicação deve parecer um único produto, não um conjunto de telas feitas separadamente.
Todos os módulos principais devem compartilhar entidades e cálculos.
