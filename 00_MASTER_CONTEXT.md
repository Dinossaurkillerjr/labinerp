# ERP DA MARCA — MASTER CONTEXT

## Objetivo
Construir um ERP enxuto, desktop-first e de uso individual para organizar a operação de uma pequena marca de moda. O sistema deve funcionar como o sistema operacional interno da marca, sem tentar substituir a Nuvemshop.

## Usuário
- Um único usuário no MVP: o proprietário da marca.
- Desktop-first.
- Mobile não é prioridade, mas a arquitetura deve permanecer responsiva.
- Interface em português brasileiro.
- O produto deve priorizar velocidade de registro, clareza financeira e baixa fricção.

## Princípios
1. O ERP deve responder rapidamente:
   - Quanto dinheiro a marca tem?
   - Quanto vendeu?
   - Quanto lucrou?
   - O que precisa ser feito?
   - O que estou criando/pensando?
2. Menos cliques.
3. Progressive disclosure: mostrar primeiro o essencial e revelar detalhes sob demanda.
4. Preferir drawers laterais para criação/edição contextual.
5. Campos opcionais e personalizáveis.
6. Não duplicar funcionalidades da Nuvemshop.
7. O financeiro é o eixo central.
8. O sistema deve separar claramente caixa, resultado, patrimônio e capital do proprietário.
9. O usuário pode registrar informações de forma simples e aprofundar depois.
10. Não construir funcionalidades enterprise sem necessidade.

## Canais de venda
- E-commerce/Nuvemshop
- Instagram
- WhatsApp

A Nuvemshop continua sendo a plataforma operacional de pedidos. O ERP registra vendas para análise financeira e gerencial.

## Núcleos do produto
1. Dashboard
2. Financeiro
3. Produtos
4. Vendas
5. Contatos
6. Tarefas
7. Canvas criativo
8. Configurações

## Fora do MVP
Não implementar:
- RH
- folha de pagamento
- contabilidade completa
- logística
- MRP
- produção industrial
- CRM avançado
- equipe/permissões complexas
- integração bancária obrigatória
- app mobile
- gestão completa de pedidos da Nuvemshop
- emissão fiscal integrada, salvo decisão futura explícita

## UX global
- Sidebar desktop-first.
- Navegação simples.
- Botão global "+" para Quick Actions.
- Command Palette via Ctrl+K.
- Drawers laterais para criação/edição.
- Busca global.
- Notificações internas.
- Dashboard personalizável.
- Visão simples/detalhada quando aplicável.
- Kanban, lista e agenda para tarefas.
- Canvas infinito para criação.

## Design System
O projeto receberá um arquivo `.MD` do proprietário contendo o Design System. Esse arquivo é a autoridade visual do produto.

Usar como base técnica/referência:
- shadcn/ui
- Magic UI
- Cnippet UI

Não misturar estilos arbitrariamente. O Design System fornecido deve definir tokens, tipografia, espaçamento, cores, raios, componentes e comportamento. As bibliotecas são fontes de componentes/referências e devem ser adaptadas ao Design System.

Referências:
- https://github.com/magicuidesign/magicui
- https://github.com/shadcn-ui/ui
- https://github.com/cnippet-dev/ui-cnippet

## Regra crítica de deployment
A aplicação será preparada para Vercel, mas NÃO deve ser publicada em produção automaticamente.

A etapa de deploy em Vercel será a ÚLTIMA etapa do projeto e só poderá ser executada após aprovação explícita do proprietário.

Antes dessa aprovação:
- não fazer deploy de produção;
- não executar `vercel --prod`;
- não publicar domínio;
- não assumir que o usuário aprovou o deploy.

Preparar o projeto para Vercel durante o desenvolvimento, mas deixar o deployment final bloqueado até aprovação explícita.
