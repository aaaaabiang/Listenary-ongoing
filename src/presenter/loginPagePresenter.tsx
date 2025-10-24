import { useState, useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import LoginView from "../views/loginPageView";
import { useNavigate } from "react-router-dom";
import { GoogleAuthProvider, signInWithPopup, getAuth } from "firebase/auth";
import { app } from "../firebaseApp";

type Props = { model: any }; // [fix]

function LoginPresenter(props: Props) {
  const { user, isLoading, logout } = useAuthContext();
  const navigate = useNavigate();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // 自动重定向已登录用户
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  async function handleGoogleLogin(e: React.MouseEvent) {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // 添加弹窗配置以减少跨域问题
      const result = await signInWithPopup(auth, provider);
      
      // 登录成功后会通过 useAuth hook 自动处理用户资料加载和导航
      console.log("Login successful:", result.user);
    } catch (error: any) {
      console.error("Login failed:", error);
      
      // 处理特定的跨域错误
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("Login popup was closed by user");
      } else if (error.code === 'auth/popup-blocked') {
        console.log("Login popup was blocked by browser");
      } else if (error.message?.includes('Cross-Origin-Opener-Policy')) {
        console.log("Cross-Origin-Opener-Policy error - this is usually safe to ignore");
      }
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }

  // Pass data and event handlers to the view
  return (
    <LoginView
      isLoading={isLoading || isLoggingIn}
      user={user}
      onGoogleLogin={handleGoogleLogin}
      onLogout={handleLogout}
    />
  );
}
export default LoginPresenter;
