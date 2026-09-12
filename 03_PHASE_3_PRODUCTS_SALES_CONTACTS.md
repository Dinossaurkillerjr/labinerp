# FASE 3 — PRODUTOS + CUSTOS + SIMULAÇÃO + VENDAS + CONTATOS

Leia `00_MASTER_CONTEXT.md` e o Design System.

## Objetivo
Criar a camada operacional comercial sem substituir a Nuvemshop.

# PRODUTOS

## Cadastro
Produto deve ter cadastro inicial simples.

Campos são selecionáveis/personalizáveis.

Possíveis campos:
- nome
- imagem
- categoria
- coleção
- SKU
- preço
- tamanhos
- cores
- fornecedor
- POD
- custo
- margem
- status
- descrição
- observações

Não exibir todos os campos por padrão.

## Custos
Permitir múltiplos componentes de custo:
- POD
- etiqueta
- embalagem
- frete
- taxa
- outros

Cada componente deve ser editável.

Calcular:
- custo total;
- preço;
- lucro;
- margem;
- percentual de cada componente no custo.

## Simulador
A simulação é uma funcionalidade do produto, não uma tela/módulo independente.

Permitir testar:
- brinde;
- desconto;
- embalagem;
- custo adicional;
- alteração de custo.

A simulação NÃO deve alterar o produto real.

Exemplo:
Custo real R$ 135
Adicionar brinde R$ 8
Novo custo R$ 143
Calcular novo lucro e margem.

Permitir `Aplicar à realidade` somente mediante ação explícita.

# VENDAS

A Nuvemshop continua responsável pelo pedido.

O ERP registra apenas dados necessários para análise.

Campos:
- data
- cliente/contato
- produto
- quantidade
- cupom
- valor total
- canal
- observações

Canais:
- Nuvemshop
- Instagram
- WhatsApp
- outros

Ao registrar uma venda:
- criar relação com cliente;
- criar relação com produto;
- registrar receita;
- permitir cálculo de custo;
- permitir cálculo de lucro.

Não criar gestão detalhada de pedido, expedição ou logística.

# CONTATOS

Uma entidade única `Contact`.

Status:
- Lead
- Cliente
- Recorrente
- Inativo

Cadastro inicial:
- nome
- WhatsApp
- Instagram
- email

Permitir campos personalizados:
- tamanho
- como conheceu
- interesses
- observações
- qualquer campo futuro.

Não transformar a tela em formulário gigante.

## Histórico
Mostrar:
- vendas;
- total comprado;
- quantidade de compras;
- última compra;
- informações personalizadas.

## UX
Listagens simples.
Detalhes em drawer ou página contextual conforme o Design System.
Campos adicionais sob demanda.

## Critérios de aceite
- Produto pode existir com poucos campos.
- Campos extras podem ser adicionados.
- Custos são editáveis.
- Simulação não altera dados reais.
- Venda alimenta o financeiro corretamente.
- Contatos possuem status.
