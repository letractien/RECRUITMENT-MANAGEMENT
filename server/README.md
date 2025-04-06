# Server - Recruitment Management System

API backend cho hệ thống quản lý tuyển dụng, xây dựng với FastAPI và MongoDB.

## Công nghệ

- FastAPI - Framework API hiệu năng cao
- MongoDB - Database NoSQL
- Pydantic - Data validation
- Python 3.11+ 
- Uvicorn - ASGI server

## Cấu trúc thư mục

```
server/
├── app/                 # Mã nguồn chính
│   ├── api/             # API endpoints
│   ├── core/            # Core functionality
│   ├── db/              # Database
│   ├── models/          # Pydantic models
│   ├── services/        # Business logic
│   ├── utils/           # Tiện ích
│   └── main.py          # Ứng dụng FastAPI
├── Dockerfile           # Cấu hình Docker
├── .env.development     # Biến môi trường phát triển
├── .env.production      # Biến môi trường sản phẩm
├── requirements.txt     # Python dependencies
└── server.py            # Script khởi động server
```

## Cài đặt và phát triển

### Yêu cầu

- Python 3.11 hoặc mới hơn
- MongoDB (local hoặc MongoDB Atlas)
- pip (Python package manager)

### Cài đặt và chạy với Python/pip

#### Bước 1: Cài đặt MongoDB
- Làm theo hướng dẫn tại [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)
- Hoặc sử dụng MongoDB Atlas cloud service

#### Bước 2: Thiết lập môi trường Python

```bash
# Tạo môi trường ảo
python -m venv venv

# Kích hoạt môi trường ảo
# Trên Windows:
venv\Scripts\activate
# Trên macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

#### Bước 3: Cấu hình biến môi trường
- Tạo file `.env` từ `.env.development` hoặc `.env.production`
- Cập nhật các thông tin cấu hình như kết nối database, secret key

#### Bước 4: Khởi động server

```bash
# Môi trường phát triển với hot reload
python server.py

# Hoặc khởi động trực tiếp với Uvicorn
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Cài đặt và chạy với Docker

#### Môi trường phát triển (Development)

```bash
# Từ thư mục gốc của dự án:
docker-compose -f docker-compose.dev.yml up --build server

# Hoặc chỉ từ thư mục server:
docker build -t recruitment-server-dev --target development .
docker run -p 8000:8000 -v ${PWD}:/app recruitment-server-dev

# Dùng PowerShell trên Windows:
docker run -p 8000:8000 -v ${PWD}:/app recruitment-server-dev
```

Truy cập API tại:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### Môi trường sản phẩm (Production)

```bash
# Từ thư mục gốc của dự án:
docker-compose -f docker-compose.prod.yml up --build server

# Hoặc chỉ từ thư mục server:
docker build -t recruitment-server-prod --target production .
docker run -p 8000:8000 recruitment-server-prod
```

Truy cập API tại:
- API: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Chi tiết Docker

### Multi-stage build

Dockerfile sử dụng multi-stage build cho cả môi trường phát triển và sản phẩm:

1. **Base Stage**:
   - Python 3.11 Slim làm image cơ sở
   - Cài đặt system dependencies và Python dependencies
   
2. **Development Stage**:
   - Kế thừa từ base stage
   - Cấu hình cho môi trường phát triển
   - Chạy qua server.py với hot reload
   
3. **Production Stage**:
   - Kế thừa từ base stage
   - Tối ưu cho môi trường sản phẩm
   - Chạy qua Uvicorn với multiple workers

## Biến môi trường

Các biến môi trường quan trọng:

| Biến                 | Mô tả                          | File               |
|----------------------|--------------------------------|--------------------|
| MONGODB_URL          | URL kết nối MongoDB            | .env.development   |
|                      |                                | .env.production    |
| JWT_SECRET_KEY       | Secret key cho JWT             | .env.development   |
|                      |                                | .env.production    |
| DEBUG                | Chế độ debug                   | .env.development   |
| HOST                 | Host address                   | Docker environment |
| PORT                 | Port number                    | Docker environment |

## API Documentation

FastAPI tự động tạo tài liệu API interactive dựa trên schema. Khi server đang chạy:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Xử lý sự cố

- **Lỗi kết nối MongoDB**: Kiểm tra URL kết nối và xác nhận MongoDB đang chạy
- **Lỗi môi trường Docker**: Kiểm tra cấu hình trong docker-compose file
- **Lỗi port bị chiếm**: Kiểm tra xem port 8000 đã được sử dụng bởi ứng dụng khác chưa

## Data Model

The system uses MongoDB to store the following collections:

- **candidates**: Candidate profiles and application status
- **jobs**: Job posting details
- **interviews**: Interview schedules and feedback

## Running

For development, the server runs in reload mode by default, which automatically applies code changes. 