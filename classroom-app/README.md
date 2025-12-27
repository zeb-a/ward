# Classroom Management App

This is a complete classroom management application built with React, Vite, and Supabase. It includes student management, task tracking, reward systems, games, and reporting features.

## Features

- User authentication (login/signup)
- Student management
- Class management
- Task and reward system
- Educational games
- Reporting and analytics
- Responsive design

## Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

## Installation

1. Clone or download this repository
2. Navigate to the project directory: `cd classroom-app`
3. Install dependencies: `npm install`

## Environment Setup

Create a `.env` file in the root of the project with your Supabase credentials:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The `.env` file has already been created with your Supabase credentials.

## Running the Application

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or another available port).

## Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Dependencies

This project uses:
- React 19.2.0
- React DOM 19.2.0
- React Router DOM 7.1.3
- Supabase JavaScript client 2.48.1
- Vite 7.2.4
- ESLint for code linting

## Project Structure

- `src/` - Main source code with components, hooks, and utilities
- `public/` - Static assets
- `index.html` - Main HTML file
- `vite.config.js` - Vite configuration
- `package.json` - Project dependencies and scripts

## Database Setup

This application uses Supabase as the backend. Make sure you have a Supabase project set up with the following tables:
- `users` - For user authentication
- `classes` - For class information
- `students` - For student records
- `tasks` - For tasks and rewards
- `reports` - For reporting data

## Troubleshooting

If you encounter memory issues during installation, try:
- Increasing available memory if running in a container
- Using `npm ci` instead of `npm install` for a clean installation
- Clearing npm cache with `npm cache clean --force`

For any other issues, check the browser console for error messages and ensure your Supabase credentials are correct.
