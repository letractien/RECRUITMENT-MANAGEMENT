import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db.database import init_db
from .routes import candidates, jobs, interviews, dashboard

# Create FastAPI app
app = FastAPI(
    title="Recruitment Management API",
    description="API for managing recruitment processes",
    version="1.0.0",
    redirect_slashes=False
)

# Configure CORS
origins = [
    "http://localhost:5173",  # Default Vite dev server
    "http://localhost:3000",
    "http://localhost:8080",
]

if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(candidates.router, prefix="/api/v1")
app.include_router(jobs.router, prefix="/api/v1")
app.include_router(interviews.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")

# Startup event
@app.on_event("startup")
async def startup_event():
    init_db()


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "ok", "message": "API is running"}


# Root endpoint 
@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to the Recruitment Management API",
        "docs": "/docs",
        "redoc": "/redoc"
    }