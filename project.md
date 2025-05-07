```md
# 🤖 AI Marketing Agent Builder

A full-stack AI-powered web app that helps marketers create and use custom agents to generate social media content. Built with **Next.js 15**, **Tailwind CSS**, **ShadCN UI**, **Express.js**, **Prisma**, and **SQLite**.

---

## 🌟 Project Overview

AI Marketing Agent Builder enables marketers to create custom AI agents that generate social media posts based on brand voice, audience, and platform. Powered by OpenAI's LLMs, this tool boosts content productivity with a sleek UI and a fast backend.

---

## 🧩 Features (MVP)

- ✅ Create and manage AI marketing agents
- ✍️ Define tone, audience, platform, and CTA style
- ⚡ Generate multiple post variations via LLM
- 🛠️ Edit, copy, or delete generated content
- 📤 Export posts to CSV or clipboard
- 🗂 Agent history and post reuse (optional)

---

## 🛠 Tech Stack

**Frontend:**

- [Next.js 15 (App Router)](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.dev/)
- [Prisma Client](https://www.prisma.io/docs)

**Backend:**

- [Express.js](https://expressjs.com/)
- [Prisma ORM](https://www.prisma.io/)
- [SQLite](https://www.sqlite.org/)
- [OpenAI API](https://platform.openai.com/)

---

## 📁 Folder Structure (Basic)
```

    /frontend
    /app
    /agents
    /generate
    layout.tsx
    page.tsx
    /components
    \- AgentForm.tsx
    \- PostCard.tsx
    prisma/
    \- schema.prisma
    lib/
    \- prisma.ts
    \- api.ts

    /backend
    /routes
    \- agents.js
    \- generate.js
    prisma/
    \- schema.prisma
    server.js

````

---

## ⚙️ Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/your-username/ai-marketing-agent.git
cd ai-marketing-agent
````

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
node server.js
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npx prisma generate
npm run dev
```

Make sure to set the API URL in your `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
OPENAI_API_KEY=your-api-key
```

---

## 🧪 Sample API Call

```ts
POST /api/generate
{
  "tone": "Professional",
  "platform": "LinkedIn",
  "cta": "Learn more",
  "product": "AI agent builder"
}
```

---

## 📌 Future Roadmap

- ⏳ Agent memory and personalization
- 📊 Analytics dashboard (engagement, performance)
- 🔄 Multi-channel scheduling (Twitter, LinkedIn)
- 🧠 Fine-tuned GPT for brand-specific outputs
- 👥 Team collaboration features

---

## 📜 License

MIT License © 2025 Mahfujur Rahman
