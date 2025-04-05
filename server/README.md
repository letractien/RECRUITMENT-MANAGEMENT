# Recruitment Management Server

This is the backend server for the Recruitment Management System, built with FastAPI and MongoDB.

## Prerequisites

- Python 3.8 or higher
- MongoDB (local installation or MongoDB Atlas account)
- MongoDB Compass (for database visualization)

## Setup Instructions

1. **Install MongoDB**:
   - Follow the instructions at [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/) to install MongoDB Community Edition
   - Install MongoDB Compass from [here](https://www.mongodb.com/try/download/compass)

2. **Set up Python environment**:
   ```bash
   # Create a virtual environment
   python -m venv venv
   
   # Activate virtual environment
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

3. **Configure Environment Variables**:
   - Edit the `.env` file with your configuration settings
   - Make sure to change the `SECRET_KEY` for production use

4. **Initialize Database**:
   - Start MongoDB service (if not running)
   - Run the database initialization script:
   ```bash
   python -m app.db.database
   ```

5. **Seed Database with Sample Data (Optional)**:
   - To populate the database with sample data for testing:
   ```bash
   python -m app.db.seed
   ```
   - This will create sample users, candidates, jobs, and interviews
   - Default user credentials:
     - Admin: username `admin`, password `admin123`
     - HR: username `hr_manager`, password `hr123`
     - Interviewer: username `interviewer1`, password `interviewer123`
     - Regular user: username `user`, password `user123`

6. **Start the server**:
   ```bash
   python server.py
   ```

## API Documentation

When the server is running, you can access the auto-generated API documentation:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Data Model

The system uses MongoDB to store the following collections:

- **candidates**: Candidate profiles and application status
- **jobs**: Job posting details
- **interviews**: Interview schedules and feedback

## Running

For development, the server runs in reload mode by default, which automatically applies code changes. 