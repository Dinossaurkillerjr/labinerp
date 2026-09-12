# FASE 1 — FOUNDATION + DESIGN SYSTEM + APP SHELL

Você está construindo a Fase 1 do ERP da marca.

Leia primeiro:
1. `00_MASTER_CONTEXT.md`
2. O arquivo `.MD` de Design System fornecido pelo usuário.

## Objetivo
Criar a fundação técnica e visual do ERP sem ainda implementar toda a lógica de negócio.

## Stack
Use uma stack moderna, estável e adequada para Vercel. Se o projeto ainda não tiver stack definida, prefira:
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- componentes pontuais de Magic UI/Cnippet UI adaptados ao Design System

Não adicione dependências sem necessidade.

## Requisitos
Criar:
- estrutura do projeto;
- layout principal;
- sidebar desktop;
- header;
- área de conteúdo;
- breadcrumbs quando necessários;
- Command Palette Ctrl+K;
- Quick Action global "+" visualmente preparado;
- sistema de drawers;
- sistema de toast/feedback;
- sistema de modais;
- sistema de notificações;
- sistema de estados vazios;
- loading/skeleton states;
- error states;
- responsividade básica;
- tokens do Design System;
- componentes reutilizáveis.

## Navegação inicial
Dashboard
Financeiro
Vendas
Produtos
Contatos
Tarefas
Canvas
Configurações

## Dashboard
Criar a estrutura visual dos principais cards:
- Caixa
- Vendas
- Tarefas
- Lucro
- Despesas

Também preparar:
- fluxo de caixa;
- próximos pagamentos;
- últimas vendas;
- alertas;
- tarefas prioritárias.

Nesta fase, dados podem ser mockados, mas a arquitetura deve permitir substituição posterior por dados reais.

## UX
Não criar formulários gigantes.
Criar componentes para:
- campo simples;
- select;
- combobox;
- currency input;
- date input;
- tag;
- status;
- priority;
- drawer form;
- table;
- card;
- chart;
- notification item.

## Critérios de aceite
- Aplicação inicia sem erros.
- Navegação funciona.
- Layout é consistente.
- Componentes respeitam o Design System.
- Não existem estilos improvisados fora dos tokens.
- Nenhuma lógica financeira definitiva é implementada ainda.
- Nenhum deploy de produção.
