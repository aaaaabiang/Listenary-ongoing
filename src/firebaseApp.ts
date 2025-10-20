// src/firebaseApp.ts
import { initializeApp } from "firebase/app";
// Firestore不再使用，只保留Firebase Auth
// 项目里目前用的是 listenary-backend 里的配置
import { firebaseConfig } from "./firebaseConfig";

export const app = initializeApp(firebaseConfig);
// export const db = getFirestore(app); // Firestore不再使用
