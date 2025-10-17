import { observable, runInAction } from "mobx";
import React from "react";
import { createRoot } from "react-dom/client";
import { ReactRoot } from "./ReactRoot";
import { model } from "./Model";
import { AsrTest } from "./test/asrTest";
import "./styles/LoginPage.css";
import { db, connectToPersistence } from "./firestoreModel";
import loginModel from "./loginModel";
import { loadUserData } from "./firestoreModel";


// MUI 
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme.js"; 

// model 已经在 Model.ts 中用 observable 包装了
const myModel = model;

// 传入 model
connectToPersistence(myModel);

// Global auth state listener: sync login state and savedPodcasts
loginModel.setupAuthStateListener(function(user) {
  if (user) {
    // User just logged in or refreshed
    loadUserData(user.uid)
      .then(function(userData) {
        if (userData && userData.savedPodcasts) {
          runInAction(function() {
            myModel.savedPodcasts.replace(userData.savedPodcasts);
          });
        }
      });
  } else {
    // User logged out
    runInAction(function() {
      myModel.savedPodcasts.replace([]);
    });
  }
});

// 渲染：包裹 ThemeProvider 和 CssBaseline
createRoot(document.getElementById("root")).render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ReactRoot model={myModel} />
  </ThemeProvider>
);

//暴露到 window
declare global {
  interface Window {
    myModel: typeof myModel;
  }
}
window.myModel = myModel;

import { doc, setDoc } from "firebase/firestore";
const firestoreDoc = doc(db, "test collection", "test document");
setDoc(firestoreDoc, { dummyField: "dummyValue" }, { merge: true }).catch(
  console.error
);
