import { observable, runInAction } from "mobx";
import React from "react";
import { createRoot } from "react-dom/client";
import { ReactRoot } from "./ReactRoot";
import { model } from "./Model";
import { AsrTest } from "./test/asrTest";
import "./styles/LoginPage.css";
import { connectToPersistence } from "./firestoreModel";
import loginModel from "./loginModel";
import { loadUserData } from "./firestoreModel";


// MUI 
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme.js"; 

// 建立可观察的全局 model
const myModel = observable(model);

// 传入 model
connectToPersistence(myModel);

// Global auth state listener: sync login state and savedPodcasts
loginModel.setupAuthStateListener(function(user) {
  if (user) {
    loadUserData()   /* 不需要传 uid，让后端从 token 识别 */
      .then((userData) => {
        if (userData?.savedPodcasts) {
          runInAction(() => {
            myModel.savedPodcasts.replace(userData.savedPodcasts);
          });
        }
      });
  } else {
    runInAction(() => {
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

// import { doc, setDoc } from "firebase/firestore";
// const firestoreDoc = doc(db, "test collection", "test document");
// setDoc(firestoreDoc, { dummyField: "dummyValue" }, { merge: true }).catch(
//   console.error
// );
