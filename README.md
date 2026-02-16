# matheusdanoite - the website
The website of your dreams, available now.

[Português Brasileiro](README.pt-br.md)

## Technologies Used
### Frontend (Core)
*   **React 19**: JavaScript library for building user interfaces.
*   **Vite**: Next-generation build tool, ensuring performance and fast HMR.
*   **JavaScript (ES6+)**: Base language of the project.

### Styling & UI
*   **Styled Components**: CSS-in-JS system for style encapsulation and dynamic themes.
*   **React95**: UI component library that faithfully recreates Windows 95 elements.
*   **React Draggable**: Allows windows to be freely dragged by the user.

### Multimedia & Interactivity
*   **React Three Fiber / Drei**: Ecosystem for rendering 3D graphics (Three.js) declaratively in React (used in the "Me" window for the 3D model).
*   **Three.js**: Base 3D graphics engine.
*   **React Canvas Draw**: Allows visitors to draw freely in the Guestbook.

### Backend & Serverless
*   **Netlify Functions**: Serverless middleware (Node.js) to hide API keys (Last.fm, Xbox) and avoid CORS.
*   **Firebase**:
    *   **Firestore**: Real-time database for the Guestbook (messages and drawings).
    *   **Storage**: CDN storage for hosting all heavy assets (images, videos, posts/tweets JSON data).

### Integrations & APIs
*   **Last.fm API**: Displays recently listened tracks in real-time.
*   **Xbox Live API (OpenXBL)**: Integration to show game status and achievements.
*   **GitHub / Netlify**: Versioning and CI/CD.

## Key Features
1.  **Simulated Desktop Interface**:
    *   Window system with multitasking support (drag, focus, close).
    *   Functional Taskbar with clock and Start Menu.
    *   **Replicated Apps**: Functional and interactive versions of **Instagram** (Stories, Reels, Feed), **Twitter/X** (Infinite Scroll), and **Orkut** (Communities, Friends, Scraps).
2.  **Optimized Loading (Lazy Loading)**:
    *   The site does not "bundle" static data. Instead, all content (posts, photos, videos) is asynchronously loaded from **Firebase Storage** only when the user opens the respective app, ensuring a super-fast initial load.
3.  **Guestbook (Testimonials)**:
    *   Comments with **Drawing** support (Canvas 500x500px).
    *   Persistent storage.
4.  **Activity Monitoring (Live Feed)**:
    *   What I'm listening to (Last.fm) and playing (Xbox Live).
5.  **Hybrid Responsive Layout**:
    *   **Desktop**: Complete Windows 95 experience.
    *   **Mobile**: Interface adapted into a vertical list for usability.

## How to Run the Project
### Prerequisites
*   Node.js (v18+)
*   Firebase Account (Created Project)
*   Wrangler (Cloudflare CLI)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/my-portfolio.git
    cd my-portfolio
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root (based on `.env.example`):
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

4.  **Upload Data (Essential)**:
    The project relies on data hosted on Firebase Storage.
    *   You must have the `firebase_data` folder (generated locally or provided).
    *   Upload the entire content of this folder to the **root** of your Firebase Storage bucket.
    *   *Note: If the data is not there, the apps (Instagram, Orkut, etc.) will remain empty.*

5.  Run in development:
    ```bash
    npm run dev
    ```

## Deploy (Cloudflare Pages)
The project is configured for deploy on **Cloudflare Pages**.
*   **Build Command**: `npm run build`
*   **Publish Directory**: `dist`
*   **Deploy Command**: `npm run deploy` (Uses Wrangler to deploy the specified branch)
*   The serverless functions are located in the `functions/` folder and will be automatically detected by Cloudflare Pages.

*A product: matheusdanoite corp.*
