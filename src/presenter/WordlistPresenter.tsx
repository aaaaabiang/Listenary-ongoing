import { observer } from "mobx-react-lite";
import { WordlistView } from "../views/WordlistView";
import { useState, useEffect } from "react";
import { getUserWordlist } from "../firestoreModel";
import loginModel from "../loginModel";

/**
 * Wordlist Presenter Component - Part of the Presenter layer in MVP
 * Manages the retrieval and display of user's saved words
 */

// 新增：给 props 一个最小类型 
type Props = { model: any };   

const WordlistPresenter = observer(function WordlistPresenter(
  props: Props 
) {
  // State for handling wordlist display and selection
  const [userWords, setUserWords] = useState<any[]>([]); // [fix] 最小类型，防止 TS 推成 never[]
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(-1); // [fix]
  const [isLoading, setIsLoading] = useState<boolean>(true); // [fix]
  const [error, setError] = useState<string | null>(null); // [fix]
  
  // Fetch user words when component mounts or login state changes
  useEffect(() => {
    async function fetchUserWords() {
      setIsLoading(true);
      setError(null);
      
      const user = loginModel.getUser();
      if (user) {
        try {
          const words = await getUserWordlist(user.uid);
          setUserWords(words);
          // Select first word if available
          if (words.length > 0) {
            setSelectedWordIndex(0);
          }
        } catch (err) {
          console.error("Error fetching wordlist:", err);
          setError("Failed to load wordlist. Please try again later.");
        }
      } else {
        setUserWords([]);
        setSelectedWordIndex(-1);
      }
      
      setIsLoading(false);
    }
    
    fetchUserWords();
  }, [loginModel.getUser()]); // Re-fetch when user login state changes
  
  /**
   * Handle selection of a word from the wordlist
   * @param {number} index - The index of the selected word
   */
  const handleWordSelect = (index) => {
    setSelectedWordIndex(index);
  };
  
  // Get the currently selected word for display in the details panel
  const selectedWord = selectedWordIndex >= 0 && selectedWordIndex < userWords.length 
    ? userWords[selectedWordIndex] 
    : null;

  return (
    <WordlistView 
      words={userWords}
      selectedWordIndex={selectedWordIndex}
      selectedWord={selectedWord}
      onWordSelect={handleWordSelect}
      isLoading={isLoading}
      error={error}
      isLoggedIn={!!loginModel.getUser()}
    />
  );
}); 
export default WordlistPresenter;