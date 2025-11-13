window.onload = function () {
    // --- Exercise 1: Randomize the target word ---
    const WORDS = ["table", "chair", "piano", "mouse", "house", "plant", "brain", "cloud", "beach", "fruit"];
    
    let board = document.getElementById('board');
    let guessButton = document.getElementById('guessButton');
    let guessInput = document.getElementById('guessInput');
    let gameContainer = document.getElementById('gameContainer');
    let messageDisplay = document.getElementById('messageDisplay'); // For Exercise 2
    let newGameButton = document.getElementById('newGameButton'); // For Exercise 4
    
    let word;
    let tries;
    let gameOver;
    
    // Function to set up a new game
    function initializeGame() {
        word = WORDS[Math.floor(Math.random() * WORDS.length)];
        tries = 0;
        gameOver = false;
        
        // Clear previous board and messages
        board.innerHTML = '';
        messageDisplay.textContent = '';
        guessInput.value = '';
        guessInput.disabled = false;
        guessButton.disabled = false;
        newGameButton.style.display = 'none'; // Hide "New Game" button
        
        // Re-create the board grid
        for (let i = 0; i < 6; i++) {
            let row = document.createElement('div');
            row.classList.add('row');
            board.append(row);

            for (let j = 0; j < 5; j++) {
                let cell = document.createElement('div');
                cell.classList.add('cell');
                cell.setAttribute('data-row', i);
                cell.setAttribute('data-column', j);
                row.append(cell);
            }
        }
        
        updateStatsDisplay();
        console.log("New word selected:", word); // For testing
    }

    function checkGuess(guess, targetWord) {
        const result = new Array(5).fill('red');
        const targetWordCounts = {};
        
        // 1. Count letters in the target word
        for (const char of targetWord) {
            targetWordCounts[char] = (targetWordCounts[char] || 0) + 1;
        }

        // 2. First Pass: Identify GREEN (Correct position)
        for (let i = 0; i < 5; i++) {
            if (guess[i] === targetWord[i]) {
                result[i] = 'green';
                targetWordCounts[guess[i]]--;
            }
        }

        // 3. Second Pass: Identify YELLOW (Wrong position)
        for (let i = 0; i < 5; i++) {
            // Only check letters that weren't already marked green
            if (result[i] !== 'green') {
                const char = guess[i];
                if (targetWordCounts[char] > 0) {
                    result[i] = 'yellow';
                    targetWordCounts[char]--;
                }
            }
        }
        return result;
    }
    
    function handleGuess() {
        if (gameOver) {
            return;
        }

        let guess = guessInput.value.toLowerCase();
        
        // --- Exercise 2: Input Validation ---
        if (guess.length !== 5) {
            messageDisplay.textContent = 'Guess must be exactly 5 letters!';
            messageDisplay.classList.add('error');
            return;
        }
        messageDisplay.textContent = '';
        messageDisplay.classList.remove('error');

        const feedbackColors = checkGuess(guess, word);
        
        for (let i = 0; i < 5; i++) {
            let currentCell = document.querySelector(
                `[data-row="${tries}"][data-column="${i}"]`
            );
            
            currentCell.classList.remove('flip'); 
            
            let currentLetter = document.createTextNode(guess[i]);
            currentCell.append(currentLetter);
            
            currentCell.classList.add(feedbackColors[i]);
            // --- Exercise 7: Add animation effects (flip) ---
            setTimeout(() => {
                currentCell.classList.add('flip');
            }, i * 100); 
        }

        if (guess === word) {
            messageDisplay.textContent = 'You won!';
            gameOver = true;
            updateStats('win');
        } else if (tries === 5) {
            // --- Exercise 6: Display the correct word on loss ---
            messageDisplay.textContent = `You lost! The word was: ${word.toUpperCase()}`;
            gameOver = true;
            updateStats('loss');
        }

        if (gameOver) {
            guessInput.disabled = true;
            guessButton.disabled = true;
            newGameButton.style.display = 'block'; // Show "New Game" button (Exercise 4)
        } else {
            tries++;
            guessInput.value = '';
        }
    }
    
    // --- Exercise 5: Implement keyboard support (Enter key) ---
    guessInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            handleGuess();
        }
    });

    guessButton.addEventListener('click', handleGuess);

    // --- Exercise 4: New Game Button functionality ---
    newGameButton.addEventListener('click', initializeGame);

    // --- Exercise 10: Game Statistics functions ---
    function getStats() {
        return JSON.parse(localStorage.getItem('wordleStats')) || {
            played: 0,
            won: 0,
            streak: 0,
            maxStreak: 0
        };
    }

    function updateStats(result) {
        let stats = getStats();
        stats.played++;
        
        if (result === 'win') {
            stats.won++;
            stats.streak++;
            if (stats.streak > stats.maxStreak) {
                stats.maxStreak = stats.streak;
            }
        } else if (result === 'loss') {
            stats.streak = 0;
        }
        
        localStorage.setItem('wordleStats', JSON.stringify(stats));
        updateStatsDisplay();
    }
    
    function updateStatsDisplay() {
        let stats = getStats();
        const winPercent = stats.played === 0 ? 0 : Math.round((stats.won / stats.played) * 100);
        
        document.getElementById('statPlayed').textContent = stats.played;
        document.getElementById('statWinPercent').textContent = `${winPercent}%`;
        document.getElementById('statStreak').textContent = stats.streak;
        document.getElementById('statMaxStreak').textContent = stats.maxStreak;
    }

    initializeGame();
};