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
      await signInWithPopup(auth, provider);
      // 登录成功后会通过 useAuth hook 自动处理用户资料加载和导航
    } catch (error) {
      console.error("Login failed:", error);
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
