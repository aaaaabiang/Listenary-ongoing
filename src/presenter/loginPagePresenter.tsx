import { useState, useEffect } from "react"
import loginModel from "../loginModel.js"
import LoginView from "../views/loginPageView.jsx"
import { loadUserData } from "../firestoreModel"
import { model } from "../Model"
import { useNavigate } from "react-router-dom";
import { runInAction } from "mobx";

type Props = { model: any }; // [fix]

function LoginPresenter(props:Props) {
  // Local state to manage view updates
  const [modelState, setModelState] = useState({
    isLoading: loginModel.getIsLoading(),
    user: loginModel.getUser()
  })

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
      user: loginModel.getUser()
    });
  }

  function handleGoogleLogin(e) {
    e.preventDefault();
    setModelState(function(prev) { return {...prev, isLoading: true}; });

    loginModel.googleLogin()
      .then(function(result) {
        const user = "user" in result ? result.user : loginModel.getUser(); // [fix]
        // Load user data from Firestore
        return loadUserData().then(function(userData) {
          if (userData && userData.savedPodcasts) {
            runInAction(function () {
              model.savedPodcasts.replace(userData.savedPodcasts);
            });
          }
          navigate("/");
        });
      })
      .catch(function(error) {
        alert("Login failed: " + error.message);
      })
      .finally(function() {
        setModelState(function(prev) {
          return {...prev, isLoading: false};
        });
      });
  }

  function handleLogout() {
    loginModel.logout()
      .then(function() {
        console.log("Logout successful");
        updateViewState();
        // Stay on the current page after logout
      })
      .catch(function(error) {
        console.error("Logout failed:", error.message);
        alert("Logout failed: " + error.message);
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
  )
}
export default LoginPresenter