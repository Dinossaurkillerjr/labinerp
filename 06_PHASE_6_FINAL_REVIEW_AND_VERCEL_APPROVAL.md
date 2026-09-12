# FASE 6 — FINAL REVIEW + PREPARAÇÃO PARA VERCEL

ATENÇÃO: ESTA FASE TEM DUAS PARTES.
A preparação técnica pode ser feita.
O DEPLOY FINAL SÓ PODE ACONTECER APÓS APROVAÇÃO EXPLÍCITA DO PROPRIETÁRIO.

Leia:
- `00_MASTER_CONTEXT.md`
- Design System
- todos os prompts anteriores
- código completo atual.

# PARTE A — AUDITORIA PRÉ-DEPLOY

Antes de solicitar aprovação, verificar:

## Produto
- Dashboard funcional
- Financeiro funcional
- Produtos funcionais
- Vendas funcionais
- Contatos funcionais
- Tarefas funcionais
- Canvas funcional
- Configurações funcionais

## Financeiro
Testar matematicamente:
- receita;
- despesa;
- aporte;
- retirada;
- custo;
- lucro bruto;
- lucro líquido;
- caixa;
- contas futuras;
- parcelamentos;
- capital;
- patrimônio;
- fechamento mensal;
- edição `*editado`.

Criar testes para os cálculos críticos.

## UX
Testar:
- Quick Add;
- drawers;
- Ctrl+K;
- notificações;
- filtros;
- busca;
- Kanban;
- lista;
- agenda;
- Canvas;
- drag/drop;
- Ctrl+V de imagem.

## Dados
Verificar:
- persistência;
- migrations;
- seed;
- integridade;
- relações;
- tratamento de erros.

## Segurança
Verificar:
- secrets;
- env vars;
- server/client boundaries;
- validação;
- acesso a banco;
- uploads;
- clipboard;
- URLs externas.

## Build
Executar:
- lint;
- typecheck;
- testes;
- build de produção.

Corrigir todos os erros relevantes.

# PARTE B — PREPARAÇÃO PARA VERCEL

Preparar:
- build compatível com Vercel;
- variáveis de ambiente documentadas;
- configuração de banco;
- configuração de storage se necessária;
- headers quando necessários;
- metadata;
- favicon;
- tratamento de erros;
- domínio preparado, mas não publicado.

Não executar deploy de produção.

Ao terminar, apresentar um relatório:
1. o que foi implementado;
2. o que foi testado;
3. erros conhecidos;
4. riscos;
5. variáveis de ambiente necessárias;
6. o que acontecerá no deploy;
7. checklist final.

Então PARAR.

Escrever claramente:
`DEPLOY FINAL AGUARDANDO APROVAÇÃO EXPLÍCITA.`

# REGRA ABSOLUTA

Não executar:
- `vercel --prod`
- publicação em produção
- associação definitiva de domínio
- qualquer ação irreversível de produção

sem uma mensagem posterior do proprietário autorizando explicitamente o deploy.

# APÓS APROVAÇÃO

Somente quando o proprietário disser explicitamente algo equivalente a:
"Pode fazer o deploy na Vercel"

então:
1. configurar Vercel;
2. configurar environment variables;
3. configurar banco/storage;
4. executar deploy;
5. verificar URL;
6. executar smoke tests;
7. confirmar funcionamento;
8. informar URL final e status.

Nunca interpretar silêncio, conclusão das fases anteriores ou execução deste prompt como aprovação.
