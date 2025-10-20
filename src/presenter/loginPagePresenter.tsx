import { useState, useEffect } from "react";
import loginModel from "../loginModel";
import LoginView from "../views/loginPageView";
// MongoDB API 调用
import { getUserProfile } from "../api/userAPI";
import { model } from "../Model";
import { useNavigate } from "react-router-dom";

type Props = { model: any }; // [fix]

function LoginPresenter(props: Props) {
  // Local state to manage view updates
  const [modelState, setModelState] = useState({
    isLoading: loginModel.getIsLoading(),
    user: loginModel.getUser(),
  });

  const navigate = useNavigate();

  // Set up auth state listener without automatically triggering login popup
  useEffect(function effectCallback() {
    // Only responsible for synchronizing user status
    function onAuthChange() {
      updateViewState();
    }
    const unsubscribe = loginModel.setupAuthStateListener(onAuthChange);
    return function cleanup() {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Helper function to update view state from model
  function updateViewState() {
    setModelState({
      isLoading: loginModel.getIsLoading(),
      user: loginModel.getUser(),
    });
  }

  function handleGoogleLogin(e) {
    e.preventDefault();
    setModelState(function (prev) {
      return { ...prev, isLoading: true };
    });

    loginModel
      .googleLogin()
      .then(function (result) {
        const user = "user" in result ? result.user : loginModel.getUser(); // [fix]
        // Load user data from MongoDB
        return getUserProfile()
          .then(function (userData) {
            if (userData && userData.savedPodcasts) {
              model.savedPodcasts = userData.savedPodcasts;
            }
            // Navigate after successful login
            navigate("/");
          })
          .catch(function (error) {
            // 如果用户不存在于 MongoDB，这是首次登录，忽略错误
            // console.log('First time login, user will be created on first data save');
            navigate("/");
          });
      })
      .catch(function (error) {
        console.error("Login failed:", error);
        // 错误处理通过Model层管理，Presenter不直接调用alert
      })
      .finally(function () {
        setModelState(function (prev) {
          return { ...prev, isLoading: false };
        });
      });
  }

  function handleLogout() {
    loginModel
      .logout()
      .then(function () {
        // console.log("Logout successful");
        updateViewState();
        // Stay on the current page after logout
      })
      .catch(function (error) {
        console.error("Logout failed:", error.message);
        // 错误处理通过Model层管理，Presenter不直接调用alert
      });
  }

  // Pass data and event handlers to the view
  return (
    <LoginView
      isLoading={modelState.isLoading}
      user={modelState.user}
      onGoogleLogin={handleGoogleLogin}
      onLogout={handleLogout}
    />
  );
}
export default LoginPresenter;
