# 📋 My Tasks — React + PostgreSQL Todo App

A full-stack todo app with React frontend, Express backend, and PostgreSQL for persistent storage.

---

## 🗂️ Project Structure

```
todo-app/
├── backend/
│   ├── server.js         # Express API server
│   ├── .env.example      # Environment variables template
│   └── package.json
└── frontend/
    ├── src/
    │   ├── App.js        # Main React component
    │   ├── App.css       # Styles
    │   └── index.js      # Entry point
    ├── public/
    │   └── index.html
    └── package.json
```

---

## ⚙️ Setup & Run

### 1. Create the PostgreSQL Database

```sql
-- In psql or pgAdmin, run:
CREATE DATABASE tododb;
```

> The app auto-creates the `todos` table on first run.

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env

# Edit .env with your PostgreSQL credentials
nano .env   # or open in VS Code
```

**`.env` file:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tododb
DB_USER=postgres
DB_PASSWORD=yourpassword
PORT=5000
```

```bash
# Start the backend
npm start
```

Backend runs on: http://localhost:5000

---

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the React app
npm start
```

Frontend runs on: http://localhost:3000

> The `"proxy": "http://localhost:5000"` in frontend/package.json automatically forwards `/api/*` requests to the backend.

---

## ✨ Features

- ✅ **Add tasks** with title, description, priority, and due date
- ✏️ **Edit** any task
- ✓ **Mark complete/incomplete** with a click
- 🗑️ **Delete** tasks
- 🔍 **Search** tasks by title or description
- 🏷️ **Filter** by All / Active / Completed
- ⚠️ **Overdue detection** for past-due tasks
- 🟢 **DB connection indicator** in the header
- 💾 All data **persisted in PostgreSQL**

---

## 🔌 API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/todos` | Get all todos |
| GET | `/api/todos/:id` | Get single todo |
| POST | `/api/todos` | Create todo |
| PATCH | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |
| GET | `/api/health` | Check DB connection |

---

## 🛠️ Tech Stack

- **Frontend**: React 18, CSS3, Google Fonts (Sora + JetBrains Mono)
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (via `pg` library)
