// App.tsx
import React, { useState, useEffect } from 'react';
import './App.css';

// Define available languages
interface Language {
  code: string;
  name: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'hi', name: 'Hindi' },
];

const App: React.FC = () => {
  const [sourceLanguage, setSourceLanguage] = useState<string>('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [inputText, setInputText] = useState<string>('');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [charCount, setCharCount] = useState<number>(0);

  // Update character count when input changes
  useEffect(() => {
    setCharCount(inputText.length);
  }, [inputText]);

  // Swap languages
  const handleSwapLanguages = () => {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInputText(translatedText);
    setTranslatedText(inputText);
  };

  // Copy translated text to clipboard
  const handleCopyText = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle translation
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setTranslatedText('');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8082/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: inputText,
          source: sourceLanguage,
          target: targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error('Translation service unavailable');
      }

      const data = await response.json();
      console.log('Translation response:', data);
      setTranslatedText(data.translatedText || '');
    } catch (err) {
      setError('Failed to translate. Please try again later.');
      console.error('Translation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-translate when language changes or after typing stops (with debounce)
  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (inputText.trim()) {
        handleTranslate();
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [inputText, sourceLanguage, targetLanguage]);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <h1>Language Converter</h1>
          <p>Translate text between multiple languages instantly</p>
        </div>
      </header>

      <main className="app-main">
        {/* Language selection bar */}
        <div className="language-bar">
          <div className="select-container">
            <select
              value={sourceLanguage}
              onChange={(e) => setSourceLanguage(e.target.value)}
              className="language-select"
            >
              {languages.map((lang) => (
                <option key={`source-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwapLanguages}
            className="swap-button"
            aria-label="Swap languages"
          >
            ↔
          </button>

          <div className="select-container">
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="language-select"
            >
              {languages.map((lang) => (
                <option key={`target-${lang.code}`} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text areas */}
        <div className="text-areas">
          {/* Input text area */}
          <div className="text-column">
            <div className="textarea-container">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="text-input"
                placeholder="Enter text to translate..."
              />
              <div className="input-actions">
                <span>{charCount} characters</span>
                <button
                  onClick={() => setInputText('')}
                  className="clear-button"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Output text area */}
          <div className="text-column">
            <div className="textarea-container">
              <div className="output-wrapper">
                {isLoading && <div className="loading-indicator">Translating...</div>}
                <textarea
                  value={translatedText}
                  readOnly
                  className="text-output"
                  placeholder="Translation will appear here..."
                />
              </div>
              <div className="output-actions">
                <button
                  onClick={handleCopyText}
                  disabled={!translatedText}
                  className={`copy-button ${!translatedText ? 'disabled' : ''}`}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Powered by your translation API</p>
      </footer>
    </div>
  );
};

export default App;