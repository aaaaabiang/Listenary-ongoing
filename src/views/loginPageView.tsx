import '../styles/LoginPage.css';
import { TopNav } from '../components/TopNav';

function LoginView({
    isLoading,
    user,
    onGoogleLogin,
    onLogout
}) {
    return (
        <div className="page-container">
            <TopNav />
            <div className="login-wrapper">
                <div className="login-content">
                <div className="logo-container">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/dh2642-29c50.firebasestorage.app/o/LOGO.svg?alt=media&token=a57cbd8b-9976-4ad4-8416-e42c08bf628f"
            alt="Listenary"
            className="logo"
          />
        </div>

                    {!user ? (
                        // Login form for unauthenticated users
                        <>
                            <button 
                                id="authButton"
                                   onClick={onGoogleLogin} 
                                disabled={isLoading}
                                className="google-sign-in-button"
                            >
                                <div className="google-sign-in-content">
                                    <img 
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                                        alt="Google" 
                                        className="google-icon"
                                    />
                                    <span>{isLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                                </div>
                            </button>

                            <p className="terms-text">
                                By continuing, you agree to our{' '}
                                <a href="#" className="terms-link">Terms</a> and{' '}
                                <a href="#" className="terms-link">Privacy</a>
                            </p>
                        </>
                    ) : (
                        // Welcome screen for authenticated users
                        <div className="welcome-container">
                            <p className="welcome-text">Welcome, {user.displayName || user.email}</p>
                            <button 
                                onClick={onLogout}
                                className="google-sign-in-button"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LoginView;

