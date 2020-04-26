window.onload = () => {
  console.log('Hello');
  // Initial State
  const num = 9;
  let turn = 1;

  let gameOver = false;
  const human = 'X';
  const ai = 'O';
  let result = {};
  const winner = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontal winner
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // vertical winner
    [0, 4, 8], [2, 4, 6] // diagonal winner
  ];


  const filled = []; // to track the whether boxes are filled or empty
  const symbol = []; // to track which box has which symbol(`X` or `O`)

  for (let i = 0; i < 9; i += 1) {
    filled[i] = false;
    symbol[i] = '';
  }

  const newGame = document.getElementById('new-game');
  newGame.addEventListener('click', start);

  function start() {
    console.log('Start new Game');
    document.location.reload();
  }

  // add event listener on the tiles
  document.getElementById('tiles').addEventListener('click', (e) => {
    tileClick(e.target.id);
  });

  function tileClick(tileId) {
    // get the tile
    const tile = document.getElementById(tileId);
    // extract the tile number
    const tileNumber = Number(String(tileId).split('-')[1]);

    ctx = tile.getContext("2d");
    if (filled[tileNumber]) {
      alert('Please click on other tile');
    }


    if (gameOver) {
      alert('Game Over! Please click on `New Game` button');
      return;
    }

    if (turn % 2 !== 0) {
      drawX(tile, ctx, tileNumber);
      turn += 1;
      filled[tileNumber] = true;

      if (winnerCheck(symbol, symbol[tileNumber]) === true) {
        document.getElementById('result').innerHTML = `Player ${symbol[tileNumber]} won!`;
        gameOver = true;
      }

      if (turn > 9 && gameOver !== true) {
        return document.getElementById('result').innerHTML = `It's a DRAW!`;
      }

      if (turn % 2 === 0) {
        playAI();
      }
    }
  }

  function drawX(tile, ctx, num) {
    tile.style.backgroundColor = 'skyblue';
    ctx.beginPath();

    ctx.moveTo(30, 30);
    ctx.lineTo(250, 100);

    ctx.moveTo(30, 100);
    ctx.lineTo(250, 30);

    ctx.lineCap = 'round';
    ctx.lineWidth = 30;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();

    symbol[num] = human;
  }

  function drawO(tile, ctx, next) {
    tile.style.backgroundColor = 'orange';
    ctx.beginPath();
    ctx.arc(120, 80, 40, 0, 2 * Math.PI);
    ctx.lineWidth = 25;
    ctx.strokeStyle = 'white';
    ctx.stroke();
    ctx.closePath();

    symbol[next] = ai;
  }

  // Winner check
  function winnerCheck(sym, player) {
    for (let i = 0; i < winner.length; i += 1) {
      if (
        (sym[winner[i][0]] === player)
        && (sym[winner[i][1]] === player)
        && (sym[winner[i][2]] === player)
      ) {
        return true;
      }
    }
    return false;
  }

  function emptyBoxes(newSymbol) {
    let j = 0;
    const empty = [];
    for (let i = 0; i < newSymbol.length; i += 1) {
      if (newSymbol[i] !== 'X' && newSymbol[i] !== 'O') {
        empty[j] = i;
        j += 1;
      }
    }
    return empty;
  }

  function playAI() {
    const nextMove = miniMax(symbol, ai); //object that stores id of next move and score of the box for next move
    const nextId = `canvas-${nextMove.id}`;
    const tile = document.getElementById(nextId);
    const ctx = tile.getContext("2d");

    if (gameOver) {
      alert("Game is over. Please click the New Game button to start again");
      return;
    }

    if (turn % 2 === 0) { //if turn is even
      drawO(tile, ctx, nextMove.id);
      turn += 1;
      filled[nextMove.id] = true;

      //winner check - ai wins
      if (winnerCheck(symbol, symbol[nextMove.id]) === true) {
        document.getElementById('result').innerText = `Player '${symbol[nextMove.id]}' won!`;
        gameOver = true;
      }

      //draw condition
      if (turn > 9 && gameOver !== true) {
        document.getElementById('result').innerText = "GAME OVER! IT WAS A DRAW!";
      }
    }
  }

  function miniMax(newSymbol, player) {
    let empty = [];
    empty = emptyBoxes(newSymbol); //[]

    if (winnerCheck(newSymbol, human)) {
      return { score: -10 }; //human wins
    }
    else if (winnerCheck(newSymbol, ai)) {
      return { score: 10 }; //AI wins
    }
    else if (empty.length === 0) {
      if (winnerCheck(newSymbol, human)) {
        return { score: -10 };
      }
      else if (winnerCheck(newSymbol, ai)) {
        return { score: 10 };
      }
      return { score: 0 }; //game is draw
    }

    //if its not a terminal state
    //possible moves- their indices and score values
    var posMoves = [];
    //[4] - Example
    for (let i = 0; i < empty.length; i += 1) {
      //current move - index of current move,score
      const curMove = {};
      //generate the new board with the current move
      curMove.id = empty[i]; //4
      newSymbol[empty[i]] = player; //AI

      if (player === ai) {
        result = miniMax(newSymbol, human); //index and score
        curMove.score = result.score; //10
      }
      else {
        result = miniMax(newSymbol, ai);
        curMove.score = result.score; //-10
      }
      newSymbol[empty[i]] = '';
      posMoves.push(curMove); //[{id: 1, score: -10}]

    }

    //Calculate score of intermediate states - best move + score with respect to that player + return statement 
    let bestMove;
    //AI - max player (always) -> choose maximum value, human - min player -> choose minimum value

    if (player === ai) {
      //posMoves = [{id:4,score:10},{id:6,score:10},{id:1,score:-10}]
      let highestScore = -1000;
      for (let j = 0; j < posMoves.length; j += 1) {
        if (posMoves[j].score > highestScore) {
          highestScore = posMoves[j].score;
          bestMove = j; //0
        }
      }
    }
    //posMoves = [{id:4,score:-10},{id:6, score:10}]
    else {
      let lowestScore = 1000;
      for (let j = 0; j < posMoves.length; j += 1) {
        if (posMoves[j].score < lowestScore) {
          lowestScore = posMoves[j].score;
          bestMove = j;
        }
      }
    }
    return posMoves[bestMove];
    //posMoves[0] = {id:4,score:10}
  }

};
