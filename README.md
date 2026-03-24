# Todo / Task Manager App

Simple full-stack task manager with:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js with Express
- Database: MongoDB with Mongoose

## Features

- Create tasks with title, description, status, priority, and due date
- View all tasks
- Move tasks through `todo -> in-progress -> done`
- Delete tasks
- Health endpoint to confirm API and database status

## MongoDB Atlas setup

1. Create a MongoDB Atlas cluster
2. Create a database user
3. Add your machine or deployment IP to the Atlas network access list
4. Copy `.env.example` to `.env`
5. Replace `MONGO_URI` with your Atlas connection string

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster-url/todo_task_manager?retryWrites=true&w=majority
```

## Run with Docker

```bash
docker build -t todo-task-manager .
docker run --env-file .env -p 3000:3000 todo-task-manager
```

Open `http://localhost:3000`

## Run without Docker

1. Copy `.env.example` to `.env`
2. Install dependencies
3. Start the server

```bash
npm install
npm start
```

## API endpoints

- `GET /api/health`
- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`
