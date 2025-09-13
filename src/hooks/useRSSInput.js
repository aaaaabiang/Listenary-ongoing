import { useNavigate } from "react-router-dom";

export function useRSSInput() {
  const navigate = useNavigate();

  const handleRSSSubmit = (rssUrl) => {
    // Later we'll add RSS parsing logic here
    // For now, just navigate to podcast channel page
    navigate('/podcast-channel');
  };

  return handleRSSSubmit;
} 