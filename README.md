# SpeakUp 🎙️

> **Daily Tech Video Journaling & Public Speaking Studio for Engineers and Technical Leaders.**

SpeakUp helps software engineers, architects, and tech enthusiasts develop clear, confident, and concise communication skills. Practice delivering high-impact 2–3 minute technical talks every day, backed by intelligent AI research, teleprompter HUD, interactive speech coaching, and offline-first private storage.

---

## 🌟 Key Features

- **2,500+ Curated Tech Topics**: Deep-dive into distributed systems, AI & LLMs, cloud architecture, security, developer tooling, databases, and engineering leadership.
- **2–3 Minute Speech Studio**: Full in-browser camera studio with live audio visualizer waveforms, elapsed/countdown timers, and a teleprompter notes HUD overlay.
- **Search-Grounded AI Briefings**: Instant, fact-checked technical briefings powered by Gemini with Google Search grounding to prepare 3 core talking points in under 5 minutes.
- **Coach Vance (AI Speech Coach)**: Multi-turn conversational speech mentor designed to critique filler words, sharpen hooks, and recommend the *Problem → Architecture → Tradeoff* delivery formula.
- **AI Topic Synthesizer**: Generate new batches of custom, non-duplicative topics on the fly to match your learning goals.
- **Ambient Focus Audio**: Built-in lo-fi and ambient audio generator powered by Gemini Audio to maintain flow during the 5–10 minute research phase.
- **100% Privacy-First & Offline Storage**: Video journals, notes, and topic progress are persisted locally in IndexedDB inside your browser. No video is ever sent to external cloud storage without your explicit action.
- **Data Portability**: Full backup, export, and import support for your entire journal catalog and recordings.

---

## 🏗️ Architecture

```
SpeakUp/
├── server.ts              # Express server + Gemini API proxy (Gemini 3.8 Flash)
├── vite.config.ts         # Vite build configuration with React & Tailwind CSS
├── index.html             # Application entrypoint & SEO metadata
├── src/
│   ├── App.tsx            # Primary application container & tab router
│   ├── components/
│   │   ├── CameraStudio.tsx      # Video recorder, camera viewport, teleprompter HUD
│   │   ├── CoachPanel.tsx        # "Coach Vance" interactive coaching assistant
│   │   ├── JournalArchive.tsx    # Saved video entries, playback, and export
│   │   ├── ResearchHub.tsx       # 5–10 min research phase, timer, focus audio
│   │   ├── StorageSyncModal.tsx  # Backup, restore, and IndexedDB management
│   │   ├── TopNavigation.tsx     # Header bar, stats counters, daily sprint button
│   │   └── TopicsExplorer.tsx    # Library of 2,500+ searchable topics
│   ├── data/
│   │   └── topics.ts             # Curated technical topic database
│   ├── db/
│   │   └── journalDb.ts          # IndexedDB persistence layer (videos, states, notes)
│   └── utils/
│       └── focusAudio.ts         # Audio generation & web audio context helpers
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes with Node.js)
- A **Gemini API Key** from [Google AI Developer Portal](https://ai.google.dev/)

### 1. Clone the repository

```bash
git clone https://github.com/Sansi-28/SpeakUp.git
cd SpeakUp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and add your Gemini API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
GEMINI_API_KEY="your_actual_gemini_api_key_here"
PORT=3000
```

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Express server with Vite middleware in development mode |
| `npm run build` | Compiles the client-side production bundle via Vite |
| `npm start` | Runs the production Express server serving the static build |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |

---

## 🔒 Privacy & Permissions

- **Camera & Microphone**: SpeakUp requires camera and audio permissions to record practice sessions. All recording logic is processed locally using the browser's `MediaRecorder` API.
- **Local Storage**: Video recordings are stored as Blobs directly in client-side IndexedDB (`SpeakUpDB`). Your practice recordings remain entirely on your machine.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
