```md
# ✅ TODO List – AI Marketing Agent Builder

This document tracks development tasks for the MVP and upcoming features. Check off tasks as you progress.

---

## 🔧 Project Setup

- [x] Initialize Next.js 15 project with Tailwind CSS and ShadCN UI
- [x] Set up Express.js backend with Prisma and SQLite
- [x] Create shared Prisma schema for Agent and Post
- [x] Configure OpenAI API key in environment files
- [ ] Add CORS and body-parser middleware in Express

---

## 🧠 Backend (Express + Prisma + SQLite)

- [x] Create `/agents` endpoint: Create + List Agents
- [x] Create `/generate` endpoint: Generate post using OpenAI
- [x] Store generated posts in DB (linked to agent)
- [ ] Add endpoint to fetch agent post history
- [ ] Add basic error handling and validation
- [ ] Add logging for debugging and analytics (optional)

---

## 🎨 Frontend (Next.js 15 + Tailwind + ShadCN UI)

- [x] Agent creation form with fields (name, tone, audience, platform, CTA)
- [x] Post generation form (connected to agent)
- [x] Display generated post variations (PostCard)
- [ ] Add "Copy", "Edit", "Delete", and "Export" buttons
- [ ] Create Agent Dashboard to manage past agents and outputs
- [ ] Add loading state and skeletons
- [ ] Add toast notifications (success/error)
- [ ] Create responsive UI with proper layout and spacing

---

## 🧪 Testing

- [ ] Test backend endpoints with Postman or Thunder Client
- [ ] Add frontend integration tests (optional)
- [ ] Validate LLM output formats and error handling

---

## 📦 Deployment (optional)

- [ ] Deploy backend to Vercel Functions / Render / Railway
- [ ] Deploy frontend to Vercel
- [ ] Add environment variables in production

---

## 🚀 Future Improvements

- [ ] Agent training memory (history + fine-tuning support)
- [ ] Advanced prompt tuning with agent presets
- [ ] Analytics dashboard for posts and agents
- [ ] OAuth + session-based agent ownership
- [ ] Multi-platform posting (Twitter/X, Instagram, etc.)

---

## 🧹 Cleanup

- [ ] Add ESLint + Prettier
- [ ] Remove unused dependencies
- [ ] Optimize API calls and improve caching
```

---
