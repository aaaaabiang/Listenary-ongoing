// theme.js
import { createTheme } from "@mui/material/styles";

// Material Design 3 示例主色调：蓝色
const theme = createTheme({
  palette: {
    mode: "light", // 可切换为 "dark" 实现暗色模式
    primary: {
      main: "#0066ff",       // 主按钮、链接、操作颜色
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#e0e0e0",       // 用于中性背景、分隔线等
    },
    background: {
      default: "#f9f9f9",    // 页面背景
      paper: "#ffffff",      // 卡片背景（Surface）
    },
    text: {
      primary: "#111827",    // 主文本
      secondary: "#4b5563",  // 副文本
    },
  },
  shape: {
    borderRadius: 12,        // 更圆的外观，符合 M3
  },
  typography: {
    fontFamily: "Roboto, sans-serif",
    button: {
      textTransform: "none", // 按钮不全大写，M3 推荐
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true, // M3 风格通常不使用阴影
      },
      styleOverrides: {
        root: {
          borderRadius: "999px", // Pill-style 按钮，视觉上圆润
          padding: "8px 20px",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: { fontSize: "2.5rem", fontWeight: 700 },
        h2: { fontSize: "2rem", fontWeight: 700 },
        h3: { fontSize: "1.75rem", fontWeight: 600 },
        body1: { fontSize: "1rem" },
        body2: { fontSize: "0.95rem" },
      },
    },
  },
});


export default theme;


