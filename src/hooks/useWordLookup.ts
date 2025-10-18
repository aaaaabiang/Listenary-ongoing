import { useState } from "react";
// MongoDB API 调用
import { saveWordToUserWordlist } from "../api/userAPI";
import loginModel from "../loginModel";

export function useWordLookup(model) {
  const [wordCard, setWordCard] = useState({
    word: "",
    phonetics: { uk: null, us: null },
    definition: null,
    examples: null,
    relatedTerms: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  function handleWordSelect(word) {
    console.log("Looking up word:", word);
    
    setIsLoading(true);
    
    // 立即显示当前单词
    setWordCard({
      word: word,
      phonetics: { uk: null, us: null },
      definition: null,
      examples: null,
      relatedTerms: null,
    });

    model
      .lookupWord(word)
      .then((result) => {
        console.log("Dictionary API result:", result);
        if (result && result[0]) {
          setWordCard(result[0]);
        } else {
          console.log("No dictionary data found for word:", word);
          setWordCard({
            word: word,
            phonetics: { uk: null, us: null },
            definition: null,
            examples: null,
            relatedTerms: null,
          });
        }
      })
      .catch((error) => {
        console.error("Error looking up word:", error);
        setWordCard({
          word: word,
          phonetics: { uk: null, us: null },
          definition: null,
          examples: null,
          relatedTerms: null,
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  async function handleAddToWordlist(wordData) {
    try {
      await saveWordToUserWordlist(wordData);
      return {
        success: true,
        message: "Added to the default wordlist",
        type: "success",
      };
    } catch (error) {
      console.error("Error saving word to wordlist:", error);
      
      // 根据后端返回的错误信息处理
      if (error.message && error.message.includes("Authentication")) {
        return { success: false, message: "Please Login First", type: "warning" };
      }
      
      return { success: false, message: error.message || "Failed to save word", type: "error" };
    }
  }

  return { wordCard, handleWordSelect, handleAddToWordlist, isLoading };
}

//   const [wordCard, setWordCard] = useState({
//     word: "",
//     phonetics: { uk: null, us: null },
//     definition: null,
//     examples: null,
//     relatedTerms: null,
//   });

//   /**
//    * Handle word selection and lookup
//    * @param {string} word - The selected word to look up
//    */
//   function handleWordSelect(word) {
//     const cleanWord = word.replace(/[^\w'-]/g, "");
//     console.log("Looking up word:", cleanWord);
//     props.model
//       .lookupWord(cleanWord)

//       .then((result) => {
//         console.log("Dictionary API result:", result);
//         if (result && result[0]) {
//           setWordCard(result[0]);
//         } else {
//           console.log("No dictionary data found for word:", cleanWord);
//           setWordCard({
//             word: cleanWord,
//             phonetic: null,
//             phonetics: [],
//             meanings: [],
//           });
//         }
//       })
//       .catch((error) => {
//         console.error("Error looking up word:", error);
//         setWordCard({
//           word: cleanWord,
//           phonetic: null,
//           phonetics: [],
//           meanings: [],
//         });
//       });
//   }

//   /**
//    * Handle adding word to user's wordlist
//    * First checks if user is logged in, then saves the word to Firestore
//    * @param {Object} wordData - The word data to save
//    * @returns {Object} - Result with success status and message
//    */
//   async function handleAddToWordlist(wordData) {
//     // Check if user is logged in
//     const user = loginModel.getUser();

//     if (!user) {
//       // User is not logged in, show message
//       return { success: false, message: "Please Login First", type: "warning" };
//     }

//     try {
//       // Save word to Firestore
//       await saveWordToUserWordlist(user.uid, wordData);
//       return {
//         success: true,
//         message: "Added to the default wordlist",
//         type: "success",
//       };
//     } catch (error) {
//       console.error("Error saving word to wordlist:", error);
//       return { success: false, message: "Failed to save word", type: "error" };
//     }
//   }