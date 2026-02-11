# matheusdanoite - the website
O site que você sempre sonhou, agora pertinho de você.

## 🛠 Tecnologias Utilizadas

### Frontend (Core)
*   **React 19**: Biblioteca JavaScript para construção da interface de usuário.
*   **Vite**: Build tool de última geração, garantindo performance e HMR rápido.
*   **JavaScript (ES6+)**: Linguagem base do projeto.

### Estilização & UI
*   **Styled Components**: Sistema de CSS-in-JS para encapsulamento de estilos e temas dinâmicos.
*   **React95**: Biblioteca de componentes UI que recria fielmente os elementos do Windows 95.
*   **React Draggable**: Permite que as janelas sejam arrastadas livremente pelo usuário.

### Multimídia & Interatividade
*   **React Three Fiber / Drei**: Ecossistema para renderizar gráficos 3D (Three.js) de forma declarativa no React (usado na janela "Eu" para o modelo 3D).
*   **Three.js**: Motor gráfico 3D base.
*   **React Canvas Draw**: Permite aos visitantes desenharem livremente no Guestbook.

### Backend & Serverless
*   **Netlify Functions**: Middleware serverless (Node.js) para ocultar chaves de API (Last.fm, Xbox) e evitar CORS.
*   **Firebase**:
    *   **Firestore**: Banco de dados em tempo real para o Guestbook (mensagens e desenhos).
    *   **Storage**: Armazenamento de CDN para hospedagem de todos os assets pesados (imagens, vídeos, dados JSON de posts/tweets).

### Integrações & APIs
*   **Last.fm API**: Exibe as músicas ouvidas recentemente em tempo real.
*   **Xbox Live API (OpenXBL)**: Integração para mostrar status de jogo e conquistas.
*   **GitHub / Netlify**: Versionamento e CI/CD.

## 🌟 Funcionalidades Principais

1.  **Interface Desktop Simulada**:
    *   Sistema de janelas com suporte a multitarefa (arrastar, focar, fechar).
    *   Taskbar funcional com relógio e Menu Iniciar.
    *   **Apps Replicados**: Versões funcionais e interativas de **Instagram** (Stories, Reels, Feed), **Twitter/X** (Infinite Scroll) e **Orkut** (Comunidades, Friends, Scraps).

2.  **Carregamento Otimizado (Lazy Loading)**:
    *   O site não "bundleia" os dados estáticos. Em vez disso, todo o conteúdo (posts, fotos, vídeos) é carregado assincronamente do **Firebase Storage** apenas quando o usuário abre o respectivo aplicativo, garantindo um carregamento inicial super rápido.

3.  **Guestbook (Depoimentos)**:
    *   Comentários com suporte a **Desenhos** (Canvas 500x500px).
    *   Armazenamento persistente.

4.  **Monitoramento de Atividade (Live Feed)**:
    *   O que estou ouvindo (Last.fm) e jogando (Xbox Live).

5.  **Layout Responsivo Híbrido**:
    *   **Desktop**: Experiência Windows 95 completa.
    *   **Mobile**: Interface adaptada em lista vertical para usabilidade.

## 🚀 Como Executar o Projeto

### Pré-requisitos
*   Node.js (v18+)
*   Conta no Firebase (Projeto criado)
*   Wrangler (CLI da Cloudflare)

### Instalação

1.  Clone o repositório:
    ```bash
    git clone https://github.com/seu-usuario/meu-portfolio.git
    cd meu-portfolio
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure as Variáveis de Ambiente:
    Crie um arquivo `.env` na raiz (baseado no `.env.example`):
    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    VITE_FIREBASE_STORAGE_BUCKET=...
    VITE_FIREBASE_MESSAGING_SENDER_ID=...
    VITE_FIREBASE_APP_ID=...
    LASTFM_API_KEY=...
    LASTFM_USERNAME=...
    STEAM_API_KEY=...
    STEAM_ID=...
    ```

4.  **Upload dos Dados (Essencial)**:
    O projeto depende de dados hospedados no Firebase Storage.
    *   Você deve ter a pasta `firebase_data` (gerada localmente ou fornecida).
    *   Faça o upload de todo o conteúdo desta pasta para a **raiz** do seu bucket no Firebase Storage.
    *   *Nota: Se os dados não estiverem lá, os apps (Instagram, Orkut, etc.) ficarão vazios.*

5.  Execute em desenvolvimento:
    ```bash
    npm run dev
    ```

## 📦 Deploy (Cloudflare Pages)

O projeto está configurado para deploy no **Cloudflare Pages**.

*   **Build Command**: `npm run build`
*   **Publish Directory**: `dist`
*   **Deploy Command**: `npm run deploy` (Utiliza Wrangler para deploy da branch especificada)
*   As funções serverless estão localizadas na pasta `functions/` e serão automaticamente detectadas pelo Cloudflare Pages.

---
*Pensado por Matheus José da Silva - Guarapuava, 2026*
