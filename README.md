# MetalERP client

This is a [Create React App](https://create-react-app.dev/) project that powers the MetalERP frontend. It's a modern single-page application built with React, Tailwind CSS, and reusable component architecture for metal ERP workflows.

## Tech Stack

This project is built with the following technologies:

- **Framework:** [React 19](https://react.dev/) with Create React App via `react-scripts`
- **Routing:** [React Router DOM](https://reactrouter.com/) for client-side page navigation
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [PostCSS](https://postcss.org/) and [Autoprefixer](https://autoprefixer.github.io/)
- **UI Icons:** [Lucide React](https://lucide.dev/)
- **Testing:** [Testing Library](https://testing-library.com/) packages for UI and DOM testing
- **Code Quality:** [Prettier](https://prettier.io/) with [prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)
- **Git Hooks:** [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/okonet/lint-staged) for formatting staged files before commit

## Getting Started

To get the development server running, follow these steps:

1.  **Install dependencies:**

    ```bash
    npm install
    ```

2.  **Run the development server:**

    ```bash
    npm start
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

You can start editing the page by modifying files under `src/`. The page will auto-update as you edit the source.

## Backend

This repository contains the frontend client for MetalERP. A separate backend service is expected to provide the API endpoints consumed by this application.

## Development Guidelines

To maintain code quality and consistency, please follow these guidelines:

- **Component-Based Architecture:** Build new UI elements as reusable React components and keep them organized under `src/shared/components` or the appropriate module folder.
- **Styling:** Use **Tailwind CSS** for all styling and avoid large inline style blocks.
- **Routing:** Add new routes using React Router DOM and keep page components in `src/pages` or `src/modules/*/pages`.
- **API Calls:** Centralize API requests in `src/services/apiClient.js` and `src/services/endpoints.js`.
- **Code Quality:** Run formatting with `npm run prettier` or rely on Husky + lint-staged for staged files.
- **Icons:** Use icons from **Lucide React**.

## Learn More

To learn more about the technologies used in this project, refer to:

- [Create React App Documentation](https://create-react-app.dev/docs/getting-started)
- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/docs/en/v6)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide React Documentation](https://lucide.dev/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [lint-staged Documentation](https://github.com/okonet/lint-staged)

## Production Deployment

Build the app for production:

```bash
npm run build
```

Deploy the contents of the `build` directory to a static hosting provider or web server configured to serve `index.html` for client-side routes.
