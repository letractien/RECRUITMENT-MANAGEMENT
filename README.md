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
├── docker-compose.yml     # Docker Compose setup
├── docker-compose.dev.yml # Development Docker Compose setup
├── nginx.conf             # Nginx configuration for production
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

#### Using Docker Compose (Recommended)

The easiest way to run the application is using Docker Compose:

```bash
# Build and start the container
docker-compose up --build

# Run in detached mode
docker-compose up -d

# Stop the container
docker-compose down
```

The application will be available at http://localhost:8080

#### Using Development Docker Configuration

For development with hot reloading:

```bash
# Build and start the development container
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Or use the helper script
./scripts/start-local.sh
```

#### Using Docker Directly

You can also build and run the Docker container manually:

```bash
# Build the Docker image
docker build -t recruitment-management .

# Run the container
docker run -p 8080:80 recruitment-management
```

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