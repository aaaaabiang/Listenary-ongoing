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
      
      // 使用弹窗登录，但添加更好的错误处理
      const result = await signInWithPopup(auth, provider);
      console.log("Login successful:", result.user);
      
    } catch (error: any) {
      // 静默处理COOP相关错误，不显示在控制台
      if (error.message?.includes('Cross-Origin-Opener-Policy')) {
        // COOP错误通常可以忽略，不影响登录功能
        return;
      }
      
      console.error("Login failed:", error);
      
      // 处理特定的错误，但不阻止用户重试
      if (error.code === 'auth/popup-closed-by-user') {
        console.log("Login popup was closed by user");
        // 用户关闭了弹窗，这是正常的，不需要显示错误
      } else if (error.code === 'auth/popup-blocked') {
        console.log("Login popup was blocked by browser");
        // 弹窗被阻止，可以提示用户允许弹窗
      } else {
        // 其他错误可能需要用户重试
        console.error("Unexpected login error:", error);
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
