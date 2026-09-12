# FASE 4 — TAREFAS + CANVAS CRIATIVO

Leia `00_MASTER_CONTEXT.md` e o Design System.

## Objetivo
Criar a camada de execução e pensamento criativo do ERP.

# TAREFAS

Uma tarefa pode ser extremamente simples ou detalhada.

## Criação rápida
`+` → Tarefa → título → salvar.

Exemplo:
"Trocar foto do produto"

Nenhum formulário obrigatório adicional.

## Tarefa detalhada
Campos opcionais:
- título
- descrição
- status
- prioridade
- prazo
- categoria
- checklist
- anexos
- relações

Não registrar tempo gasto.

Não criar tarefas recorrentes no MVP.

## Visualizações
A mesma coleção de tarefas deve suportar:
1. Kanban
2. Lista
3. Agenda

Filtros:
- todas
- hoje
- semana
- atrasadas
- prioridade
- status

"Hoje" deve ser filtro, não uma tela separada.

## Planejamento
Permitir ação `Planejar amanhã`.
Mostrar tarefas existentes e permitir adicionar/remover/reordenar.

## Complexidade progressiva
Uma tarefa simples pode receber detalhes depois.
Não obrigar o usuário a decidir inicialmente se algo é projeto, subtarefa etc.

# CANVAS

Criar um único canvas infinito, inspirado em Milanote.

Não transformar o Canvas em Notion.

## Elementos
- texto
- sticky/note
- imagem
- desenho simples
- seta
- link
- agrupamento básico

## Entrada de imagem
Obrigatório suportar:
1. drag and drop de arquivos do Windows;
2. Ctrl+C / Ctrl+V de imagens.

O clipboard deve ser tratado de forma apropriada no browser.

Suportar imagens copiadas de navegador ou outras aplicações quando o navegador fornecer dados de imagem.

## Links
Permitir colar links externos, incluindo:
- Pinterest
- Instagram
- Behance
- YouTube
- websites

## Persistência
Canvas deve salvar posição, tamanho, conteúdo e relações dos elementos.

## UX
- zoom;
- pan;
- seleção;
- mover;
- redimensionar quando aplicável;
- excluir;
- duplicar;
- undo/redo se a implementação não comprometer o MVP.

## Não implementar ainda
- múltiplos canvases;
- colaboração;
- comentários;
- presença multiusuário;
- edição simultânea;
- transformação automática de ideia em projeto/tarefa.

## Critérios de aceite
- Tarefa rápida funciona.
- Kanban/lista/agenda mostram a mesma fonte de dados.
- Planejar amanhã funciona.
- Canvas é realmente infinito na experiência.
- Imagem pode ser arrastada do desktop.
- Ctrl+V de imagem funciona quando o clipboard fornecer uma imagem válida.
- Links podem ser armazenados.
