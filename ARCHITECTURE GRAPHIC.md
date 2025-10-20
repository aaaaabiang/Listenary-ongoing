#  Listenary Architecture Documentation

## System Architecture Overview

Listenary follows a modern full-stack architecture with clear separation between frontend, backend, and data layers. The system adopts the MVP (Model-View-Presenter) pattern on the frontend and a modular microservices-like structure on the backend.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + MobX)                    │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │     View     │  │  Presenter   │  │    Model     │           │
│  │  Components  │◄─┤   Business   │◄─┤    (MobX)    │           │
│  │   (React)    │  │    Logic     │  │  Observable  │           │
│  └──────────────┘  └──────────────┘  └──────┬───────┘           │
│                                             │                   │
│                    ┌────────────────────────┴─────────┐         │
│                    │                                  │         │
│             ┌──────▼─────┐  ┌──────────────┐  ┌───────▼──────┐  │
│             │  userAPI   │  │transcriptAPI │  │ dictionaryAPI│  │
│             └──────┬─────┘  └──────┬───────┘  └───────┬──────┘  │
└────────────────────┼────────────────┼──────────────────┼────────┘
                     │                │                  │
                     │    HTTP/REST   │     WebSocket    │
              ┌──────┴────────────────┴──────────────────┴─────┐
              │                                                │
              │           Backend (Express + Node.js)          │
              │                                                │
              │  ┌─────────────────────────────────────────┐   │
              │  │         Middleware Layer                │   │
              │  │  (CORS, Helmet, Auth, Rate Limiting)    │   │
              │  └─────────────────┬───────────────────────┘   │
              │                    │                           │
              │  ┌─────────────────▼───────────────────────┐   │
              │  │          API Modules                    │   │
              │  │  ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐  │   │
              │  │  │ Auth │ │ RSS  │ │Podcast │ │Trans-│  │   │
              │  │  │      │ │      │ │        │ │cript │  │   │
              │  │  └──┬───┘ └──┬───┘ └───┬────┘ └──┬───┘  │   │
              │  │     │        │         │         │      │   │
              │  │  ┌──▼────────▼─────────▼─────────▼───┐  │   │
              │  │  │        Service Layer              │  │   │
              │  │  │     (Business Logic)              │  │   │
              │  │  └──────────────┬────────────────────┘  │   │
              │  │                 │                       │   │
              │  │  ┌──────────────▼────────────────────┐  │   │
              │  │  │      Data Access Layer            │  │   │
              │  │  │   (Mongoose Models & Schemas)     │  │   │
              │  │  └──────────────┬────────────────────┘  │   │
              │  └─────────────────┼───────────────────────┘   │
              └────────────────────┼──────────────────────────—┘
                                   │
                    ┌──────────────┴───────────────┐
                    │                              │
            ┌───────▼────────┐           ┌─────────▼────────┐
            │    MongoDB     │           │  Firebase Auth   │
            │  (Primary DB)  │           │  (Authentication)│
            │                │           │                  │
            │ - Users        │           │ - User Identity  │
            │ - Podcasts     │           │ - JWT Tokens     │
            │ - Transcripts  │           │                  │
            │ - Wordlists    │           └──────────────────┘
            └────────────────┘
```

---
