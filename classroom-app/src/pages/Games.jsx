import { useState } from 'react';

export const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);

  const games = [
    {
      id: 'hangman',
      title: 'Hangman',
      description: 'Guess the word before the man is hanged',
      icon: ' gallows',
      path: '/games/hangman'
    },
    {
      id: 'memory',
      title: 'Memory Match',
      description: 'Match pairs of cards to win',
      icon: '🃏',
      path: '/games/memory'
    },
    {
      id: 'multiplication',
      title: 'Multiplication',
      description: 'Practice multiplication tables',
      icon: '✖️',
      path: '/games/multiplication'
    },
    {
      id: 'wheel',
      title: 'Prize Wheel',
      description: 'Spin the wheel for prizes',
      icon: '🎡',
      path: '/games/wheel'
    }
  ];

  // Simple Hangman game component
  const HangmanGame = () => {
    const [word, setWord] = useState('REACT');
    const [guessedLetters, setGuessedLetters] = useState([]);
    const [wrongGuesses, setWrongGuesses] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [won, setWon] = useState(false);

    const handleGuess = (letter) => {
      if (guessedLetters.includes(letter) || gameOver) return;

      const newGuessed = [...guessedLetters, letter];
      setGuessedLetters(newGuessed);

      if (!word.includes(letter)) {
        const newWrongGuesses = wrongGuesses + 1;
        setWrongGuesses(newWrongGuesses);
        if (newWrongGuesses >= 6) {
          setGameOver(true);
        }
      } else {
        // Check if all letters are guessed
        const allGuessed = word.split('').every(l => newGuessed.includes(l));
        if (allGuessed) {
          setWon(true);
          setGameOver(true);
        }
      }
    };

    const resetGame = () => {
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameOver(false);
      setWon(false);
    };

    const displayWord = word.split('').map(letter => 
      guessedLetters.includes(letter) ? letter : '_ '
    ).join(' ');

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return (
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
        border: '1px solid rgba(120,110,255,0.06)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', textAlign: 'center' }}>Hangman</h3>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px', fontFamily: 'monospace' }}>
            {displayWord}
          </div>
          
          <div style={{ marginBottom: '16px' }}>
            Wrong guesses: {wrongGuesses}/6
          </div>
          
          {gameOver && (
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '16px',
              color: won ? '#10b981' : '#ef4444'
            }}>
              {won ? 'You won! 🎉' : 'Game over! 😢'}
            </div>
          )}
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
            {alphabet.map(letter => (
              <button
                key={letter}
                onClick={() => handleGuess(letter)}
                disabled={guessedLetters.includes(letter) || gameOver}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  border: '1px solid rgba(11,18,32,0.06)',
                  background: guessedLetters.includes(letter) 
                    ? word.includes(letter) 
                      ? 'linear-gradient(135deg, #10b981, #34d399)' 
                      : 'linear-gradient(135deg, #ef4444, #f87171)'
                    : 'transparent',
                  color: guessedLetters.includes(letter) ? 'white' : '#6b7280',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                {letter}
              </button>
            ))}
          </div>
          
          <button
            onClick={resetGame}
            style={{
              background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
              color: 'white',
              border: '0',
              padding: '10px 16px',
              borderRadius: '10px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Reset Game
          </button>
        </div>
      </div>
    );
  };

  // Simple Memory Game component
  const MemoryGame = () => {
    const [cards, setCards] = useState([]);
    const [flipped, setFlipped] = useState([]);
    const [matched, setMatched] = useState([]);
    const [moves, setMoves] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const resetGame = () => {
      const emojis = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];
      const gameCards = [...emojis.slice(0, 8), ...emojis.slice(0, 8)];
      gameCards.sort(() => Math.random() - 0.5);
      
      setCards(gameCards);
      setFlipped([]);
      setMatched([]);
      setMoves(0);
      setGameStarted(true);
    };

    const handleCardClick = (index) => {
      if (flipped.length === 2 || flipped.includes(index) || matched.includes(index)) return;

      const newFlipped = [...flipped, index];
      setFlipped(newFlipped);

      if (newFlipped.length === 2) {
        setMoves(moves + 1);
        const [firstIndex, secondIndex] = newFlipped;
        if (cards[firstIndex] === cards[secondIndex]) {
          setMatched([...matched, firstIndex, secondIndex]);
        }
        
        setTimeout(() => {
          setFlipped([]);
        }, 1000);
      }
    };

    return (
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
        border: '1px solid rgba(120,110,255,0.06)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', textAlign: 'center' }}>Memory Match</h3>
        
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <div>Moves: {moves}</div>
          <button
            onClick={resetGame}
            style={{
              background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
              color: 'white',
              border: '0',
              padding: '8px 12px',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            Start Game
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '8px',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
          {cards.map((card, index) => (
            <div
              key={index}
              onClick={() => handleCardClick(index)}
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                cursor: 'pointer',
                color: 'white',
                fontWeight: 'bold'
              }}
            >
              {flipped.includes(index) || matched.includes(index) ? card : '?'}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple Multiplication Game component
  const MultiplicationGame = () => {
    const [question, setQuestion] = useState({ a: 0, b: 0, answer: 0 });
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState('');
    const [score, setScore] = useState(0);
    const [gameStarted, setGameStarted] = useState(false);

    const generateQuestion = () => {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      setQuestion({ a, b, answer: a * b });
    };

    const startGame = () => {
      setScore(0);
      generateQuestion();
      setGameStarted(true);
    };

    const checkAnswer = () => {
      if (parseInt(userAnswer) === question.answer) {
        setFeedback('Correct! 🎉');
        setScore(score + 1);
      } else {
        setFeedback(`Incorrect! The answer is ${question.answer}`);
      }
      
      setTimeout(() => {
        setUserAnswer('');
        setFeedback('');
        generateQuestion();
      }, 1000);
    };

    return (
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
        border: '1px solid rgba(120,110,255,0.06)',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600', textAlign: 'center' }}>Multiplication</h3>
        
        {!gameStarted ? (
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={startGame}
              style={{
                background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                color: 'white',
                border: '0',
                padding: '12px 24px',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Start Game
            </button>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                {question.a} × {question.b} = ?
              </div>
              
              <input
                type="number"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="Your answer"
                style={{
                  width: '100px',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid #eef2f8',
                  textAlign: 'center',
                  fontSize: '16px'
                }}
              />
              
              <button
                onClick={checkAnswer}
                style={{
                  background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
                  color: 'white',
                  border: '0',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  marginLeft: '8px'
                }}
              >
                Check
              </button>
            </div>
            
            {feedback && (
              <div style={{ 
                textAlign: 'center', 
                marginBottom: '16px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {feedback}
              </div>
            )}
            
            <div style={{ textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>
              Score: {score}
            </div>
          </>
        )}
      </div>
    );
  };

  // Simple Wheel Game component
  const WheelGame = () => {
    const [spinning, setSpinning] = useState(false);
    const [result, setResult] = useState(null);
    const [rotation, setRotation] = useState(0);

    const segments = [
      { text: '50 pts', color: '#ff6b6b' },
      { text: '10 pts', color: '#4ecdc4' },
      { text: '25 pts', color: '#45b7d1' },
      { text: '100 pts', color: '#96ceb4' },
      { text: '75 pts', color: '#feca57' },
      { text: '20 pts', color: '#ff9ff3' },
      { text: '30 pts', color: '#54a0ff' },
      { text: '15 pts', color: '#5f27cd' }
    ];

    const spinWheel = () => {
      if (spinning) return;
      
      setSpinning(true);
      setResult(null);
      
      // Random rotation between 1080 and 2160 degrees (3-6 full rotations)
      const extraRotation = Math.floor(Math.random() * 1080) + 1080;
      const newRotation = rotation + extraRotation;
      setRotation(newRotation);
      
      // Calculate result after animation completes
      setTimeout(() => {
        const segmentIndex = Math.floor(Math.random() * segments.length);
        setResult(segments[segmentIndex].text);
        setSpinning(false);
      }, 3000);
    };

    const segmentAngle = 360 / segments.length;

    return (
      <div style={{
        background: 'white',
        borderRadius: '18px',
        padding: '24px',
        boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
        border: '1px solid rgba(120,110,255,0.06)',
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '600' }}>Prize Wheel</h3>
        
        <div style={{ position: 'relative', width: '300px', height: '300px', margin: '0 auto 20px' }}>
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              transition: spinning ? 'transform 3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none',
              transform: `rotate(${rotation}deg)`,
              border: '4px solid #6b46ff'
            }}
          >
            {segments.map((segment, index) => {
              const rotate = index * segmentAngle;
              const skew = 90 - segmentAngle;
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: '50%',
                    height: '50%',
                    transformOrigin: '100% 100%',
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${rotate}deg) skew(${skew}deg)`,
                    background: segment.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    clipPath: 'polygon(0 0, 100% 0, 100% 100%)'
                  }}
                >
                  <div
                    style={{
                      transform: `skew(${-skew}deg) rotate(${segmentAngle/2}deg) translateY(-10px)`,
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      textAlign: 'center'
                    }}
                  >
                    {segment.text}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40px',
              height: '40px',
              background: '#6b46ff',
              borderRadius: '50%',
              zIndex: 10
            }}
          />
          
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '20px solid transparent',
              borderRight: '20px solid transparent',
              borderBottom: '40px solid #6b46ff',
              zIndex: 9
            }}
          />
        </div>
        
        <button
          onClick={spinWheel}
          disabled={spinning}
          style={{
            background: 'linear-gradient(135deg, #6b46ff, #b86bff)',
            color: 'white',
            border: '0',
            padding: '12px 24px',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: spinning ? 'not-allowed' : 'pointer',
            marginBottom: '16px'
          }}
        >
          {spinning ? 'Spinning...' : 'Spin Wheel'}
        </button>
        
        {result && (
          <div style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#6b46ff',
            animation: 'pulse 0.5s'
          }}>
            You won: {result}!
          </div>
        )}
        
        <style>{`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '700',
          margin: 0,
          color: '#22143a'
        }}>
          Educational Games
        </h2>
      </div>

      {!selectedGame ? (
        <div style={{
          background: 'white',
          borderRadius: '18px',
          padding: '24px',
          boxShadow: '0 8px 28px rgba(15,20,40,0.08)',
          border: '1px solid rgba(120,110,255,0.06)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600' }}>Choose a Game</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
            {games.map(game => (
              <div 
                key={game.id}
                onClick={() => setSelectedGame(game.id)}
                style={{
                  background: 'linear-gradient(180deg, #fff, #fbfdff)',
                  borderRadius: '16px',
                  padding: '16px',
                  border: '1px solid rgba(120,110,255,0.06)',
                  transition: '0.28s',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.style.transform = 'translateY(-2px) scale(1.02)';
                  e.style.background = 'linear-gradient(180deg, #ffffff, #f0f4ff)';
                }}
                onMouseLeave={(e) => {
                  e.style.transform = 'translateY(0) scale(1)';
                  e.style.background = 'linear-gradient(180deg, #fff, #fbfdff)';
                }}
              >
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>{game.icon}</div>
                  <div style={{ fontWeight: '600', fontSize: '16px' }}>{game.title}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {game.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setSelectedGame(null)}
            style={{
              background: 'transparent',
              border: '1px solid rgba(11,18,32,0.06)',
              padding: '8px 12px',
              borderRadius: '8px',
              color: '#6b7280',
              cursor: 'pointer',
              marginBottom: '16px'
            }}
          >
            ← Back to Games
          </button>
          
          {selectedGame === 'hangman' && <HangmanGame />}
          {selectedGame === 'memory' && <MemoryGame />}
          {selectedGame === 'multiplication' && <MultiplicationGame />}
          {selectedGame === 'wheel' && <WheelGame />}
        </div>
      )}
    </div>
  );
};