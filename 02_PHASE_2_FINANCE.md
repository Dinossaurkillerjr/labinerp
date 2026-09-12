# FASE 2 — FINANCEIRO

Leia `00_MASTER_CONTEXT.md` e o Design System antes de implementar.

## Objetivo
Construir o núcleo financeiro do ERP. Este é o módulo prioritário.

## Conceito central
A entidade financeira principal é `Transaction`.

Tipos:
- income / receita
- expense / despesa
- owner_contribution / aporte
- owner_withdrawal / retirada

Uma transação deve ter, no mínimo:
- id
- type
- amount
- date
- category
- description
- payment_source
- status
- createdAt
- updatedAt
- edited flag
- optional notes
- optional attachments
- optional relations

## Caixa
O ERP deve representar o caixa operacional da marca mesmo quando o dinheiro físico estiver em uma conta pessoal.

Payment source pode ser:
- conta pessoal
- conta da marca
- dinheiro
- cartão
- outro

Não assumir integração bancária.

## Separações obrigatórias
Manter conceitos separados:
1. Caixa
2. Resultado
3. Patrimônio
4. Capital do proprietário

## Aportes
Aporte:
- aumenta caixa;
- aumenta capital aportado;
- não é receita;
- não aumenta lucro.

## Retiradas
Retirada:
- reduz caixa;
- aumenta capital retirado;
- não é despesa;
- não reduz lucro.

## Resultado
Calcular:
Receita
- custos dos produtos
= lucro bruto

- despesas operacionais
= lucro líquido

Não misturar aporte/retirada no lucro.

## Fluxo de caixa
Calcular:
saldo inicial
+ entradas
- saídas
= saldo final

Também suportar:
- a pagar;
- a receber;
- caixa projetado.

## Contas a pagar/receber
Uma transação pode possuir:
- status pendente;
- status pago/recebido;
- vencimento;
- recorrência;
- parcelas.

## Parcelamento
Uma operação parcelada deve possuir uma transação principal e parcelas vinculadas.

Exemplo:
R$ 600 em 3x:
- R$ 200 setembro
- R$ 200 outubro
- R$ 200 novembro

Cada parcela deve alimentar corretamente o fluxo futuro.

## Categorias
Fornecer categorias iniciais, mas permitir categorias personalizadas.

Categorias iniciais:
Receitas:
- Venda
- Outros recebimentos

Custos:
- Produto POD
- Estampa
- Etiqueta
- Embalagem
- Frete
- Taxas
- Outros

Despesas:
- Software
- Plataforma
- Marketing
- Contabilidade
- Serviços
- Equipamentos
- Outros

Capital:
- Aporte
- Retirada

## Recorrências
Permitir despesas recorrentes como:
- ChatGPT
- Claude
- Nuvemshop
- MEI
- outros serviços

Gerar lançamentos futuros sem duplicar incorretamente o histórico.

## Edição
Transações podem ser editadas.
Quando uma transação já salva for alterada:
- atualizar dados corretamente;
- marcar visualmente `*editado`;
- guardar pelo menos metadata básica da alteração.

## Fechamento mensal
Implementar:
- revisão do mês;
- resumo;
- conferências;
- fechamento;
- status fechado;
- possibilidade de reabrir explicitamente.

Não criar contabilidade formal.

## UI
Principalmente:
- tabela/lista de transações;
- filtros;
- período;
- tipo;
- categoria;
- status;
- busca;
- drawer de criação/edição;
- visão simples/detalhada.

## Quick Add
Fluxo prioritário:
`+` → tipo → categoria → dados essenciais → salvar.

O usuário deve conseguir registrar uma despesa em poucos segundos.

## Critérios de aceite
- Todos os cálculos financeiros são determinísticos e testados.
- Aportes e retiradas não contaminam lucro.
- Caixa e resultado são distintos.
- Contas futuras não alteram caixa realizado até serem efetivadas.
- Parcelas aparecem corretamente.
- Edição marca `*editado`.
- Fechamento mensal funciona.
