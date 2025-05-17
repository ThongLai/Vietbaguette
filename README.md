# Viet Baguette Fullstack App

## Project info

This project is a full-stack responsive web app for Viet Baguette restaurant in Halifax, UK. It is designed to manage orders, staff, and menu, and to improve communication and efficiency in the restaurant.

## Project Structure

The project is organized into two main directories:

- **frontend/**: Contains the React application with UI components, state management, and user interface logic
- **backend/**: Contains the Express server, Socket.io for real-time communications, and API endpoints

## Tech Stack

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How to run the project

### Running the frontend

```sh
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at http://localhost:8080

### Running the backend

```sh
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
cp .env.example .env

# Start the development server
npm run dev
```

The backend will be available at http://localhost:3000

## Features

- Real-time order management system
- Employee and admin account management
- Voice communication between staff
- Schedule management
- Sales analytics and reporting
- Multi-language support
- Light/dark theme

## Technologies Used

### Frontend
- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Socket.io client

### Backend
- Node.js
- Express
- Socket.io
- TypeScript

## Development Workflow

To work on this project:

1. Clone the repository
2. Start both the frontend and backend servers
3. Make changes to the code
4. Test the changes locally
5. Commit and push the changes

## Deployment

Deploy this project using preferred hosting provider:

- Frontend: Vercel, Netlify, AWS Amplify
- Backend: Heroku, AWS, Digital Ocean, Railway

## Connecting a Custom Domain

Follow hosting provider's instructions to connect a custom domain to both the frontend and backend services.

## How can I edit this code?

Work locally using IDE:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <https://github.com/ThongLai/Vietbaguette>

# Step 2: Navigate to the project directory.
cd Vietbaguette

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

<!-- ## How I deployed this project?

You can deploy this project using your preferred hosting provider (e.g., Vercel, Netlify, AWS, etc.).

## Can I connect a custom domain?

Yes, you can! Follow your hosting provider's instructions to connect a custom domain. -->
