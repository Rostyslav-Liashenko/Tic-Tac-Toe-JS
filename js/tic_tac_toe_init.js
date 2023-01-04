const saveKeyTicTacToeField = "stateGame";
const saveKeyOldCountColumn = "sizeField";
const defaultSizeTicTacToeField = 3;
const defaultSizeStepGrid = 10;
const defaultPromptStep = "Player's turn:";
const defaultPromptWin = "Winner:";
const defaultPromptDraw = "Draw :)";

const inputCountColumnGrid = document.querySelector(".tic-tac-toe-resize-field__input");
const resizeController = new NumberInput(inputCountColumnGrid, defaultSizeStepGrid);
const buttonUpSize = document.querySelector(".tic-tac-toe-resize-field__up-size");

buttonUpSize.addEventListener("click", function () {
    resizeController.increase();
});

const buttonDownSize = document.querySelector(".tic-tac-toe-resize-field__down-size");

buttonDownSize.addEventListener("click", function () {
    resizeController.decrease();
});

const buttonChangeCountColumn = document.querySelector(".tic-tac-toe-resize-field__button-apply-change");

buttonChangeCountColumn.addEventListener("click", function () {
    const countColumn = resizeController.getValueControlledInput();
    const oldCountColumn = Number(localStorage.getItem(saveKeyOldCountColumn));

    if (oldCountColumn !== countColumn) {
        changeSizeTicTacToe(countColumn, countColumn);
        Saver.saveObj(saveKeyTicTacToeField, ticTacToeController);
        localStorage.setItem(saveKeyOldCountColumn, String(countColumn));
    }
});

inputCountColumnGrid.addEventListener("input", function () {
    this.value = resizeController.getValidateInput();
});

inputCountColumnGrid.addEventListener('focusout', function () {
    resizeController.validateRange();
});


function initTicTacToeCells(cellsTicTacToe) {
    for (let cellTicTacToe of cellsTicTacToe) {
        cellTicTacToe.addEventListener("click", (pressedButton) => {
            ticTacToeController.gameStep(pressedButton);
            Saver.saveObj(saveKeyTicTacToeField, ticTacToeController);
        });
    }
}

function changeSizeTicTacToe(countColumn, countRow) {
    gridController.changeSizeGrid(countColumn, countRow);
    const allCells = gridController.getCells();
    ticTacToeController.clearField();
    initTicTacToeCells(allCells);
    ticTacToeController.dynamicChangeField(allCells, countColumn, countRow);
}

const gridTicTacToe = document.querySelector(".tic-tac-toe-grid");
const resetButton = document.querySelector(".tic-tac-toe-setting__reset-button");
const labelPlayerName = document.querySelector(".tic-tac-toe-game__player-name");
const labelStatusStep = document.querySelector(".tic-tac-toe-game__status-step");
const countColumnAndRow = resizeController.getValueControlledInput();

const labelGameFirstPlayerScore = document.querySelector(".tic-tac-toe-analytic__game-score-x");
const labelGameSecondPlayerScore = document.querySelector(".tic-tac-toe-analytic__game-score-o");
const labelSessionFirstPlayerScore = document.querySelector(".tic-tac-toe-analytic__session-score-x");
const labelSessionSecondPlayerScore = document.querySelector(".tic-tac-toe-analytic__session-score-o");

const player1 = new Player("Player 1", "X");
const player2 = new Player("Player 2", "O");
const players = [player1, player2];

const scoreGameFirstPlayer = new Score(labelGameFirstPlayerScore, player1);
const scoreSessionFirstPlayer = new Score(labelSessionFirstPlayerScore, player1);
const scoreGameSecondPlayer = new Score(labelGameSecondPlayerScore, player2);
const scoreSessionSecondPlayer = new Score(labelSessionSecondPlayerScore, player2);

const gameScores = [scoreGameFirstPlayer, scoreGameSecondPlayer];
initScore(gameScores, localStorage);

const sessionScores = [scoreSessionFirstPlayer, scoreSessionSecondPlayer];
initScore(sessionScores, sessionStorage);

const scores = [...gameScores, ...sessionScores];

function initScore(scores, storage) {
    assignStorage(scores, storage);
    tryLoadScores(scores, storage);
}

function assignStorage(scores, storage) {
    for (let score of scores) {
        score.setOnUpdateUi(() => {
            const player = score.getPlayer();
            storage.setItem(player.getGameSymbol(), String(score.getLabelScoreValue()));
        });
    }
}

function tryLoadScores(scores, storage) {
    for (let score of scores) {
        const player = score.getPlayer();
        let valueStorage = storage.getItem(player.getGameSymbol());
        if (valueStorage) {
            score.setLabelScoreValue(valueStorage);
        }
    }
}

const gridController = new GridController(gridTicTacToe, countColumnAndRow, countColumnAndRow);
const cellsTicTacToe = gridController.getCells();

initTicTacToeCells(cellsTicTacToe);
const ticTacToeController = new TicTacToeController(cellsTicTacToe, countColumnAndRow,
    countColumnAndRow, players);

const styleController = new StyleController();
const currentPlayerInfo = new InformationLabel(labelPlayerName);
const statusStepInfo = new InformationLabel(labelStatusStep);

const nameWinStyle = "tic-tac-toe__сell_win";
const nameDrawStyle = "tic-tac-toe__cell_draw";

ticTacToeController.setOnLoad(() => {
    if (ticTacToeController.isWin()) {
        styleController.addStyleCells(ticTacToeController.getWinCell(), nameWinStyle);
        ticTacToeController.lockInput();
        currentPlayerInfo.clear();
        statusStepInfo.setInfo(defaultPromptWin + " ");
    }
});

ticTacToeController.setOnUpdateUi(() => {
    const currentPlayer = ticTacToeController.getCurrentPlayer().getName();
    currentPlayerInfo.setInfo(currentPlayer);
});

ticTacToeController.setOnWin((winner, winCells) => {
    scores.forEach(score => {
       if (score.getPlayer() === winner) {
           const oldValue = score.getLabelScoreValue();
           score.setLabelScoreValue(oldValue + 1);
       }
    });
    styleController.addStyleCells(winCells, nameWinStyle);
    statusStepInfo.setInfo(defaultPromptWin + " " + winner.getName());
    currentPlayerInfo.clear();
});

ticTacToeController.setOnReset(allCells => {
    styleController.removeStyleField(allCells, nameWinStyle);
    styleController.removeStyleField(allCells, nameDrawStyle);
    statusStepInfo.setInfo(defaultPromptStep);
});

ticTacToeController.setOnDraw(allCells => {
    styleController.addStyleField(allCells, nameDrawStyle);
    statusStepInfo.setInfo(defaultPromptDraw);
    currentPlayerInfo.clear();
});

resetButton.addEventListener("click", () => {
    ticTacToeController.clearField();
    Saver.saveObj(saveKeyTicTacToeField, ticTacToeController);
});

window.onstorage = () => {
    tryRestoreTicTacToeState();
    tryLoadScores(gameScores, localStorage);
}

tryRestoreTicTacToeState();

function tryRestoreTicTacToeState() {
    const oldSizeField = Number(localStorage.getItem(saveKeyOldCountColumn));
    if (!oldSizeField) {
        localStorage.setItem(saveKeyOldCountColumn, String(defaultSizeTicTacToeField));
    } else if (localStorage.getItem(saveKeyTicTacToeField)) {
        resizeController.setValueControlledInput(oldSizeField);
        changeSizeTicTacToe(oldSizeField, oldSizeField);
        Saver.loadObj(saveKeyTicTacToeField, ticTacToeController);
    }
}