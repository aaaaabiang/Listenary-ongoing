# 🎧 Listenary

> **Learn English Through Podcasts** - Your Language Learning Companion

Listenary is a comprehensive English language learning platform that transforms podcast listening into an interactive learning experience. Listen to your favorite podcasts, get real-time transcriptions, translate content, and build your personalized vocabulary list - all in one place.

## Running deployed application

https://listenary-ongoing.fly.dev/#/

---

## Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Testing Sample RSS Feeds](#testing-sample-rss-feeds)
- [Deployment](#deployment)
- [Usage Guide](#usage-guide)
- [Future Work](#future-work)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)

---

## Features

### Podcast Management
- RSS Feed Integration - Load any podcast from public RSS feeds
- Smart Discovery - Search and discover podcasts by keyword
- Channel Management - Subscribe to your favorite podcast channels
- Episode Library - Browse and manage podcast episodes
- Bookmark & Save - Save podcasts to your personal library

### Audio Player
- Advanced Playback - Full-featured audio player with controls
- Waveform Visualization - Visual representation of audio using WaveSurfer.js
- Time Synchronization - Click on waveform to jump to specific timestamps
- Playback Controls - Play, pause, seek, and volume control

### Real-time Transcription
- Speech-to-Text - Automatic transcription of podcast episodes
- WebSocket Streaming - Real-time transcription as you listen
- Time-Aligned Text - Transcripts synchronized with audio timestamps
- Persistent Storage - Save and retrieve transcriptions anytime

### Translation & Dictionary
- Multi-language Translation - Translate transcripts to your native language
- Word Lookup - Instant dictionary definitions with one click
- Phonetic Support - Learn correct pronunciation
- Context-Aware - Get translations in context

### Personal Wordlist
- Vocabulary Builder - Save words while learning
- Definition Storage - Keep word definitions and examples
- Progress Tracking - Monitor your vocabulary growth
- Cloud Sync - Access your wordlist across devices

### User Management
- Firebase Authentication - Secure login with email/password
- Personal Profile - Manage your account and preferences
- Data Persistence - All your data saved to cloud
- Cross-Device Sync - Access your data from anywhere

---

## Architecture

Listenary follows a modern full-stack architecture with clear separation of concerns:

**[View Detailed Architecture Documentation →](./ARCHITECTURE%20GRAPHIC.md)**

### Frontend - MVP Pattern
```
┌─────────────────────────────────────────┐
│         View Layer (React)              │
│  HomeView, PodcastView, WordlistView    │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│      Presenter Layer (Logic)            │
│   Handle user actions & state updates   │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Model Layer (MobX)                │
│    Observable state & data management   │
└─────────────────────────────────────────┘
```

### Backend - Modular Microservices
```
Express Server
├── /api/auth         → User authentication
├── /api/user         → User & wordlist management
├── /api/rss          → RSS feed parsing & subscriptions
├── /api/podcasts     → Podcast discovery & search
├── /api/transcriptions → Speech-to-text (WebSocket)
├── /api/translate    → Text translation
└── /api/dictionary   → Word definitions & lookup
```

### Data Flow
```
Frontend (React + MobX)
    ↕ HTTP/WebSocket
Backend (Express + TypeScript)
    ↕ Mongoose ODM
MongoDB (Database)
    +
Firebase (Authentication)
```

---
## Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **MongoDB** (local or Atlas)
- **Firebase Project** (for authentication)
- **npm** or **yarn**

### Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/aaaaabiang/Listenary-ongoing
cd Listenary-ongoing
```

#### 2. Frontend Setup
```bash
# Install dependencies
npm install

# Create environment file
cp .env

# Configure environment variables (see Configuration section)
# Edit .env with your Firebase credentials

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8080`

#### 3. Backend Setup
```bash
# Navigate to backend directory
cd listenary-backend

# Install dependencies
npm install

# Create environment file
cp .env

# Configure environment variables
# Edit .env with MongoDB URI and Firebase Admin credentials

# Start backend server
npm run dev
```

The backend will be available at `http://localhost:3000`

#### 4. Verify Installation
Open your browser and navigate to:
- Frontend: http://localhost:8080
- Backend Health Check: http://localhost:3000/healthz

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18.3.1 | UI framework |
| **TypeScript** | 5.9.3 | Type safety |
| **Vite** | 6.2.6 | Build tool & dev server |
| **MobX** | 6.13.5 | State management |
| **Material-UI** | 7.1.0 | UI component library |
| **React Router** | 6.22.1 | Client-side routing |
| **Axios** | 1.8.4 | HTTP client |
| **WaveSurfer.js** | 7.9.5 | Audio visualization |
| **Firebase SDK** | 11.6.0 | Authentication |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | >= 18.0.0 | Runtime environment |
| **Express** | 4.19.2 | Web framework |
| **TypeScript** | 5.4.5 | Type safety |
| **Mongoose** | 8.4.1 | MongoDB ODM |
| **Firebase Admin** | 13.5.0 | Server-side auth |
| **WebSocket (ws)** | 8.18.3 | Real-time communication |
| **RSS Parser** | 3.13.0 | Podcast feed parsing |
| **Helmet** | 7.2.0 | Security headers |
| **bcryptjs** | 2.4.3 | Password hashing |
| **jsonwebtoken** | 9.0.2 | JWT authentication |

### Database & Services
| Service | Purpose |
|---------|---------|
| **MongoDB** | Primary database for users, podcasts, transcripts |
| **Firebase Auth** | User authentication & authorization |
| **Firebase Firestore** | User profiles and settings |
| **DeepL API** | Text translation |
| **Dictionary API** | Word definitions |

---

## Project Structure

```
listenary/
│
├── src/                          # Frontend source code
│   ├── api/                      # API client modules
│   │   ├── userAPI.tsx              # User & wordlist API
│   │   ├── dictionaryAPI.tsx        # Dictionary lookup API
│   │   ├── transcriptionAPI.tsx     # Transcription API
│   │   └── TranslationAPI.tsx       # Translation API
│   │
│   ├── components/               # Reusable React components
│   │   ├── AudioPlayerComponent.tsx # Audio player
│   │   ├── TopNav.tsx               # Navigation bar
│   │   ├── CollapseBox.tsx          # Collapsible sections
│   │   └── DiscoveryCard.tsx        # Podcast cards
│   │
│   ├── views/                    # Page views (MVP View layer)
│   │   ├── HomePageView.tsx         # Home/landing page
│   │   ├── PodcastSearchView.tsx    # Search page
│   │   ├── PodcastChannelView.tsx   # Channel details
│   │   ├── WordlistView.tsx         # User wordlist
│   │   └── PodcastView/             # Podcast player views
│   │       ├── PodcastPlayView.tsx  # Main player view
│   │       ├── TranscriptList.tsx   # Transcript display
│   │       └── DictionaryCard.tsx   # Dictionary popup
│   │
│   ├── presenter/                # Presenters (MVP Presenter layer)
│   │   ├── HomePagePresenter.tsx    # Home page logic
│   │   ├── PodcastSearchPresenter.tsx
│   │   ├── PodcastPlayPresenter.tsx
│   │   └── WordlistPresenter.tsx
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAudioPlayback.tsx     # Audio controls
│   │   ├── useTranscriptionManager.ts
│   │   ├── useTranslationHandler.ts
│   │   └── useWordLookup.ts
│   │
│   ├── styles/                   # CSS stylesheets
│   ├── Model.ts                     # MobX global state (MVP Model)
│   ├── ReactRoot.tsx                # App router configuration
│   └── index.tsx                    # App entry point
│
├── listenary-backend/            # Backend source code
│   ├── src/
│   │   ├── modules/              # Feature modules
│   │   │   ├── user&wordlist/    # User management
│   │   │   │   ├── controllers/     # Route controllers
│   │   │   │   ├── models/          # Mongoose models
│   │   │   │   ├── services/        # Business logic
│   │   │   │   └── route/           # Route definitions
│   │   │   │
│   │   │   ├── rss/              # RSS feed module
│   │   │   │   ├── controller.ts    # RSS routes
│   │   │   │   ├── service.ts       # RSS parsing logic
│   │   │   │   └── model.ts         # RSS data models
│   │   │   │
│   │   │   ├── podcast-discovery/ # Podcast search
│   │   │   ├── transcription/     # Speech-to-text
│   │   │   │   ├── controller/
│   │   │   │   │   ├── transcriptController.ts
│   │   │   │   │   └── transcriptionWebSocket.ts
│   │   │   │   └── service/
│   │   │   │
│   │   │   ├── translation/       # Translation service
│   │   │   └── dictionary/        # Dictionary lookup
│   │   │
│   │   ├── middleware/           # Express middleware
│   │   │   ├── authMiddleware.ts    # JWT verification
│   │   │   ├── validationMiddleware.ts
│   │   │   └── errorMiddleware.ts
│   │   │
│   │   ├── config/               # Configuration files
│   │   └── server.ts                # Express app entry point
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile                   # Docker configuration
│
├── public/                       # Static assets
├── functions/                    # Firebase Cloud Functions
├── package.json                     # Frontend dependencies
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
├── firebase.json                    # Firebase hosting config
└── README.md                        # This file
```

---

## Configuration

### Frontend Environment Variables

Create a `.env` file in the root directory.
Note: The actual `.env` file has been submitted separately via the course system for evaluation purposes.

---

## Testing Sample RSS Feeds

Use these podcast RSS feeds for testing:

- **Short Episodes (< 5 min)**: https://feeds.captivate.fm/one-minute-podcast-tips/
- **Tech News**: https://feeds.buzzsprout.com/2295449.rss
- **Health & Wellness**: http://img.webmd.com/video_itunes/feed.xml
- **General**: https://feed.podcastmachine.com/podcasts/1288/mp3.rss

Find more RSS feeds at: [Castos RSS Finder](https://castos.com/tools/find-podcast-rss-feed/)

---

## Deployment

We use fly.io(https://fly.io/) to deploy Listenary.

---

## Usage Guide

### Getting Started - 3 Simple Steps

#### Step 1: Find a Podcast
1. Open [Castos RSS Finder](https://castos.com/tools/find-podcast-rss-feed/)
2. Search for your favorite podcast
3. Copy the RSS feed URL

#### Step 2: Load the Podcast
1. Paste the RSS URL into Listenary's input box
2. Click **Parse** or **Load Feed**
3. Browse the podcast channel and episodes

#### Step 3: Learn & Build Vocabulary
1. Select an episode to play
2. Click **Transcribe** for automatic transcription
3. Use **Translate** for your native language
4. Click any word for dictionary lookup
5. Save words to your personal wordlist

### Tips for Best Experience

- **Episode Length**: For faster transcription, choose episodes under 30 minutes
- **Audio Quality**: Better audio quality = more accurate transcription
- **Save Progress**: Login to save your wordlist and bookmarks across devices
- **Playback Speed**: Use player controls to adjust speed for your learning pace

---

## Future Work
1. Optimize the user experience and upgrade the UI/UX.
2. Improved transcription speed.
3. Database organization and data summarization.

## Authors

Ruopeng Zhang (zrp99930@gmail.com);
Yue Zheng (zoelaniakea@gmail.com);
Liyuan Sun (aaaaabiang@gmail.com);
Shangwen Wang (wang.shangwen@outlook.com);
Developed as part of KTH Interactive Programming course project.

---

## Acknowledgments

- [WaveSurfer.js](https://wavesurfer.xyz/) - Audio visualization
- [Material-UI](https://mui.com/) - React component library
- [Firebase](https://firebase.google.com/) - Authentication & hosting
- [MongoDB](https://www.mongodb.com/) - Database
- [DeepL](https://www.deepl.com/) - Translation API
- [Dictionary API](https://dictionaryapi.dev/) - Word definitions

---