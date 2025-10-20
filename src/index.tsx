import { observable, runInAction } from "mobx";
import React from "react";
import { createRoot } from "react-dom/client";
import { ReactRoot } from "./ReactRoot";
import { model } from "./Model";
import "./styles/LoginPage.css";
// MongoDB API 调用
import { getSavedPodcasts } from "./api/userAPI";
import loginModel from "./loginModel";


// MUI 
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme"; 

// model 已经在 Model.ts 中用 observable 包装了
const myModel = model;

// Global auth state listener: sync login state and savedPodcasts from MongoDB
loginModel.setupAuthStateListener(function(user) {
  if (user) {
    // User just logged in or refreshed - load savedPodcasts from MongoDB
    getSavedPodcasts()
    
      .then(function(savedPodcasts) {
        runInAction(function() {
          myModel.savedPodcasts.splice(0, myModel.savedPodcasts.length, ...(savedPodcasts || []));
        });
        console.log('Saved podcasts loaded from MongoDB:', savedPodcasts.length);
      })
      .catch(function(error) {
        // First time login - user doesn't exist in MongoDB yet
        console.log('First time login or user not found in MongoDB:', error.message);
      });
  } else {
    // User logged out
    runInAction(function() {
      myModel.savedPodcasts.splice(0, myModel.savedPodcasts.length);
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
