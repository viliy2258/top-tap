const cells = document.querySelectorAll('.cell');
const messageElement = document.getElementById('message');
const attemptsElement = document.getElementById('attempts');
let currentPlayer = 'O'; // Людина починає гру
let board = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let attemptsLeft = 10;
let turnNumber = 0; // Номер ходу
let isHumanTurn = true; // Додаємо змінну для визначення черги ходу

const winningConditions = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

cells.forEach(cell => {
    cell.addEventListener('click', handleCellClick);
});

function handleCellClick(event) {
    if (attemptsLeft <= 0 || !gameActive || !isHumanTurn) {
        return; // Блокуємо кліки, якщо гра закінчена або не черга гравця
    }

    const clickedCell = event.target;
    const clickedCellIndex = clickedCell.getAttribute('data-index');

    if (board[clickedCellIndex] !== '') {
        return; // Клітинка вже зайнята
    }

    updateCell(clickedCell, clickedCellIndex);
    checkResult();

    if (gameActive) {
        turnNumber++;
        isHumanTurn = false; // Завершуємо хід гравця
        currentPlayer = 'X'; // Перемикаємо гравця на робота
        if (currentPlayer === 'X' && attemptsLeft > 0) {
            setTimeout(robotMove, 500); // Затримка перед ходом робота
        }
    }
}

function updateCell(cell, index) {
    board[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer);
    cell.classList.add('animate'); // Додаємо анімацію
    setTimeout(() => cell.classList.remove('animate'), 500); // Видаляємо анімацію через 500 мс
}

function checkResult() {
    let roundWon = false;
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            roundWon = true;
            break;
        }
    }

    if (roundWon) {
        messageElement.textContent = `Гравець ${currentPlayer} виграв!`;
        gameActive = false;
        setTimeout(resetGame, 2000);
        attemptsLeft--;
        updateAttempts();
        return;
    }

    if (!board.includes('')) {
        messageElement.textContent = 'Нічия!';
        gameActive = false;
        setTimeout(resetGame, 2000);
        attemptsLeft--;
        updateAttempts();
        return;
    }
}

function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    gameActive = true;
    isHumanTurn = true; // Людина завжди починає
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('X', 'O', 'animate');
    });
    messageElement.textContent = '';
    currentPlayer = 'O'; // Перший хід завжди за людиною
}

function updateAttempts() {
    attemptsElement.textContent = `Залишилось спроб: ${attemptsLeft}`;
    if (attemptsLeft <= 0) {
        gameActive = false;
        messageElement.textContent = "Спроби вичерпані. Гра закінчена!";
    }
}

function robotMove() {
    if (!gameActive || attemptsLeft <= 0) return;

    const bestMove = getRandomBestMove();
    const robotCell = document.querySelector(`.cell[data-index='${bestMove}']`);
    updateCell(robotCell, bestMove);
    checkResult();

    if (gameActive) {
        turnNumber++;
        isHumanTurn = true; // Після ходу робота, черга людини
        currentPlayer = 'O';
    }
}

function getRandomBestMove() {
    const bestMoves = minimax(board, 'X');
    const randomIndex = Math.floor(Math.random() * bestMoves.length);
    return bestMoves[randomIndex].index;
}

function minimax(newBoard, player) {
    const availableSpots = newBoard.reduce((acc, val, idx) => val === '' ? acc.concat(idx) : acc, []);

    if (checkWin(newBoard, 'X')) {
        return [{ score: 10 }];
    } else if (checkWin(newBoard, 'O')) {
        return [{ score: -10 }];
    } else if (availableSpots.length === 0) {
        return [{ score: 0 }];
    }

    const moves = [];

    for (let i = 0; i < availableSpots.length; i++) {
        const move = {};
        move.index = availableSpots[i];
        newBoard[availableSpots[i]] = player;

        if (player === 'X') {
            const result = minimax(newBoard, 'O');
            move.score = result[0].score;
        } else {
            const result = minimax(newBoard, 'X');
            move.score = result[0].score;
        }

        newBoard[availableSpots[i]] = '';
        moves.push(move);
    }

    let bestMoves = [];
    let bestScore = player === 'X' ? -Infinity : Infinity;

    for (let i = 0; i < moves.length; i++) {
        if (player === 'X' && moves[i].score > bestScore) {
            bestScore = moves[i].score;
            bestMoves = [moves[i]];
        } else if (player === 'X' && moves[i].score === bestScore) {
            bestMoves.push(moves[i]);
        } else if (player === 'O' && moves[i].score < bestScore) {
            bestScore = moves[i].score;
            bestMoves = [moves[i]];
        } else if (player === 'O' && moves[i].score === bestScore) {
            bestMoves.push(moves[i]);
        }
    }

    // Додаємо випадковий елемент
    if (bestMoves.length > 1) {
        const randomMoves = bestMoves.filter(move => move.score === bestScore);
        return randomMoves;
    }

    return bestMoves;
}

function checkWin(board, player) {
    for (let i = 0; i < winningConditions.length; i++) {
        const [a, b, c] = winningConditions[i];
        if (board[a] === player && board[b] === player && board[c] === player) {
            return true;
        }
    }
    return false;
}



