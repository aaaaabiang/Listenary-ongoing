import '../styles/Wordlist.css';
import { TopNav } from '../components/TopNav';

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
  isLoggedIn
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
            <div className="loading-state">
              <p>Loading your wordlist...</p>
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
              {words.map((word, index) => (
                <div
                  key={index}
                  className={`wordlist-item ${selectedWordIndex === index ? 'selected' : ''}`}
                  onClick={() => onWordSelect(index)}
                >
                  <span className="wordlist-name">{word.word}</span>
                  <span className="wordlist-count">
                    {word.meanings && word.meanings.length > 0 ? word.meanings[0].partOfSpeech : ''}
                  </span>
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
                    const phoneticWithAudio = selectedWord.phonetics.find(p => p.audio) || selectedWord.phonetics[0];
                    
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
              {selectedWord.meanings && selectedWord.meanings.map((meaning, meaningIndex) => (
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