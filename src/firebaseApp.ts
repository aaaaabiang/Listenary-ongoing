// src/firebaseApp.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// 你项目里目前用的是 listenary-backend 里的配置
import { firebaseConfig } from "./firebaseConfig";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
