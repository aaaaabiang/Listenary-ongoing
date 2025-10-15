import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { app } from "./firebaseApp"; 
import { makeAutoObservable, runInAction } from "mobx";
import type { UserCredential } from "firebase/auth"; // [fix] 引入类型

// Pure data model for login
class LoginModel {
  // 这些是新增的字段声明，让 TS 知道它们存在  // [fix]
  private auth: import("firebase/auth").Auth;              // [fix]
  private googleProvider: import("firebase/auth").GoogleAuthProvider; // [fix]
  private isLoading: boolean = false;                      // [fix]
  private user: import("firebase/auth").User | null = null; // [fix]
  private viewUpdateCallbacks: Array<() => void> = [];     // [fix]

  constructor() {
    // Initialize Firebase Auth
    this.auth = getAuth(app);
    this.googleProvider = new GoogleAuthProvider();
    this.isLoading = false;
    this.user = null;
    this.viewUpdateCallbacks = [];
    makeAutoObservable(this);

    // Set up initial auth state
    const self = this;
    onAuthStateChanged(this.auth, function(user) {
      runInAction(function() {
        self.user = user;
      });
    });
  }

  getIsLoading() {
    return this.isLoading;
  }
  getUser() {
    return this.user;
  }

  // Firebase auth state monitoring
  setupAuthStateListener(callback) {
    if (callback) {
      this.viewUpdateCallbacks.push(callback);
    }
    const self = this;
    return onAuthStateChanged(this.auth, function(user) {
      runInAction(function() {
        self.user = user;
      });
      if (callback) callback(user);
    });
  }

  notifyViewUpdate() {
    const self = this;
    this.viewUpdateCallbacks.forEach(function(callback) {
      callback();
    });
  }

  // Authentication methods
  googleLogin(): Promise<UserCredential | { success: boolean; error?: string }> {
  const self = this;
  return new Promise(function (resolve, reject) {
      runInAction(function() {
        self.isLoading = true;
      });

      if (self.auth.currentUser) {
        signOut(self.auth)
          .then(function() {
            runInAction(function() {
              self.user = null;
              self.isLoading = false;
            });
            resolve({ success: true });
          })
          .catch(function(error) {
            runInAction(function() {
              self.isLoading = false;
            });
            reject({ success: false, error: error.message });
          });
      } else {
        signInWithPopup(self.auth, self.googleProvider)
          .then(function(result) {
            runInAction(function() {
              self.user = result.user;
              self.isLoading = false;
            });
            resolve(result);
          })
          .catch(function(error) {
            runInAction(function() {
              self.isLoading = false;
            });
            reject({ success: false, error: error.message });
          });
      }
    });
  }

  logout() {
    const self = this;
    return signOut(self.auth)
      .then(function() {
        runInAction(function() {
          self.user = null;
        });
        return { success: true };
      })
      .catch(function(error) {
        return { success: false, error: error.message };
      });
  }

  setUser(user) {
    const self = this;
    runInAction(function() {
      self.user = user;
    });
  }
}
// Create and export a singleton instance
const loginModel = new LoginModel();
export default loginModel;