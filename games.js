// Preact navigation setup
const { h, render } = window.preact;
const { useState } = window.preactHooks;

const games = [
  { id: 'wheel', name: 'Wheel of Fortune', icon: '🎡' },
  { id: 'multi', name: 'Multi-Choice', icon: '❓' },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', icon: '❌' },
  { id: 'memory', name: 'Memory Match', icon: '🃏' }
];

function GamesMenu({ selected, onSelect }) {
  return h('div', { class: 'glass-topbar' },
    h('div', { class: 'games-menu' },
      games.map(game =>
        h('button', {
          class: selected === game.id ? 'selected' : '',
          onClick: () => onSelect(game.id)
        }, `${game.icon} ${game.name}`)
      )
    )
  );


function WheelGameCreator() {
  const [words, setWords] = useState('');
  const [images, setImages] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);

  function handleImages(e) {
    const files = Array.from(e.target.files || []);
    const readers = files.map(f => {
      return new Promise(res => {
        const r = new FileReader();
        r.onload = ev => res(ev.target.result);
        r.readAsDataURL(f);
      });
    });
    Promise.all(readers).then(imgs => setImages(imgs));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const wordList = words.split('\n').map(w => w.trim()).filter(Boolean);
    const segments = [
      ...wordList.map(w => ({ type: 'word', value: w })),
      ...images.map(img => ({ type: 'image', value: img }))
    ];
    if (segments.length < 2) {
      alert('Add at least 2 words or images.');
      return;
    }
    setGameData({ segments });
    setResult(null);
  }

  const [spinAngle, setSpinAngle] = useState(0);

function MultiChoiceCreator() {
  const [questions, setQuestions] = useState([{ q: '', a: '', choices: ['', '', '', ''] }]);
  const [gameStarted, setGameStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);

  function handleQChange(i, field, value) {
    const newQs = questions.slice();
    if (field === 'q' || field === 'a') newQs[i][field] = value;
    else newQs[i].choices[field] = value;
    setQuestions(newQs);
  }
  function addQuestion() {
    setQuestions([...questions, { q: '', a: '', choices: ['', '', '', ''] }]);
  }
  function handleSubmit(e) {
    e.preventDefault();
    // Validate
    if (!questions.every(q => q.q && q.a && q.choices.filter(Boolean).length >= 2)) {
      alert('Each question needs a question, a correct answer, and at least 2 choices.');
      return;
    }
    setGameStarted(true);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setFinished(false);
  }
  function handleChoice(idx) {
    if (showAnswer) return;
    setSelected(idx);
    setShowAnswer(true);
    if (questions[current].choices[idx] === questions[current].a) {
      setScore(s => s + 1);
    }
  }
  function nextQ() {
    if (current + 1 < questions.length) {
      setCurrent(current + 1);
      setSelected(null);
      setShowAnswer(false);
    } else {
      setFinished(true);
    }
  }
  function restart() {
    setGameStarted(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setShowAnswer(false);
    setFinished(false);
  }

  if (gameStarted) {
    if (finished) {
      return h('div', { class: 'game-section' },
        h('h2', null, '📝 Multi-Choice Quiz'),
        h('div', { style: 'font-size:1.2em;font-weight:800;color:#7b4cff;margin-bottom:10px;text-align:center;' },
          `Score: ${score} / ${questions.length}`
        ),
        h('button', { class: 'action-btn', onClick: restart }, 'Play Again'),
        h('button', { class: 'secondary-btn', onClick: () => setGameStarted(false), style: 'margin-left:10px;' }, 'Create New Quiz')
      );
    }
    const q = questions[current];
    return h('div', { class: 'game-section' },
      h('h2', null, '📝 Multi-Choice Quiz'),
      h('div', { style: 'font-size:1.1em;font-weight:700;margin-bottom:12px;color:#3b1f7a;' }, `Q${current + 1}: ${q.q}`),
      h('div', { style: 'display:flex;flex-direction:column;gap:12px;margin-bottom:18px;' },
        q.choices.filter(Boolean).map((c, i) =>
          h('button', {
            class: 'mcq-choice',
            style: `padding:14px 18px;border-radius:12px;font-size:1.08em;font-weight:600;background:${selected === i ? (c === q.a ? '#a0ffb4' : '#ffd6d6') : 'rgba(255,255,255,0.7)'};border:2px solid #e0e7ff;box-shadow:0 2px 8px #7b4cff11;cursor:${showAnswer ? 'not-allowed' : 'pointer'};transition:background 0.15s,border 0.15s;`,
            onClick: () => handleChoice(i),
            disabled: showAnswer
          }, c)
        )
      ),
      showAnswer && h('div', { style: 'font-size:1.08em;font-weight:700;margin-bottom:10px;color:' + (q.choices[selected] === q.a ? '#1aaf5d' : '#ff4b4b') },
        q.choices[selected] === q.a ? 'Correct!' : `Wrong! Correct: ${q.a}`
      ),
      h('button', { class: 'action-btn', onClick: nextQ, disabled: !showAnswer }, current + 1 < questions.length ? 'Next' : 'Finish')
    );
  }

  return h('div', { class: 'game-section' },
    h('h2', null, '📝 Multi-Choice Game Creator'),
    h('form', { onSubmit: handleSubmit },
      questions.map((q, i) =>
        h('div', { class: 'mcq-block', key: i },
          h('input', {
            placeholder: `Question ${i + 1}`,
            value: q.q,
            onInput: e => handleQChange(i, 'q', e.target.value)
          }),
          h('input', {
            placeholder: 'Correct Answer',
            value: q.a,
            onInput: e => handleQChange(i, 'a', e.target.value)
          }),
          q.choices.map((c, j) =>
            h('input', {
              key: j,
              placeholder: `Choice ${j + 1}`,
              value: c,
              onInput: e => handleQChange(i, j, e.target.value)
            })
          )
        )
      ),
      h('button', { type: 'button', class: 'secondary-btn', onClick: addQuestion, style: 'margin-bottom:10px;' }, 'Add Question'),
      h('button', { type: 'submit', class: 'action-btn' }, 'Create Game')
    )
  );
}

  if (gameData) {
    const segCount = gameData.segments.length;
    const anglePerSeg = 360 / segCount;
    // If spinning, use spinAngle, else if result, rotate so winner is at top
    let wheelStyle = 'position:relative;max-width:340px;margin:0 auto 18px auto;cursor:pointer;transition:transform 2.2s cubic-bezier(.22,1.2,.36,1);';
    if (spinning) {
      wheelStyle += `transform:rotate(${spinAngle}deg);`;
    } else if (result !== null) {
      const winnerAngle = 360 - result * anglePerSeg - anglePerSeg / 2;
      wheelStyle += `transform:rotate(${winnerAngle}deg);`;
    }
    return h('div', { class: 'game-section' },
      h('h2', null, '🎡 Wheel of Fortune'),
      h('p', null, 'Click the wheel to spin!'),
      h('div', {
        style: wheelStyle
      },
        renderWheel(gameData.segments),
        h('div', {
          style: 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:2;',
          onClick: spinWheel
        })
      ),
      result !== null && h('div', {
        style: 'margin-top:18px;font-size:1.25em;font-weight:800;color:#7b4cff;text-align:center;letter-spacing:0.01em;'
      }, 'Result: ', gameData.segments[result].type === 'word' ? gameData.segments[result].value : h('img', { src: gameData.segments[result].value, style: 'width:48px;height:48px;vertical-align:middle;border-radius:10px;box-shadow:0 2px 8px #7b4cff22;margin-left:8px;' })),
      h('button', { class: 'action-btn', style: 'margin-top:24px;', onClick: () => { setGameData(null); setResult(null); setSpinAngle(0); } }, 'Create Another Wheel')
    );
  }

  return h('div', { class: 'game-section' },
    h('h2', null, '🎡 Wheel of Fortune Game Creator'),
    h('p', null, 'Add words (one per line) and/or upload images to create your custom wheel.'),
    h('form', { onSubmit: handleSubmit },
      h('textarea', {
        placeholder: 'Enter words, one per line',
        value: words,
        onInput: e => setWords(e.target.value)
      }),
      h('input', {
        type: 'file',
        accept: 'image/*',
        multiple: true,
        onChange: handleImages
      }),
      images.length > 0 && h('div', { class: 'image-preview' }, images.map((img, i) => h('img', { src: img, key: i }))),
      h('button', { type: 'submit', class: 'action-btn' }, 'Create Wheel Game')
    )
  );
}


function TicTacToeCreator() {
  const [player1, setPlayer1] = useState('Player 1');
  const [player2, setPlayer2] = useState('Player 2');
  const [gameStarted, setGameStarted] = useState(false);
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [winner, setWinner] = useState(null);
  const [draw, setDraw] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setGameStarted(true);
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setDraw(false);
  }

  function checkWinner(b) {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8], // rows
      [0,3,6],[1,4,7],[2,5,8], // cols
      [0,4,8],[2,4,6] // diags
    ];
    for (let [a,b1,c] of lines) {
      if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    return null;
  }

  function handleCell(idx) {
    if (winner || board[idx]) return;
    const newBoard = board.slice();
    newBoard[idx] = xIsNext ? 'X' : 'O';
    const win = checkWinner(newBoard);
    setBoard(newBoard);
    setWinner(win);
    setDraw(!win && newBoard.every(cell => cell));
    setXIsNext(!xIsNext);
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
    setWinner(null);
    setDraw(false);
  }

  if (gameStarted) {
    return h('div', { class: 'game-section' },
      h('h2', null, '❌⭕ Tic-Tac-Toe'),
      h('div', { class: 'ttt-players', style: 'display:flex;justify-content:center;gap:24px;margin-bottom:12px;' },
        h('span', { style: xIsNext && !winner && !draw ? 'font-weight:700;color:#7b4cff;' : '' }, player1 + ' (X)'),
        h('span', { style: !xIsNext && !winner && !draw ? 'font-weight:700;color:#a084ff;' : '' }, player2 + ' (O)')
      ),
      h('div', { class: 'ttt-board', style: 'display:grid;grid-template-columns:repeat(3,64px);gap:10px;justify-content:center;margin-bottom:18px;' },
        board.map((cell, i) =>
          h('button', {
            class: 'ttt-cell',
            style: 'width:64px;height:64px;font-size:2.2em;font-weight:900;border-radius:16px;background:rgba(255,255,255,0.7);border:2px solid #e0e7ff;box-shadow:0 2px 8px #7b4cff11;cursor:' + (cell || winner ? 'not-allowed' : 'pointer') + ';transition:background 0.15s,border 0.15s;',
            onClick: () => handleCell(i),
            disabled: !!cell || !!winner
          }, cell)
        )
      ),
      winner && h('div', { style: 'font-size:1.2em;font-weight:800;color:#7b4cff;margin-bottom:10px;text-align:center;' },
        (winner === 'X' ? player1 : player2) + ' wins! 🎉'
      ),
      draw && !winner && h('div', { style: 'font-size:1.2em;font-weight:800;color:#a084ff;margin-bottom:10px;text-align:center;' },
        'It\'s a draw!'
      ),
      h('button', { class: 'action-btn', onClick: resetGame, style: 'margin-right:10px;' }, 'Restart'),
      h('button', { class: 'secondary-btn', onClick: () => setGameStarted(false) }, 'Create New Game')
    );
  }

  return h('div', { class: 'game-section' },
    h('h2', null, '❌⭕ Tic-Tac-Toe Game Creator'),
    h('form', { onSubmit: handleSubmit },
      h('div', { class: 'input-block' },
        h('label', null, 'Player 1 Name'),
        h('input', {
          value: player1,
          onInput: e => setPlayer1(e.target.value)
        })
      ),
      h('div', { class: 'input-block' },
        h('label', null, 'Player 2 Name'),
        h('input', {
          value: player2,
          onInput: e => setPlayer2(e.target.value)
        })
      ),
      h('button', { type: 'submit', class: 'action-btn' }, 'Create Game')
    )
  );
}
  function handleImages(e) {
    const files = Array.from(e.target.files || []);
    const readers = files.map(f => {
      return new Promise(res => {
        const r = new FileReader();
        r.onload = ev => res(ev.target.result);
        r.readAsDataURL(f);
      });
    });
    Promise.all(readers).then(imgs => setImages(imgs));
  }

function MemoryMatchCreator() {
  const [cards, setCards] = useState([]);
  const [input, setInput] = useState('');
  const [images, setImages] = useState([]);
  function addCard() {
    if (input.trim()) setCards(cs => [...cs, { type: 'word', value: input.trim() }]);
    setInput('');
  }
  function handleImages(e) {
    const files = Array.from(e.target.files || []);
    const readers = files.map(f => {
      return new Promise(res => {
        const r = new FileReader();
        r.onload = ev => res(ev.target.result);
        r.readAsDataURL(f);
      });
    });
    Promise.all(readers).then(imgs => {
      setCards(cs => [...cs, ...imgs.map(img => ({ type: 'image', value: img }))]);
      setImages(imgs);
    });
  }
  function handleSubmit(e) {
    e.preventDefault();
    // TODO: Create memory match game logic
    alert('Memory Match game created!');
  }
  return h('div', { class: 'game-section' },
    h('h2', null, '🃏 Memory Match Creator'),
    h('p', null, 'Add vocab words or upload images for the memory match game.'),
    h('form', { onSubmit: handleSubmit },
      h('div', { style: 'display:flex;gap:10px;align-items:center;' },
        h('input', {
          type: 'text',
          placeholder: 'Enter word or vocab',
          value: input,
          onInput: e => setInput(e.target.value)
        }),
        h('button', { type: 'button', class: 'action-btn', onClick: addCard }, 'Add Card')
      ),
      h('input', {
        type: 'file',
        accept: 'image/*',
        multiple: true,
        onChange: handleImages
      }),
      cards.length > 0 && h('div', { class: 'image-preview' },
        cards.map((c, i) => c.type === 'image'
          ? h('img', { src: c.value, key: i })
          : h('div', { key: i, style: 'background:#f7f8fa;border-radius:10px;padding:10px 18px;font-weight:700;font-size:1.1em;box-shadow:0 1px 4px rgba(123,76,255,0.04);border:1.5px solid #e0e7ff;display:inline-block;' }, c.value)
        )
      ),
      h('button', { type: 'submit', class: 'action-btn' }, 'Create Memory Match Game')
    )
  );
}

const GameCreators = {
  wheel: WheelGameCreator,
  
  tictactoe: TicTacToeCreator,
  memory: MemoryMatchCreator
};

function App() {
  const [selected, setSelected] = useState('wheel');
  return h('div', null,
    h(GamesMenu, { selected, onSelect: setSelected }),
    h(GameCreators[selected])
  );
}

render(h(App), document.getElementById('app'));
