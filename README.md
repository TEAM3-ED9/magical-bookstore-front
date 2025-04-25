# 🧙‍♂️ Magical Book Frontend - The Lineage of the Eagle 📚

## ✨ Description

This project is a magical book fronted inspired by the Harry Potter universe. It allows users to search, consult, and unlock books protected by magical questions, adding a touch of interactivity and challenge to the experience.

## 🎯 Objectives

- Allow users to **search and consult** information about available books.
- Implement a system of **magical questions** to protect access to certain books.
- Facilitate the **unlocking of books** by correctly answering the magical questions.

## 🛠️ Technologies

- **Frontend:** Javascript, React
- **Libraries:** SWR, Nuqs, TailwindCSS, Framer Motion, SWR, Lucide React
- **Version Control:** Git
- **Repository:** GitHub

## 📂 Project Documentation

- **General Use Case Diagram**: [docs/InteractionFlowDiagram.png](docs/InteractionFlowDiagram.png)
- **Components Design**: [docs/ComponentDesign.png](docs/ComponentDesign.png)

## ⚙️ Installation

Follow these steps to set up the project in your local environment:

**Prerequisites:**

- Node v18
- Git

**Installation Steps:**

1.  **Clone the repository:**

    ```bash
    git clone git clone https://github.com/TEAM3-ED9/magical-bookstore-front.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd magical-bookstore-front
    ```

3.  **Verify the Node version:**

    ```bash
    node --version
    ```

    Ensure you have Node version 18 or higher installed.

4.  **Install Node dependencies:**

    ```bash
    npm install
    ```

5.  **Configure the backend connection:**

    - Create a `.env` file and put::

    ```bash
    VITE_BACKEND_URL=http://127.0.0.1:8000 (here goes your backend api route)
    ```

6.  **Run the local server:**

    ```bash
    npm run dev
    ```

## 🚀 Usage

Once the server is running, you can access the application through your browser at `http://localhost:5173`, remeber you must setup the backend API and also ran the backend to get the project working.

## 🤝 Contribution

If you would like to contribute to this project, please follow these steps:

1.  **Fork** the repository if you are not part of the original team.
2.  **Create a branch** for your contribution: `git checkout -b feat/feature-name`.
3.  **Make your changes** and commit them: `git commit -m "feat: Clear description of the changes made"`.
4.  **Push your changes** to your fork: `git push origin feat/feature-name`.
5.  **Create a Pull Request** to the `develop` branch of the original repository.

Please ensure that you follow the established commit conventions and that your code is well-documented.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
