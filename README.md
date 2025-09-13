# Listenary – Podcast-Based Language Learning Platform

Listenary is an English language learning platform for English learners, where you can listen to podcasts, transcribe them, translate them, and build your wordlist.

You only need 3 simple steps to start your learning journey:

**Step 1**: Open the third-party tool Castos RSS Finder, search the podcast title you want to learn, and copy paste the rss link of the podcast into the Parse box above.

**Step 2**: Click on Parse, then on the podcast channel page click on the episode you want to learn.

**Step 3**: On the episode page, click on Transcibe to see the transcription result in English. You can also click Translate to get translation in your own language.

## Features

1. Load and parse podcast episodes from any public RSS feed

2. Display podcast metadata (title, publish date, description, episodes)

3. Integrated audio streaming and waveform visualization

4. Time-aligned transcription results of the podcast alongside the audio for easy navigation

5. One-click full podcast translation and vocabulary look-up
   
6. Personal vocabulary list management

## Tech Stack

1. **Frontend Framework**: React
2. **State Management**: MobX
3. **Speech to Text**: Microsoft Azure Speech-to-Text API
4. **Translation**: DeepL API
5. **Dictionary**: Dictionary API (https://dictionaryapi.dev/)
6. **Authentication**: Google OAuth 2.0 API
7. **RSS Parsing**: rss-parser (Node.js library)
8. **Languages**: JavaScript / CSS / HTML
9. **Build Tool**: Vite

## Running deployed application

https://dh2642-29c50.web.app

## Setup and Running Instructions locally

### Install Dependences

```bash
npm install
```

### Start the development server:

```bash
npm run dev
```

## Used Third-party components

1. [Audio Waveform Player](https://wavesurfer.xyz/): We use this open-source audio visualization library to build an audio player that visually represents the playing progress. With this third-party component, users can efficiently locate the sentence they are listening to, click on the waveform, and seamlessly synchronize the audio with the transcription.

2. [Material UI](https://m3.material.io/develop/web): We use this popular React component library to build modern and responsive user interfaces. With this third-party component, users can enjoy a consistent and intuitive design while interacting with various features, enhancing the overall user experience.

## Sample RSS Feeds

Feel free to use the following sample links to test podcast loading and transcription:

- https://feeds.captivate.fm/one-minute-podcast-tips/
- https://feed.podcastmachine.com/podcasts/1288/mp3.rss
- http://img.webmd.com/video_itunes/feed.xml
- https://feeds.buzzsprout.com/2295449.rss

You can also get rss links by searching podcast name from this website: https://castos.com/tools/find-podcast-rss-feed/

### Due to limitation of API usage, we recommend you to choose podcast episodes that are no longer than 30 minutes.
