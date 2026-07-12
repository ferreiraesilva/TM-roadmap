# Prompt para Claude Design: Mockup do TM-Roadmap

Copie e cole o texto abaixo no Claude para que ele gere o mockup completo e os estilos da interface do TM-Roadmap.

---

## CONTEXTO DO PROJETO
Estamos construindo o **TM-Roadmap**, um sistema interno da **TrueMobile** para gerenciar e visualizar nosso portfólio de produtos e roadmaps de forma interativa. 
A estrutura de dados é baseada em uma árvore hierárquica (Nós) que contém:
- **Iniciativas** (Ex: *MinhaIncorporadora, ConcienciaTM*)
  - **Épicos** (Ex: *Campaign Awareness, comercial API*)
    - **User Stories / Histórias** (Ex: *Lembrete de tarefas, envio de mídia*)
    - **Bugs**
- **RFCs, Decisions e Spikes** (Outros tipos de nós que documentam decisões técnicas)

Precisamos de uma página web única (SPA), com foco em visualização e interação, que seja limpa, moderna e que dê a sensação de um produto SaaS premium.

---

## DIRETRIZES DE DESIGN E ESTÉTICA
Queremos um visual **premium e dinâmico** que chame a atenção à primeira vista:
1. **Tema Escuro (Dark Mode):** Fundo escuro profundo (ex: `#0B0F19` ou `#0F172A`) com contraste suave.
2. **Glassmorphism:** Uso estratégico de desfoque de fundo (`backdrop-filter: blur()`), bordas translúcidas semi-transparentes (`rgba(255, 255, 255, 0.05)`) e sombras suaves para criar profundidade física na interface.
3. **Cores de Destaque (Gradients & Glows):**
   - Cores suaves e harmoniosas baseadas no tipo de item (ex: Iniciativas com gradiente azul/violeta, Épicos em esmeralda, Histórias em âmbar, RFCs em roxo).
   - Efeitos de "glow" em hover e botões ativos.
4. **Tipografia:** Moderna e limpa (use fontes do Google Fonts como *Outfit* ou *Inter*).
5. **Micro-interações:** Transições suaves de escala e opacidade no hover de cards, botões e nós da árvore.

---

## ESTRUTURA DO LAYOUT (Single Page App)
A interface deve ser dividida em 3 seções principais:

### 1. Barra de Navegação Superior (Header)
- Logo estilizado da **TrueMobile Roadmap**.
- Barra de busca global rápida com filtro por tipo de nó.
- Botões de ação rápida:
  - `+ Novo Item` (Abre um modal translúcido com formulário para criar iniciativa/épico/história).
  - `Importar Markdown (Seed)` (Para re-sincronizar arquivos locais).

### 2. Painel Lateral Esquerdo (Tree View)
- A parte mais importante da interface: uma visualização em árvore interativa e expansível.
- Deve conter pastas colapsáveis/expansíveis:
  - Setas ou ícones indicativos de expansão.
  - Ícones pequenos coloridos para cada tipo (ex: `⚡` para Iniciativa, `📦` para Épico, `📄` para História, `🐛` para Bug, `💡` para RFC).
  - Estados ativos visíveis (quando o item está selecionado).

### 3. Painel Principal Direito (Details View)
- Exibe os detalhes do item selecionado na árvore:
  - **Título Grande** no topo com efeito de gradiente.
  - **Badges/Etiquetas:** Um badge com o tipo (Iniciativa, Epic, etc.) e outro com o Status (ex: *Draft, In Progress, Completed* - cada um com cores apropriadas).
  - **Data de Atualização:** Texto pequeno com "Atualizado em DD/MM/AAAA".
  - **Área de Conteúdo (Markdown Render):** Uma área estilizada que renderiza a descrição detalhada do nó. Deve ter tipografia muito boa para leitura (títulos `h2`, listas, blocos de código formatados com fundo escuro translúcido).
  - **Ações no Item:** Botões discretos de `Editar` e `Excluir`.

---

## REQUISITOS TECNOLÓGICOS E RESTRIÇÕES
- **Estrutura:** HTML5 semântico completo.
- **Estilos:** Vanilla CSS (CSS puro moderno, usando CSS Variables para o tema). **Não usar TailwindCSS**, Bootstrap ou bibliotecas utilitárias externas.
- **Comportamento:** Vanilla JavaScript para manipulação do DOM. O JavaScript deve simular a árvore funcionando (mockar dados locais, colapsar/expandir nós na árvore, alternar a visualização de detalhes ao clicar em diferentes nós, e abrir/fechar o modal de criação).
- **Responsividade:** Deve se adaptar a telas menores (ocultando a árvore em um menu hambúrguer, se necessário).

Por favor, gere o código completo unificado (HTML, CSS e JS) ou em arquivos separados estruturados, focando na excelência estética e fidelidade das interações.
