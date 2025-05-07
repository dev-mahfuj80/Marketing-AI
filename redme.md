````md
# 🤖 AI Marketing Agent Builder

An AI-powered full-stack web app that allows marketers to create intelligent agents for generating social media content based on tone, audience, platform, and CTA. Built with:

- **Frontend:** Next.js 15, Tailwind CSS, ShadCN UI, Prisma Client
- **Backend:** Express.js, Prisma ORM, SQLite
- **AI:** OpenAI API

---

## 🚀 Live Demo

Coming soon...

---

## 📸 Screenshots

> Add screenshots or GIFs of the UI once available.

---

## ✨ Features

- Create and manage marketing AI agents
- Input tone, audience, CTA, and platform
- Generate multiple content variations via OpenAI
- Edit, copy, or delete generated content
- Export posts to CSV or clipboard
- (Optional) Agent history and reuse

---

## 🧠 How It Works

1. Marketer creates a custom AI agent with brand voice, audience type, and preferred social platform.
2. The agent uses the OpenAI API to generate post variations.
3. Generated content is displayed, editable, and exportable.
4. All content is stored in SQLite for future access (optional).

---

## 🧩 Tech Stack

| Layer     | Tech                                |
| --------- | ----------------------------------- |
| Frontend  | Next.js 15, Tailwind CSS, ShadCN UI |
| Backend   | Express.js, Prisma, SQLite          |
| AI Engine | OpenAI GPT API                      |

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-marketing-agent-builder.git
cd ai-marketing-agent-builder
```
````

---

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
node server.js
```

Ensure `.env` includes:

```
DATABASE_URL="file:./dev.db"
OPENAI_API_KEY="your-api-key"
```

---

### 3. Frontend Setup

```bash
cd frontend
npm install
npx prisma generate
npm run dev
```

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
OPENAI_API_KEY=your-api-key
```

---

## 🗃️ Folder Structure

```
/frontend
  /app
  /components
  /lib
  prisma/
  .env.local

/backend
  /routes
  prisma/
  .env
  server.js
```

---

## 📌 API Endpoints

| Method | Endpoint         | Description               |
| ------ | ---------------- | ------------------------- |
| POST   | /generate        | Generate posts via OpenAI |
| POST   | /agents          | Create a new agent        |
| GET    | /agents          | List all agents           |
| GET    | /posts/\:agentId | Get posts for an agent    |

---

## 📦 Deployment

- Frontend: [Vercel](https://vercel.com/)
- Backend: [Render](https://render.com/), [Railway](https://railway.app/), or self-host

---

## 🧪 TODO

See [`TODO.md`](./TODO.md) for the task list.

---

## 📄 License

MIT License © 2025 [Mahfujur Rahman](mailto:mahfujurrahman06627@gmail.com)
