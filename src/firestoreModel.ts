// // initialize Firebase app
// import { initializeApp } from "firebase/app";
// import { firebaseConfig } from "../listenary-backend/config/firebaseConfig.js";
// import {
//   getFirestore,
//   doc,
//   setDoc,
//   getDoc,
//   arrayUnion,
//   updateDoc,
// } from "firebase/firestore";
// import loginModel from "./loginModel";
// import { model } from "./Model";

// export const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app);

import { doc, setDoc, getDoc, arrayUnion, updateDoc } from "firebase/firestore";
import { db } from "./firebaseApp";
export { db }; // 兼容：外部仍可从 firestoreModel 导入 db

// make doc and setDoc available at the Console for testing
    doc: typeof doc;
    setDoc: typeof setDoc;
    db: typeof db;

export function saveUserData(uid, data) {
  const userDoc = doc(db, "users", uid);
  return setDoc(userDoc, data, { merge: true });
}

export function loadUserData(uid) {
  const userDoc = doc(db, "users", uid);
  return getDoc(userDoc).then(function (docSnap) {
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  });
}

export async function getUserWordlist(uid) {
  try {
    const userDoc = doc(db, "users", uid);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists() && docSnap.data().wordlist) {
      return docSnap.data().wordlist;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error getting user wordlist:", error);
    return [];
  }
}

export async function saveWordToUserWordlist(uid, wordData) {
  try {
    const userDoc = doc(db, "users", uid);

    // First check if user document exists
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      // User exists, update wordlist
      await updateDoc(userDoc, {
        wordlist: arrayUnion(wordData),
      });
    } else {
      // Create new user document with wordlist
      await setDoc(userDoc, {
        username: "User", // 避免跨模块读取 loginModel：这里仅作占位
        wordlist: [wordData],
      });
    }
    return true;
  } catch (error) {
    console.error("Error saving word to wordlist:", error);
    return false;
  }
}

export function connectToPersistence(model) {
  // You can call saveUserData/loadUserData here if you want auto sync
}
// save transcription data to firestore
export async function saveTranscriptionData(uid, guid, title, phrases) {
  const docRef = doc(db, "users", uid, "transcriptions", guid);
  try {
    await setDoc(docRef, {
      title: title,
      phrases: phrases,
      updatedAt: new Date(),
    });
    console.log(`Transcription saved for episode ${title}`);
  } catch (err) {
    console.error(err);
  }
}

export async function getTranscriptionData(uid, guid) {
  const docRef = doc(db, "users", uid, "transcriptions", guid);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data().phrases || [];
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Save podcast channel info to localStorage
export function savePodcastChannelInfo(channelInfo) {
  localStorage.setItem("podcastChannelInfo", JSON.stringify(channelInfo));
}

// Load podcast channel info from localStorage
export function loadPodcastChannelInfo() {
  const savedInfo = localStorage.getItem("podcastChannelInfo");
  return savedInfo ? JSON.parse(savedInfo) : null;
}

// Save podcast episodes to localStorage
export function savePodcastEpisodes(episodes) {
  localStorage.setItem("podcastEpisodes", JSON.stringify(episodes));
}

// Load podcast episodes from localStorage
export function loadPodcastEpisodes() {
  const savedEpisodes = localStorage.getItem("podcastEpisodes");
  return savedEpisodes ? JSON.parse(savedEpisodes) : [];
}

// Save RSS URL to localStorage
export function saveRssUrl(url) {
  localStorage.setItem("rssUrl", url);
}

// Load RSS URL from localStorage
export function loadRssUrl() {
  return localStorage.getItem("rssUrl") || "";
}

// Save audio URL to localStorage
export function saveAudioUrl(url) {
  localStorage.setItem("audioUrl", url);
}

// Load audio URL from localStorage
export function loadAudioUrl() {
  return localStorage.getItem("audioUrl") || "";
}
