# Smart Notes Manager

A beginner-friendly full-stack CRUD web app using React + Django REST Framework + PostgreSQL.

## Features
- User signup/login
- Create notes
- Edit notes
- Delete notes
- Tag notes
- Search notes by title/content
- Filter notes by tag
- Optional AI summary endpoint placeholder

## Project Structure
```
smart_notes_manager/
  backend/
  frontend/
```

## Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

## Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Backend URL
Django runs on:
```
http://127.0.0.1:8000/
```

Frontend runs on:
```
http://localhost:5173/
```

## PostgreSQL
Update database details in:
```
backend/smartnotes/settings.py
```

For quick testing, you can switch to SQLite by using the commented SQLite config in settings.py.
