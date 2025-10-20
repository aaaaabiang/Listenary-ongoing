import '../styles/Wordlist.css';
import { TopNav } from '../components/TopNav';
import type { ReactElement, JSXElementConstructor, ReactNode, ReactPortal, Key } from 'react';

/**
 * WordlistView Component - Part of the View layer in MVP
 * Displays the user's wordlist and selected word details
 */

export function WordlistView({ 
  words, 
  selectedWordIndex, 
  selectedWord, 
  onWordSelect,
  isLoading,
  error,
  isLoggedIn,
  onDeleteWord,
}) {
  return (
    <div className="page-container">
      <TopNav />
      <div className="wordlist-container">
        {/* Left sidebar - Word list */}
        <div className="wordlist-sidebar">
          <h2 className="sidebar-title">My Wordlist</h2>

          {!isLoggedIn && (
            <div className="login-prompt">
              <p>Please log in to view your saved words.</p>
            </div>
          )}

          {isLoggedIn && isLoading && (
            <div className="wordlist-skeleton">
              <div className="skeleton sk-line" style={{width:'80%'}}/>
              <div className="skeleton sk-line" style={{width:'60%', marginTop:8}}/>
              <div className="skeleton sk-line" style={{width:'70%', marginTop:8}}/>
            </div>
          )}

          {isLoggedIn && error && (
            <div className="error-state">
              <p>{error}</p>
            </div>
          )}

          {isLoggedIn && !isLoading && !error && words.length === 0 && (
            <div className="empty-state">
              <p>You haven't saved any words yet.</p>
              <p>Look up words in podcast transcripts and add them to your wordlist.</p>
            </div>
          )}

          {isLoggedIn && !isLoading && words.length > 0 && (
            <div className="wordlist-list">
              {words.map((word: { word: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode>>; meanings: string | any[]; }, index: Key) => (
                <div
                  key={index}
                  className={`wordlist-item ${selectedWordIndex === index ? 'selected' : ''}`}
                  onClick={() => onWordSelect(index)}
                >
                  <span className="wordlist-name">{word.word}</span>
                  <span className="wordlist-count">
                    {word.meanings && word.meanings.length > 0 ? word.meanings[0].partOfSpeech : ''}
                  </span>
                  {/* 新增删除按钮 */}
                  <button
                    className="wordlist-delete-btn"
                    type="button"
                    aria-label="Delete word"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteWord?.(index);
                    }}
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 7h16M10 11v6m4-6v6M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right content - Word details */}
        <div className="wordlist-content">
          {selectedWord ? (
            <div className="word-details">
              <h2 className="content-title">{selectedWord.word}</h2>
              
              {/* Phonetics section - Simplified to show only one phonetic */}
              {selectedWord.phonetics && selectedWord.phonetics.length > 0 && (
                <div className="phonetics-section">
                  {(() => {
                    // Find the first phonetic with audio, or just use the first one
                    const phoneticWithAudio = selectedWord.phonetics.find((p: { audio: any; }) => p.audio) || selectedWord.phonetics[0];
                    
                    return (
                      <div className="phonetic-item">
                        <span className="phonetic-text">
                          {phoneticWithAudio.text || selectedWord.phonetic || ''}
                        </span>
                        {phoneticWithAudio.audio && (
                          <button 
                            className="phonetic-audio-btn"
                            onClick={() => {
                              const audio = new Audio(phoneticWithAudio.audio);
                              audio.play();
                            }}
                          >
                            🔊 Play
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
              
              {/* Meanings section */}
              {selectedWord.meanings && selectedWord.meanings.map((meaning: { partOfSpeech: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode>>; definitions: any[]; synonyms: any[]; antonyms: any[]; }, meaningIndex: Key) => (
                <div key={meaningIndex} className="meaning-section">
                  <h3 className="part-of-speech">{meaning.partOfSpeech}</h3>
                  
                  {meaning.definitions && meaning.definitions.map((def, defIndex) => (
                    <div key={defIndex} className="definition-item">
                      <p className="definition-text">{def.definition}</p>
                      {def.example && (
                        <p className="example-text">Example: "{def.example}"</p>
                      )}
                    </div>
                  ))}
                  
                  {/* Synonyms */}
                  {meaning.synonyms && meaning.synonyms.length > 0 && (
                    <div className="word-synonyms">
                      <h4>Synonyms:</h4>
                      <div className="synonyms-list">
                        {meaning.synonyms.map((synonym, synIndex) => (
                          <span key={synIndex} className="synonym-tag">{synonym}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Antonyms */}
                  {meaning.antonyms && meaning.antonyms.length > 0 && (
                    <div className="word-antonyms">
                      <h4>Antonyms:</h4>
                      <div className="antonyms-list">
                        {meaning.antonyms.map((antonym, antIndex) => (
                          <span key={antIndex} className="antonym-tag">{antonym}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-selection">
              <p>Select a word from your wordlist to view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
