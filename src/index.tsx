import { observable, runInAction } from "mobx";
import React from "react";
import { createRoot } from "react-dom/client";
import { ReactRoot } from "./ReactRoot";
import { model } from "./Model";
import "./styles/LoginPage.css";
// MongoDB API 调用
import { getSavedPodcasts } from "./api/userAPI";
// MUI
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./styles/theme";

// model 已经在 Model.ts 中用 observable 包装了
const myModel = model;

// 认证状态监听已移至AuthContext中处理

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
