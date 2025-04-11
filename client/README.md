# CyberCafe Shop Frontend

This is the frontend client for the CyberCafe Shop e-commerce platform.

## Features

- Responsive design
- User authentication and authorization
- Product browsing and search
- Shopping cart functionality
- Checkout process with multiple payment options
- Order history
- User profile management
- Admin dashboard

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the client directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example` and fill in your credentials:

```bash
cp .env.example .env
```

5. Start the development server:

```bash
npm run dev
```

## Environment Variables

The following environment variables are required:

- `VITE_API_URL`: Backend API URL (default: http://localhost:5000/api)
- `VITE_APP_NAME`: Application name
- `VITE_APP_DESCRIPTION`: Application description
- `VITE_APP_VERSION`: Application version
- `VITE_APP_AUTHOR`: Application author
- `VITE_APP_LOGO_URL`: Application logo URL
- `VITE_APP_FAVICON_URL`: Application favicon URL
- `VITE_APP_THEME_COLOR`: Application theme color
- `VITE_APP_META_*`: Application meta tags

## Project Structure

- `src/components`: Reusable UI components
- `src/pages`: Page components
- `src/redux`: Redux store, slices, and actions
- `src/utils`: Utility functions
- `src/layout`: Layout components
- `src/theme`: Theme configuration
- `src/assets`: Static assets

## Available Scripts

- `npm run dev`: Start the development server
- `npm run build`: Build the production bundle
- `npm run preview`: Preview the production bundle
- `npm run lint`: Run ESLint
- `npm run format`: Format code with Prettier

## License

This project is licensed under the ISC License.
