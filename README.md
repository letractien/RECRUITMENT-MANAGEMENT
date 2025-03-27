# Recruitment Management System

A modern recruitment management system built with Vue.js to streamline the hiring process.

## Project Structure

The project follows a well-organized structure for better maintainability:

```
recruitment-management/
├── .env                   # Environment variables
├── public/                # Static files
├── src/                   # Source code
│   ├── assets/            # Static assets (CSS, images)
│   ├── components/        # Reusable UI components
│   ├── pages/             # Page components
│   ├── router/            # Vue Router configuration
│   ├── store/             # Vuex/Pinia state management
│   ├── utils/             # Utility functions
│   │   ├── api/           # API service modules
│   │   └── helpers/       # Helper utility functions
│   ├── App.vue            # Root component
│   └── main.js            # App entry point
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup (production)
├── docker-compose.dev.yml # Development Docker Compose setup
├── clean.ps1              # PowerShell cleanup script 
└── package.json           # Project dependencies
```

## Components Overview

- **UI Components**: Small, reusable components in `components/` 
- **Pages**: Full pages in `pages/`
- **Router**: Navigation managed in `router/`
- **Store**: State management in `store/`
- **Utils**: API and helper functions in `utils/`

## Features

- **Dashboard Analytics**: Real-time recruitment metrics and visualizations
- **Job Management**: Create, edit and publish job listings
- **Candidate Tracking**: Track candidate applications and progress
- **Interview Scheduling**: Schedule and manage interviews with calendar integration
- **Applications by Department**: Track applications by department with sorting options
- **Hiring Funnel**: Visualize candidate progression through hiring stages
- **Dark/Light Theme**: Support for both dark and light mode
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Setup and Development

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Docker and Docker Compose (for Docker-based development)

### Local Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Docker Setup

#### Prerequisites
- Docker and Docker Compose installed on your machine

#### Using Docker Compose for Production

Run the application in production mode:

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the container
docker-compose down
```

The application will be available at http://localhost:8080 (even though logs will show it listening on port 3000 inside the container)

#### Using Docker Compose for Development

For development with hot reloading:

```bash
# Build and start the development container
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

This will:
- Mount your local source code into the container
- Enable hot-reloading with `npm run dev -- --host` (Vite dev server)
- Expose the Vite dev server on port 5173
- Set NODE_ENV to development

The application will be available at http://localhost:5173 in development mode. Any changes to your source code will trigger hot-reloading.

#### About Docker Configuration

##### Production Mode (docker-compose.yml)
- Uses a single Node.js container running `serve` to host the application
- Builds the application and serves the static files
- Port mapping: Container's port 3000 → Host's port 8080
  - Note: The application logs will show it's running on http://localhost:3000, but that's from inside the container
  - You should access it through http://localhost:8080 on your host machine

##### Development Mode (docker-compose.dev.yml)
- Uses the same Node.js container but runs Vite dev server instead
- Mounts your local code into the container for instant updating
- Port mapping: Container's port 5173 → Host's port 5173
- Uses the `--host` flag to make Vite accessible from outside the container
  - Logs will show both http://localhost:5173/ and http://[container-ip]:5173/
  - You should access it through http://localhost:5173 on your host machine

### Troubleshooting

- If you see warnings about "the attribute `version` is obsolete" in docker-compose files, this is normal and can be ignored
- If you can't access the application after starting Docker, check that you're using the correct port:
  - Production: http://localhost:8080
  - Development: http://localhost:5173
- If the application still isn't accessible, ensure the `--host` flag is being passed to Vite in development mode

### Cleanup Local Development Files

When switching to Docker-based development, you can clean up unnecessary local files:

```bash
# Run the cleanup script (Windows PowerShell)
./clean.ps1
```

This script removes:
- `node_modules` directory
- Build artifacts and caches
- Temporary files
- Local environment files

## Environment Variables

The application uses environment variables for configuration:

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_APP_API_URL | API base URL | http://localhost:3000/api |
| VITE_APP_API_TIMEOUT | API request timeout in ms | 15000 |
| VITE_APP_API_VERSION | API version | v1 |
| VITE_APP_ENABLE_DARK_MODE | Enable dark mode | true |
| VITE_APP_ENABLE_NOTIFICATIONS | Enable notifications | true |

## Key Components

### Dashboard
The dashboard provides an overview of the recruitment process with:
- Applications by department visualization
- Hiring funnel tracking
- Upcoming interviews overview

### Interviews
The interview section allows:
- View interviews by day, week, or month
- Schedule and manage interviews
- Filter interviews by type
- Load more interviews with pagination controls

## Development Notes

### Mock API
The application uses a mock API for development, which can be toggled in `src/utils/api/index.js`.

### Theme Customization
The application supports theme customization through CSS variables defined in `src/App.vue`.

## License

MIT 