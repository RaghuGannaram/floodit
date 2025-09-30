const gameProperties = {
    rowCount: 50,
    columnCount: 50,
    obstacleCount: 1500,
    initialCellColor: "#ffffff",
    sourceCellColor: "#287679",
    exploredCellColor: "#5f9ea0",
    obstacleCellColor: "#808080",
};

const initialGameInputs = {
    rowPosition: 1,
    columnPosition: 1,
    algorithm: "bfs",
    selectedCell: `1-1`,
};

const initialGameState = {
    currentScore: 0,
    highestScore: 0,
};

let currentGameInputs = {
    ...initialGameInputs,
};

let currentGameState = {
    ...initialGameState,
};

function renderTable() {
    let table = document.getElementById("table");

    for (let i = 1; i <= gameProperties.rowCount; i++) {
        let tr = document.createElement("tr");
        for (let j = 1; j <= gameProperties.columnCount; j++) {
            let td = document.createElement("td");
            td.setAttribute("id", `${i}-${j}`);
            td.setAttribute("title", `${i}/${j}`);
            td.setAttribute("class", `cell`);
            td.setAttribute("data-state", "empty");
            td.style.backgroundColor = gameProperties.initialCellColor;

            td.onclick = (event) => {
                if (td.style.backgroundColor !== gameProperties.obstacleCellColor) {
                    let [row, col] = event.target.getAttribute("title").split("/");
                    currentGameInputs.rowPosition = parseInt(row);
                    currentGameInputs.columnPosition = parseInt(col);
                    renderSelectedCell();
                    document.getElementById("r").value = parseInt(row);
                    document.getElementById("c").value = parseInt(col);
                } else {
                    alert("Invalid cell! Please select a valid cell.");
                }
            };
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    for (let i = 0; i < gameProperties.obstacleCount; i++) {
        let row = Math.max(1, Math.floor(Math.random() * (gameProperties.rowCount + 1)));
        let col = Math.max(1, Math.floor(Math.random() * (gameProperties.columnCount + 1)));
        document.getElementById(`${row}-${col}`).setAttribute("data-state", "obstacle");
        document.getElementById(`${row}-${col}`).style.backgroundColor = gameProperties.obstacleCellColor;
    }
}

function renderSelectedCell() {
    let previousSelectedCell = document.getElementById(`${currentGameInputs.selectedCell}`);

    if (previousSelectedCell.getAttribute("data-state") === "source") {
        previousSelectedCell.setAttribute("data-state", "empty");
        previousSelectedCell.style.backgroundColor = gameProperties.initialCellColor;
    }

    currentGameInputs.selectedCell = `${currentGameInputs.rowPosition}-${currentGameInputs.columnPosition}`;

    let currentSelectedCell = document.getElementById(`${currentGameInputs.selectedCell}`);
    currentSelectedCell.setAttribute("data-state", "source");
    currentSelectedCell.style.backgroundColor = gameProperties.sourceCellColor;
}

function initializeGameInputs() {
    document.getElementById("r").setAttribute("max", gameProperties.rowCount);
    document.getElementById("c").setAttribute("max", gameProperties.columnCount);
    document.getElementById("r").value = currentGameInputs.rowPosition;
    document.getElementById("c").value = currentGameInputs.columnPosition;
    document.getElementById("algorithm").value = currentGameInputs.algorithm;
}

function initializeGameState() {
    document.getElementById("currentScore").innerHTML = currentGameState.currentScore;
    document.getElementById("highestScore").innerHTML = currentGameState.highestScore;
}

function setInitialValues() {
    initializeGameInputs();
    initializeGameState();
}

function createEventListeners() {
    document.getElementById("algorithm").addEventListener("change", (event) => {
        currentGameInputs.algorithm = event.target.value;
    });
    document.getElementById("r").addEventListener("change", (event) => {
        event.target.value = Math.max(1, event.target.value);
        event.target.value = Math.min(event.target.value, gameProperties.rowCount);
        currentGameInputs.rowPosition = event.target.value;
        renderSelectedCell();
    });
    document.getElementById("c").addEventListener("change", (event) => {
        event.target.value = Math.max(1, event.target.value);
        event.target.value = Math.min(event.target.value, gameProperties.columnCount);
        currentGameInputs.columnPosition = event.target.value;
        renderSelectedCell();
    });

    document.getElementById("startBtn").addEventListener("click", play);
    document.getElementById("resetBtn").addEventListener("click", reset);
    document.getElementById("shuffleBtn").addEventListener("click", shuffle);
}

async function fillCellWithDelay(row, col, color) {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            const cell = document.getElementById(`${row}-${col}`);
            cell.classList.add("flooded");
            if (!["source", "source-flooded"].includes(cell.getAttribute("data-state"))) {
                cell.setAttribute("data-state", "flooded");
                cell.style.backgroundColor = color;
            } else {
                cell.setAttribute("data-state", "source-flooded");
                cell.style.backgroundColor = gameProperties.sourceCellColor;
            }
            cell.style.transition = "background-color 0.2s ease-out";
            cell.style.border = "none";
            currentGameState.currentScore++;
            resolve();
        });
    });
}

async function floodFillBFS(startRow, startCol) {
    const { rowCount, columnCount, initialCellColor, exploredCellColor } = gameProperties;

    if (initialCellColor === exploredCellColor) return;

    const queue = [];
    queue.push([startRow, startCol]);

    while (queue.length > 0) {
        const [currentRow, currentCol] = queue.shift();
        const currentCell = document.getElementById(`${currentRow}-${currentCol}`);

        if (currentCell.getAttribute("data-state") === "empty" || currentCell.getAttribute("data-state") === "source") {
            await fillCellWithDelay(currentRow, currentCol, exploredCellColor);

            if (currentRow - 1 > 0) {
                queue.push([currentRow - 1, currentCol]);
            }
            if (currentRow + 1 <= rowCount) {
                queue.push([currentRow + 1, currentCol]);
            }
            if (currentCol - 1 > 0) {
                queue.push([currentRow, currentCol - 1]);
            }
            if (currentCol + 1 <= columnCount) {
                queue.push([currentRow, currentCol + 1]);
            }
        }
    }
    return;
}

async function floodFillDFS(startRow, startCol) {
    const { rowCount, columnCount, initialCellColor, exploredCellColor } = gameProperties;

    if (initialCellColor === exploredCellColor) return;

    const stack = [];
    stack.push([startRow, startCol]);

    while (stack.length > 0) {
        const [currentRow, currentCol] = stack.pop();
        const currentCell = document.getElementById(`${currentRow}-${currentCol}`);

        if (currentCell.getAttribute("data-state") === "empty" || currentCell.getAttribute("data-state") === "source") {
            await fillCellWithDelay(currentRow, currentCol, exploredCellColor);

            if (currentRow - 1 > 0) {
                stack.push([currentRow - 1, currentCol]);
            }
            if (currentRow + 1 <= rowCount) {
                stack.push([currentRow + 1, currentCol]);
            }
            if (currentCol - 1 > 0) {
                stack.push([currentRow, currentCol - 1]);
            }
            if (currentCol + 1 <= columnCount) {
                stack.push([currentRow, currentCol + 1]);
            }
        }
    }
    return;
}

function clearTable() {
    for (let i = 1; i <= gameProperties.rowCount; i++) {
        for (let j = 1; j <= gameProperties.columnCount; j++) {
            if (document.getElementById(`${i}-${j}`).getAttribute("data-state") === "flooded" || document.getElementById(`${i}-${j}`).getAttribute("data-state") === "source-flooded") {
                document.getElementById(`${i}-${j}`).setAttribute("data-state", "empty");
                document.getElementById(`${i}-${j}`).style.backgroundColor = gameProperties.initialCellColor;
                document.getElementById(`${i}-${j}`).style.border = "1px solid black";
                document.getElementById(`${i}-${j}`).style.transition = "none";
            }
        }
    }
}

async function play() {
    clearTable();
    const { rowPosition, columnPosition, algorithm } = currentGameInputs;

    let selectedCell = document.getElementById(`${rowPosition}-${columnPosition}`);
    if (selectedCell.getAttribute("data-state") === "obstacle") {
        alert("Invalid cell! Please select a valid cell.");
        return;
    }

    currentGameState.currentScore = 0;
    document.getElementById("currentScore").innerHTML = currentGameState.currentScore;

    if (algorithm === "bfs") {
        await floodFillBFS(rowPosition, columnPosition);
    } else {
        await floodFillDFS(rowPosition, columnPosition);
    }

    document.getElementById("currentScore").innerHTML = currentGameState.currentScore;

    if (currentGameState.currentScore > currentGameState.highestScore) {
        currentGameState.highestScore = currentGameState.currentScore;
        document.getElementById("highestScore").innerHTML = currentGameState.highestScore;
    }
}

function reset() {
    clearTable();
    currentGameInputs = {
        ...initialGameInputs,
    };
    currentGameState = {
        ...initialGameState,
    };
    setInitialValues();
}

function shuffle() {
    clearTable();
    currentGameInputs = {
        ...initialGameInputs,
    };
    currentGameState = {
        ...initialGameState,
    };
    setInitialValues();

    for (let i = 1; i <= gameProperties.rowCount; i++) {
        for (let j = 1; j <= gameProperties.columnCount; j++) {
            let cell = document.getElementById(`${i}-${j}`);
            cell.setAttribute("data-state", "empty");
            cell.style.backgroundColor = gameProperties.initialCellColor;
        }
    }

    for (let i = 0; i < gameProperties.obstacleCount; i++) {
        let row = Math.max(1, Math.floor(Math.random() * (gameProperties.rowCount + 1)));
        let col = Math.max(1, Math.floor(Math.random() * (gameProperties.columnCount + 1)));
        document.getElementById(`${row}-${col}`).setAttribute("data-state", "obstacle");
        document.getElementById(`${row}-${col}`).style.backgroundColor = gameProperties.obstacleCellColor;
    }
}

renderTable();
setInitialValues();
createEventListeners();
