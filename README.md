# Noah — Personal Learning Platform (Angular)

Noah is a study-oriented Single Page Application (SPA) designed to help you organize learning materials, practice spaced repetition flashcards, self-test with dynamic quizzes, and manage study sessions using the Pomodoro technique.

Instead of a simple CRUD app, Noah implements real-world Angular design patterns that are ready for a backend API migration later.

## 🚀 Key Features

Noah features **7 lazy-loaded pages**:
1. **📊 Dashboard** — View focus stats, streak logs, recent activity feed, and study recommendations.
2. **🃏 Flashcards** — Manage subject decks and review card decks using a **Leitner Box spaced repetition algorithm** (Box 1-5).
3. **❓ Quiz Arena** — Dynamically generate multiple choice and type-in-answer quizzes from your decks. Review detailed question-by-question scoring and answer breakdowns.
4. **⏱️ Focus Timer** — An interactive Pomodoro countdown timer with customizable session lengths, breaks, audio notifications, and daily completion logs.
5. **📚 Resource Bookmarks** — Save reference articles, videos, documentation, and tools. Tag and filter by topic or category.
6. **📈 Learning Analytics** — Interactive, custom-built SVG charts tracking daily focus minutes, average quiz scores over time, and Leitner box distributions.
7. **⚙️ Preferences** — Toggle theme styles (dark/light theme support), adjust Pomodoro defaults, backup database logs, or import/export settings via JSON.

---

## 🛠️ Architecture & Concepts Covered

- **RxJS Observable Services** — All services abstract database read/write methods to return Observables (e.g. `of()`), so swapping out the client-side `localStorage` data source for a REST API client later takes just one line per method.
- **Lazy Loading** — Each section of the dashboard is dynamically loaded on demand, minimizing the initial bundle payload.
- **Route Guards & Interceptors** — Warns users before navigating away from a quiz in progress (`QuizActiveGuard`) and intercepts HTTP requests stubbed for JWT authentication headers (`ApiInterceptor`).
- **Reactive Forms & Validators** — Validates URLs, character lengths, and configuration ranges when creating flashcards, decks, and bookmarks.
- **State Management** — Leverages BehaviorSubjects and signals (`ThemeService`) for real-time state synchronization across the dashboard.
- **Custom Pipes & Directives** — Format focus durations dynamically into structured time templates.

---

## 💻 Setup & Local Development

### Prerequisites
- **Node.js**: LTS version (v18+)
- **npm**: v9+

### Installation
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Noah
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Start Development Server
Run the local dev server:
```bash
npx ng serve
```
Open your browser and navigate to `http://localhost:4200/`. The app will reload automatically if you modify any files.

### Production Build
Build the project for deployment:
```bash
npx ng build --configuration=production
```
The build artifacts will be stored in the `dist/noah/` directory.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── core/                          # Core Layer (Singleton Services, Guards, Interceptors)
│   │   ├── services/
│   │   │   ├── storage.service.ts     # localStorage wrapper (ready for HTTP swap)
│   │   │   ├── flashcard.service.ts
│   │   │   ├── quiz.service.ts
│   │   │   ├── timer.service.ts
│   │   │   ├── resource.service.ts
│   │   │   ├── progress.service.ts
│   │   │   └── theme.service.ts
│   │   ├── guards/
│   │   │   └── quiz-active.guard.ts   # Confirms navigation during active quiz
│   │   ├── interceptors/
│   │   │   └── api.interceptor.ts     # Ready to insert auth tokens
│   │   └── models/                    # TypeScript interfaces
│   ├── shared/                        # Shared Layer (Reusable Components, Pipes, Directives)
│   │   ├── components/
│   │   │   ├── sidebar/               # Main navigation (collapses on mobile)
│   │   │   ├── stat-card/             # Displays metrics with trend indices
│   │   │   └── confirm-dialog/        # Reusable modal confirmation popups
│   │   └── pipes/
│   │       └── time-format.pipe.ts    # Custom formatting pipe
│   ├── features/                      # Feature Layer (Lazy Loaded Page Components)
│   │   ├── dashboard/
│   │   ├── flashcards/
│   │   ├── quiz/
│   │   ├── timer/
│   │   ├── resources/
│   │   ├── progress/
│   │   └── settings/
│   ├── app.ts                         # Root component
│   ├── app.routes.ts                  # Routing module
│   └── app.config.ts                  # App configuration
├── index.html                         # Entry point html
├── main.ts                            # Bootstrap script
└── styles.css                         # Global styles & layout variables
```
