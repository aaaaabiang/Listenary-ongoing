import { observer } from "mobx-react-lite";
import { WordlistView } from "../views/WordlistView";
import { useState, useEffect, useRef } from "react";
// MongoDB API 调用
import { getUserWordlist, deleteWordFromUserWordlist } from "../api/userAPI";
import loginModel from "../loginModel";

/**
 * Wordlist Presenter Component - Part of the Presenter layer in MVP
 * Manages the retrieval and display of user's saved words
 */

// 新增：给 props 一个最小类型 
type Props = { model: any };

// 缓存有效期（毫秒）
const WORDLIST_CACHE_TTL = 10 * 60 * 1000; // 10 分钟

// 展示层统一去掉“音节星号”
function stripSyllableStars(s: unknown) {
  return typeof s === "string" ? s.replace(/\*/g, "") : s;
}

const WordlistPresenter = observer(function WordlistPresenter(props: Props) {
  // State for handling wordlist display and selection
  const [userWords, setUserWords] = useState<any[]>([]);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(-1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!loginModel.getUser());

  // 缓存控制
  const lastLoadedAtRef = useRef<number | null>(null);
  const loadingRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(false);

  // 登录态监听，只在登录态变化时刷新列表
  useEffect(() => {
    isMountedRef.current = true;
    const unsubscribe = loginModel.setupAuthStateListener((user) => {
      setIsLoggedIn(!!user);
      // 登录 -> 拉取；登出 -> 清空
      if (user) {
        void loadWordlistIfNeeded(true); // 登录后强制刷新一遍
      } else {
        setUserWords([]);
        setSelectedWordIndex(-1);
        lastLoadedAtRef.current = null;
        setIsLoading(false);
        setError(null);
      }
    });

    // 初次挂载尝试加载（若已有登录态）
    if (loginModel.getUser()) {
      void loadWordlistIfNeeded(false);
    } else {
      setIsLoading(false);
    }

    return () => {
      isMountedRef.current = false;
      unsubscribe && unsubscribe();
    };
    // 空依赖：只在挂载/卸载时执行
  }, []);

  // 监听单词本刷新触发器
  useEffect(() => {
    if (props.model.wordlistRefreshTrigger > 0 && loginModel.getUser()) {
      void loadWordlistIfNeeded(true); // 强制刷新
    }
  }, [props.model.wordlistRefreshTrigger]);

  // 仅在需要时加载（带 TTL 缓存）
  async function loadWordlistIfNeeded(forceReload: boolean) {
    if (!loginModel.getUser()) return;

    const now = Date.now();
    const fresh =
      lastLoadedAtRef.current &&
      now - lastLoadedAtRef.current < WORDLIST_CACHE_TTL;

    if (!forceReload && fresh) {
      // 缓存未过期，直接结束 loading
      setIsLoading(false);
      return;
    }

    if (loadingRef.current) return;
    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const words = await getUserWordlist();

      // 在 Presenter 侧统一去掉“音节星号”，减少视图层重复处理
      const cleaned = (Array.isArray(words) ? words : []).map((w) => ({
        ...w,
        word: stripSyllableStars(w.word),
        // 保险：部分来源把 phonetic/text 里也混入 *，一并清理
        phonetic: stripSyllableStars(w.phonetic),
        phonetics: Array.isArray(w.phonetics)
          ? w.phonetics.map((p: any) => ({
              ...p,
              text: stripSyllableStars(p?.text),
            }))
          : w.phonetics,
      }));

      if (!isMountedRef.current) return;

      setUserWords(cleaned);
      lastLoadedAtRef.current = Date.now();

      // 尝试保持之前的选中语义：如果之前没有选中，选中第一个
      setSelectedWordIndex((prev) => {
        if (cleaned.length === 0) return -1;
        if (prev < 0 || prev >= cleaned.length) return 0;
        return prev;
      });
    } catch (err) {
      console.error("Error fetching wordlist:", err);
      if (!isMountedRef.current) return;
      setError("Failed to load wordlist. Please try again later.");
    } finally {
      loadingRef.current = false;
      if (isMountedRef.current) setIsLoading(false);
    }
  }

  /**
   * Handle selection of a word from the wordlist
   * @param {number} index - The index of the selected word
   */
  const handleWordSelect = (index: number) => {
    setSelectedWordIndex(index);
    // 若未来做“按需加载详情”，这里可触发 fetchDetail(wordId/word)
  };

  // Get the currently selected word for display in the details panel
  const selectedWord = selectedWordIndex >= 0 && selectedWordIndex < userWords.length 
    ? userWords[selectedWordIndex] 
    : null;

  const handleDeleteWord = async (index: number) => {
    const user = loginModel.getUser();
    if (!user) return;

    const wordToDelete = userWords[index];
    if (!wordToDelete) return;

    const newLength = userWords.length - 1;
    const nextSelected = (() => {
      if (index === selectedWordIndex) {
        return newLength === 0 ? -1 : Math.min(index, newLength - 1);
      }
      if (index < selectedWordIndex) {
        return selectedWordIndex - 1;
      }
      return selectedWordIndex;
    })();

    // 乐观更新本地状态
    setUserWords((prev) => prev.filter((_, i) => i !== index));
    setSelectedWordIndex(nextSelected);

    // 同步远端
    try {
      await deleteWordFromUserWordlist(wordToDelete.word);
      // 删除后更新缓存时间，避免马上又触发全量刷新
      lastLoadedAtRef.current = Date.now();
    } catch (error) {
      // 失败时回滚为服务器最新（简单起见，重新拉取）
      try {
        await loadWordlistIfNeeded(true);
        setError("Failed to delete word (server). Refreshed your list.");
      } catch {
        setError("Failed to delete and refresh wordlist.");
      }
    }
  };

  return (
    <WordlistView 
      words={userWords}
      selectedWordIndex={selectedWordIndex}
      selectedWord={selectedWord}
      onWordSelect={handleWordSelect}
      isLoading={isLoading}
      error={error}
      isLoggedIn={isLoggedIn}
      onDeleteWord={handleDeleteWord}
    />
  );
});

export default WordlistPresenter;
