# XML Nexus

✨ An interactive tool to transform complex XML data into beautiful, insightful visualizations.

**XML Nexus** brings your data structures to life by parsing XML and rendering it as a dynamic force-directed graph and a collapsible tidy tree. Built with React, D3.js, and TypeScript, it's designed to be a fast, client-side tool for developers, data analysts, and anyone working with XML.

**[➡️ View Live Demo](https://boakpe.github.io/XML-Nexus/)**

 
<img src="https://i.imgur.com/M3Pb76H.png" alt="XML Nexus Screenshot" style="border-radius: 12px;" />

---

## 🚀 Features

*   **Dual Visualization Modes:** Switch seamlessly between:
    *   **Force-Directed Graph:** An interactive physics-based simulation that reveals the relationships and clusters within your data.
    *   **Collapsible Tidy Tree:** A classic hierarchical view, perfect for understanding parent-child relationships and data depth.
*   **Interactive Controls:** Zoom, pan, and drag nodes to explore the visualization from every angle.
*   **Real-time Parsing:** Instantly visualize changes to your XML structure.
*   **Modern XML Editor:** A built-in CodeMirror editor with syntax highlighting, line numbers, and a clean interface.
*   **Insightful Statistics:** Get a quick overview of your data with stats on total nodes, edges, max depth, and leaf nodes.
*   **Client-Side Processing:** Everything runs in your browser. No data is ever sent to a server, ensuring privacy and speed.
*   **Built with Modern Tech:** Leverages the power of React, D3.js, TypeScript, and Tailwind CSS for a responsive and performant experience.

---

## 🛠️ Technology Stack

*   **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
*   **Visualization:** [D3.js](https://d3js.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **XML Editor:** [CodeMirror 6](https://codemirror.net/)
*   **Animations:** [Framer Motion](https://www.framer.com/motion/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)

---

## 🔧 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Boakpe/XML-Nexus.git
    cd xml-nexus
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

4.  **Build for production:**
    To create a production-ready build for deployment (e.g., to GitHub Pages):
    ```bash
    npm run build
    ```
    This will generate static assets in the `dist/` directory.