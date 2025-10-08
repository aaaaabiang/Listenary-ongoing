import { useRef } from "react";

export function DictionaryCard({ wordCard, onClose, onAddToWordlist }) {
  const phoneticAudioRef = useRef(null);

  const playPhoneticAudio = (url) => {
    if (!url) return;
    if (phoneticAudioRef.current) {
      phoneticAudioRef.current.src = url;
      phoneticAudioRef.current.play();
    }
  };

  return (
    <>
      <div className="dictionary-mask" onClick={onClose} />
      <div
        className="dictionary-card"
        style={{
          top: `${wordCard.position?.top || 0}px`,
          left: `${wordCard.position?.left || 0}px`,
          zIndex: 1300,
        }}
      >
        <div className="dictionary-card-content">
          <div className="word-header">
            <h3 className="word-text">{wordCard?.word || "..."}</h3>
            <span className="word-level">
              {wordCard?.meanings?.[0]?.partOfSpeech || "N/A"}
            </span>
          </div>
          <div className="word-phonetics">
            <div className="phonetic">
              <span className="phonetic-label">Phonetic</span>
              <span className="phonetic-text">
                {wordCard?.phonetic || "N/A"}
              </span>
              {wordCard?.phonetics?.[0]?.audio && (
                <>
                  <button
                    className="phonetic-audio-btn"
                    onClick={() =>
                      playPhoneticAudio(wordCard.phonetics[0].audio)
                    }
                    title="Play pronunciation"
                  >
                    🔊
                  </button>
                  <audio ref={phoneticAudioRef} style={{ display: "none" }} />
                </>
              )}
            </div>
          </div>
          <div className="word-definition">
            {wordCard?.meanings?.map((meaning, index) => (
              <div key={index} className="meaning-section">
                <p className="part-of-speech">{meaning.partOfSpeech}</p>
                {meaning.definitions?.map((def, defIndex) => (
                  <div key={defIndex} className="definition-item">
                    <p className="definition-text">{def.definition}</p>
                    {def.example && (
                      <p className="example-text">"{def.example}"</p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <button className="add-to-wordlist-btn" onClick={onAddToWordlist}>
          Add to Wordlist
        </button>
      </div>
    </>
  );
}
