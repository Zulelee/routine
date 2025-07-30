# Daily Task Creator

A comprehensive productivity and wellness web application built with Next.js, designed to help you manage daily tasks, track health habits, maintain a daily journal, and review your weekly progress.

## ✨ Features

### 🎯 Daily Task Management

- Create, edit, and delete tasks with priorities and status tracking
- Pin important tasks to the top
- Auto-carry incomplete tasks from yesterday to today
- Drag-and-drop reordering (frontend only)
- Task completion tracking with progress visualization

### 💧 Health & Wellness Tracking

- **Water Intake**: Track daily water consumption (0-8 glasses)
- **Exercise**: Mark daily exercise completion
- **Sleep**: Optional sleep hours tracking
- **Mood**: Daily mood tracking with emoji selection

### 📝 Daily Journaling

- Write daily reflections and thoughts
- Mood tracking with visual indicators
- Expandable journal interface with writing prompts
- Historical journal entry browsing

### 📊 Weekly Reviews

- Automatic weekly statistics generation
- Task completion rates and rollover tracking
- Health metrics averaging
- Personalized insights and recommendations

### 📅 Calendar View

- Monthly calendar with activity indicators
- Color-coded dots for tasks, journal entries, and health data
- Quick overview of daily activities
- Historical data visualization

### 🔧 Settings & Customization

- Theme switching (light/dark mode)
- Notification preferences
- Data export/import capabilities
- App configuration options

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Neon Postgres with Prisma ORM
- **Deployment**: Vercel (Frontend) + Neon (Database)
- **Icons**: Lucide React
- **Date Handling**: date-fns

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon Postgres database account

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd task-scheduler
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   DATABASE_URL="your-neon-postgres-connection-string"
   ```

4. **Set up the database**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Daily Workflow

1. **Today Page**: Start your day by viewing today's tasks and health tracking
2. **Add Tasks**: Create new tasks with priorities and descriptions
3. **Track Health**: Update water intake, exercise, and mood
4. **Journal**: Write daily reflections and thoughts
5. **End Day**: Review your progress and plan for tomorrow

### Navigation

- **🏠 Today**: Main dashboard with tasks and health tracking
- **📅 Calendar**: Monthly view with activity indicators
- **📊 Weekly**: Weekly statistics and insights
- **📝 Journal**: Historical journal entries and mood tracking
- **⚙️ Settings**: App configuration and preferences

### Key Features

- **Auto-carry**: Incomplete tasks automatically carry forward to the next day
- **Real-time Updates**: All changes save automatically
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Clean UI**: Modern, minimalist interface inspired by Notion

## 🗄 Database Schema

### Core Tables

- **users**: User accounts (single user for now)
- **tasks**: Daily tasks with status, priority, and pinning
- **daily_logs**: Health tracking and journal entries
- **weekly_reviews**: Automated weekly statistics

### Key Relationships

- All data is associated with a single user (ID: 'me')
- Tasks are linked to specific dates
- Daily logs have unique constraints per user/date
- Weekly reviews are generated automatically

## 🚀 Deployment

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database (Neon)

1. Create a Neon Postgres project
2. Get your connection string
3. Update environment variables
4. Run database migrations

### Environment Variables

```env
DATABASE_URL="postgresql://user:password@host:port/database"
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:seed      # Seed database with sample data
```

### Project Structure

```
task-scheduler/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── calendar/          # Calendar page
│   ├── journal/           # Journal page
│   ├── settings/          # Settings page
│   ├── weekly/            # Weekly review page
│   └── page.tsx           # Today page (home)
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── navigation.tsx    # Main navigation
│   ├── task-card.tsx     # Task display component
│   ├── task-form.tsx     # Task creation/editing
│   ├── health-tracker.tsx # Health tracking component
│   └── journal-entry.tsx # Journal component
├── lib/                  # Utility functions
│   ├── db.ts            # Database client
│   ├── types.ts         # TypeScript types
│   └── utils.ts         # Utility functions
├── prisma/              # Database schema and migrations
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seeding
└── public/              # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful components
- [Lucide](https://lucide.dev/) for icons
- [date-fns](https://date-fns.org/) for date utilities
- [Neon](https://neon.tech/) for serverless Postgres
- [Vercel](https://vercel.com/) for hosting

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, TypeScript, and Tailwind CSS**
