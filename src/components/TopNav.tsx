import '../styles/TopNav.css';
import { observer } from "mobx-react-lite";
import loginModel from "../loginModel";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

// 定义 props 类型
type Props = {
  hideLogo?: boolean; // 控制是否隐藏 logo
};


// TopNav component - View layer in MVP architecture
export const TopNav = observer(function TopNav({ hideLogo }: Props) {
  const user = loginModel.getUser();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  function handleLoginMenuClick(e) {
    e.preventDefault();
    navigate("/login");
  }

  return (
    <nav className="top-nav">
      <div className="nav-container">
        {!hideLogo ? (
          <a href="/#/" className="brand-link">Listenary</a>
        ) : (
          <span className="slogan-text">Learn English with Podcasts</span>
        )}

        <div className="nav-links">
          <a href="/#/wordlist" className="nav-link">Wordlist</a>
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
