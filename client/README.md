# Client - Recruitment Management System

Frontend application của hệ thống quản lý tuyển dụng, được xây dựng với Vue.js.

## Công nghệ

- Vue.js 3
- Vite (Build tool)
- Element Plus & Ant Design Vue (UI Libraries)
- Pinia & Vuex (State Management)
- Vue Router
- Axios (HTTP Client)

## Cấu trúc thư mục

```
client/
├── src/                 # Mã nguồn
│   ├── assets/          # Tài nguyên tĩnh (CSS, hình ảnh)
│   ├── components/      # Components UI có thể tái sử dụng
│   ├── pages/           # Components trang
│   ├── router/          # Cấu hình Vue Router
│   ├── store/           # Quản lý state (Pinia hoặc Vuex)
│   ├── utils/           # Các hàm tiện ích
│   │   ├── api/         # Các module service API
│   │   └── helpers/     # Các hàm helper
│   ├── App.vue          # Component gốc
│   └── main.js          # Điểm vào ứng dụng
├── public/              # Static assets
├── index.html           # HTML template
├── vite.config.js       # Cấu hình Vite
├── Dockerfile           # Cấu hình Docker
├── nginx.conf           # Cấu hình Nginx cho production
├── .env.development     # Biến môi trường phát triển
├── .env.production      # Biến môi trường sản phẩm
└── package.json         # Dependencies và scripts
```

## Cài đặt và phát triển

### Yêu cầu
- Node.js 16.x hoặc mới hơn
- npm hoặc yarn

### Cài đặt và chạy với npm

```bash
# Cài đặt dependencies
npm install

# Khởi động development server
npm run dev

# Build cho môi trường production
npm run build

# Preview bản build
npm run preview
```

### Cài đặt và chạy với Docker

#### Môi trường phát triển (Development)

```bash
# Từ thư mục gốc của dự án:
docker-compose -f docker-compose.dev.yml up --build client

# Chỉ từ thư mục client:
docker build -t recruitment-client-dev --target development .
docker run -p 5173:5173 -v ${PWD}:/app -v /app/node_modules recruitment-client-dev

# Dùng PowerShell trên Windows:
docker run -p 5173:5173 -v ${PWD}:/app -v /app/node_modules recruitment-client-dev
```

Truy cập ứng dụng tại: http://localhost:5173

#### Môi trường sản phẩm (Production)

```bash
# Từ thư mục gốc của dự án:
docker-compose -f docker-compose.prod.yml up --build client

# Chỉ từ thư mục client:
docker build -t recruitment-client-prod --target production .
docker run -p 80:80 recruitment-client-prod
```

Truy cập ứng dụng tại: http://localhost

## Chi tiết Docker

### Multi-stage build

Dockerfile sử dụng multi-stage build cho cả môi trường phát triển và sản phẩm:

1. **Base Stage**:
   - Node.js 20 Alpine làm image cơ sở
   - Cài đặt dependencies
   
2. **Development Stage**:
   - Kế thừa từ base stage
   - Cấu hình cho môi trường phát triển
   - Chạy Vite dev server với hot reload
   
3. **Build Stage**:
   - Kế thừa từ base stage
   - Build ứng dụng thành static files
   
4. **Production Stage**:
   - Sử dụng Nginx Alpine
   - Copy static files từ build stage
   - Cấu hình Nginx

## Scripts npm

| Script    | Mô tả                                       |
|-----------|---------------------------------------------|
| dev       | Chạy Vite dev server với hot reload         |
| build     | Build ứng dụng cho môi trường sản phẩm      |
| preview   | Xem trước bản build sản phẩm                |

## Biến môi trường

| Biến             | Mô tả                    | File                |
|------------------|--------------------------|--------------------|
| VITE_API_URL     | URL cơ sở của API        | .env.development   |
|                  |                          | .env.production    |

## Xử lý sự cố

- **Lỗi khi cài đặt dependencies**: Kiểm tra phiên bản Node.js có tương thích không
- **Lỗi khi khởi động Docker**: Kiểm tra xem các port 5173 hoặc 80 đã được sử dụng chưa
- **Hot reload không hoạt động**: Kiểm tra cấu hình Volume trong Docker Compose 