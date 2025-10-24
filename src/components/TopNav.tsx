import '../styles/TopNav.css';
import { observer } from "mobx-react-lite";
import { useAuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

// 定义 props 类型
type Props = {
  hideLogo?: boolean; // 控制是否隐藏 logo
};


// TopNav component - View layer in MVP architecture
export const TopNav = observer(function TopNav({ hideLogo }: Props) {
  const { user, logout } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLoginMenuClick(e) {
    if (user) {
      // 已登录用户：确认后登出
      const shouldLogout = confirm(`Are you sure you want to logout?\nCurrent user: ${user.displayName || user.email}`);
      if (shouldLogout) {
        try {
          await logout();
          navigate("/login");
        } catch (error) {
          console.error("Logout failed:", error);
        }
      }
    } else {
      // 未登录用户：导航到登录页面
      navigate("/login");
    }
  }

  return (
    <nav className="top-nav">
      <div className="nav-container">
        {!hideLogo ? (
          <Link to="/" className="brand-link">Listenary</Link>
        ) : (
          <span className="slogan-text">Learn English with Podcasts</span>
        )}

        <div className="nav-links">
          <Link to="/search" className="nav-link">Discover</Link>
          <Link to="/wordlist" className="nav-link">Wordlist</Link>
          {user ? (
            <span className="nav-link" onClick={handleLoginMenuClick} style={{ cursor: 'pointer' }}>
              {user.displayName || user.email}
            </span>
          ) : (
            <span className="nav-link" onClick={handleLoginMenuClick} style={{ cursor: 'pointer' }}>
              {isLoading ? 'Logging in...' : 'Login'}
            </span>
          )}
        </div>
      </div>
    </nav>
  );
});
