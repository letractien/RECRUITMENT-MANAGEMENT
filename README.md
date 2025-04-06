# Recruitment Management System

Hệ thống quản lý tuyển dụng với client (Vue.js) và server (FastAPI).

## Cấu trúc dự án

```
recruitment-management/
├── client/                 # Frontend Vue.js
│   ├── src/                # Mã nguồn
│   ├── Dockerfile          # Cấu hình Docker cho client
│   ├── package.json        # Dependencies và scripts
│   └── ...
├── server/                 # Backend FastAPI
│   ├── app/                # Mã nguồn
│   ├── Dockerfile          # Cấu hình Docker cho server
│   ├── requirements.txt    # Dependencies Python
│   └── ...
├── docker-compose.dev.yml  # Cấu hình Docker cho môi trường phát triển
├── docker-compose.prod.yml # Cấu hình Docker cho môi trường sản phẩm
└── README.md               # Hướng dẫn
```

## Cài đặt và chạy ứng dụng

### Yêu cầu cơ bản
- Node.js 16.x hoặc mới hơn
- Python 3.11 hoặc mới hơn
- MongoDB
- Docker và Docker Compose (nếu sử dụng Docker)

## Cài đặt và chạy với npm (không sử dụng Docker)

### Cài đặt và chạy Client

```bash
# Di chuyển vào thư mục client
cd client

# Cài đặt dependencies
npm install

# Chạy trong môi trường development
npm run dev

# Build cho môi trường production
npm run build

# Xem trước bản build
npm run preview
```

### Cài đặt và chạy Server

```bash
# Di chuyển vào thư mục server
cd server

# Tạo và kích hoạt môi trường ảo Python
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python -m venv venv
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Chạy server trong môi trường development
python server.py

# Chạy server trong môi trường production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## Cài đặt và chạy với Docker

### Môi trường phát triển (Development)

```bash
# Khởi động toàn bộ hệ thống (client + server)
docker-compose -f docker-compose.dev.yml up --build

# Chỉ khởi động client
docker-compose -f docker-compose.dev.yml up --build client

# Chỉ khởi động server
docker-compose -f docker-compose.dev.yml up --build server

# Chạy ở chế độ nền (detached mode)
docker-compose -f docker-compose.dev.yml up --build -d

# Dừng hệ thống
docker-compose -f docker-compose.dev.yml down
```

Truy cập ứng dụng:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

### Môi trường sản phẩm (Production)

```bash
# Khởi động toàn bộ hệ thống (client + server)
docker-compose -f docker-compose.prod.yml up --build

# Chỉ khởi động client
docker-compose -f docker-compose.prod.yml up --build client

# Chỉ khởi động server
docker-compose -f docker-compose.prod.yml up --build server

# Chạy ở chế độ nền (detached mode)
docker-compose -f docker-compose.prod.yml up --build -d

# Dừng hệ thống
docker-compose -f docker-compose.prod.yml down
```

Truy cập ứng dụng:
- Frontend: http://localhost
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Thông tin chi tiết về Docker

### Client (Frontend - Vue.js)

#### Môi trường phát triển
- Sử dụng Node.js 20 Alpine
- Chạy Vite dev server với hot reload
- Mount volume từ máy host vào container (thay đổi code tự động cập nhật)
- Expose port 5173

#### Môi trường sản phẩm
- Build ứng dụng với Node.js 20 Alpine
- Phục vụ static files với Nginx Alpine
- Cấu hình Nginx tùy chỉnh
- Expose port 80

### Server (Backend - FastAPI)

#### Môi trường phát triển
- Sử dụng Python 3.11 Slim
- Chạy qua server.py với hot reload
- Mount volume từ máy host vào container
- Expose port 8000

#### Môi trường sản phẩm
- Sử dụng Python 3.11 Slim
- Chạy qua Uvicorn với multiple workers cho hiệu suất cao
- Tối ưu cho production
- Expose port 8000

## Biến môi trường

### Client
Biến môi trường cho client được định nghĩa trong các file:
- `.env.development`: Môi trường phát triển
- `.env.production`: Môi trường sản phẩm

### Server
Biến môi trường cho server được định nghĩa trong các file:
- `.env.development`: Môi trường phát triển
- `.env.production`: Môi trường sản phẩm

## Xử lý sự cố

- Nếu gặp lỗi khi khởi động Docker, hãy kiểm tra xem các port 5173, 8000, và 80 đã được sử dụng bởi ứng dụng khác chưa
- Nếu gặp lỗi kết nối đến MongoDB, hãy kiểm tra cấu hình kết nối trong file .env của server
- Đối với các lỗi liên quan đến mounting volume trong Docker, hãy đảm bảo đường dẫn tuyệt đối chính xác

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

#### Production Environment

To run the application in production mode:

```bash
# Build and start the container
docker compose up --build

# Run in detached mode
docker compose up -d

# Stop the container
docker compose down
```

The application will be available at http://localhost:8080.

#### Development Environment

For development with hot reloading (changes to your code will automatically update):

```bash
# Build and start the development container
docker compose -f docker-compose.dev.yml up

# Run in detached mode
docker compose -f docker-compose.dev.yml up -d

# Stop the container
docker compose -f docker-compose.dev.yml down
```

The application will be available at http://localhost:5173 in development mode.

#### About Docker Configuration

##### Production Mode (docker-compose.yml)
- Builds the application and serves the static files
- Port mapping: Container's port 3000 → Host's port 8080
- Optimized for production use
- Exposes the application on a bridged network (recruitment-network)
- Accessible on your host machine at http://localhost:8080

##### Development Mode (docker-compose.dev.yml)
- Runs Vite dev server with hot reload enabled
- Mounts your local code into the container for instant updating
- Port mapping: Container's port 5173 → Host's port 5173
- Any changes to your source code will automatically update the running application
- Exposes the development server on a bridged network (recruitment-network)
- Accessible on your host machine at http://localhost:5173

> **Note**: Both configurations expose the service to your host network through port mapping. The application uses a bridge network named "recruitment-network" for container communication.

### Troubleshooting

- If you can't access the application after starting Docker, check that you're using the correct port:
  - Production: http://localhost:8080
  - Development: http://localhost:5173

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