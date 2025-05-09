# Marketing AI Dashboard

A comprehensive dashboard for social media marketing that allows users to connect their social media accounts, create and schedule posts, and view analytics - all in one place.

## Features

- **User Authentication**: Secure login and registration system
- **Social Media Integration**: Connect Facebook and LinkedIn accounts
- **Post Management**: Create, schedule, and publish posts to multiple platforms
- **Unified Dashboard**: View posts from all connected platforms in one place
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- **Framework**: Next.js
- **UI Components**: Shadcn UI
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation

### Backend
- **Server**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with HTTP-only cookies
- **API Integration**: Facebook Graph API and LinkedIn API

## Project Structure

```
├── be/                       # Backend (Express + Prisma)
│   ├── prisma/               # Prisma schema and migrations
│   ├── src/
│   │   ├── config/           # Environment and configuration
│   │   ├── controllers/      # API controllers
│   │   ├── middlewares/      # Express middlewares
│   │   ├── routes/           # API routes
│   │   ├── types/            # TypeScript definitions
│   │   └── utils/            # Helper utilities
│   ├── index.ts              # Entry point
│   └── package.json          # Dependencies
│
├── fe/                       # Frontend (Next.js)
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── app/              # Next.js app router
│   │   ├── components/       # React components
│   │   │   ├── dashboard/    # Dashboard-specific components
│   │   │   ├── auth/         # Authentication components
│   │   │   └── ui/           # Reusable UI components
│   │   ├── lib/              # Utilities and helpers
│   │   │   ├── store/        # Zustand stores
│   │   │   └── utils.ts      # Utility functions
│   │   └── middleware.ts     # Next.js middleware
│   └── package.json          # Dependencies
│
└── README.md                 # Project documentation
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or newer)
- PostgreSQL database
- Facebook and LinkedIn developer accounts (for API keys)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd be
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/marketing_ai"
   JWT_SECRET="your-jwt-secret"
   FACEBOOK_APP_ID="your-facebook-app-id"
   FACEBOOK_APP_SECRET="your-facebook-app-secret"
   LINKEDIN_CLIENT_ID="your-linkedin-client-id"
   LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
   FRONTEND_URL="http://localhost:3000"
   REDIRECT_URI="http://localhost:3001/api/social"
   ```

4. Set up the database:
   ```bash
   npx prisma migrate dev
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd fe
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file:
   ```
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## API Routes

### Auth Routes
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh access token

### Social Media Routes
- `GET /api/social/facebook` - Initiate Facebook OAuth
- `GET /api/social/linkedin` - Initiate LinkedIn OAuth
- `DELETE /api/social/:platform/disconnect` - Disconnect a social account

### Post Routes
- `GET /api/posts/facebook` - Get Facebook posts
- `GET /api/posts/linkedin` - Get LinkedIn posts
- `POST /api/posts` - Create a new post

## Future Enhancements
- Post scheduling functionality
- Content analytics dashboard
- AI-powered content suggestions
- Multi-image post support
- Comment management

## License
MIT
