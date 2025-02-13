const initialGameState = {
    originX: 0,
    originY: 0,
    algorithm: "bfs",
    currentScore: 0,
};

const gameProperties = {
    rowCount: 50,
    columnCount: 50,
    obstacleCount: 1200,
    initialCellColor: "white",
    exploredCellColor: "#5F9EA0",
    obstacleCellColor: "grey",
    heightestScore: 0,
};

let currentGameState = {
    ...initialGameState,
};

function renderTable() {
    let table = document.getElementById("table");

    for (let i = 0; i < gameProperties.rowCount; i++) {
        let tr = document.createElement("tr");
        for (let j = 0; j < gameProperties.columnCount; j++) {
            let td = document.createElement("td");
            td.setAttribute("id", `${i}-${j}`);
            td.setAttribute("class", `cell`);
            td.setAttribute("title", `${i + 1}/${j + 1}`);
            td.setAttribute("data-state", "empty");
            td.style.backgroundColor = gameProperties.initialCellColor;
            td.onclick = (event) => {
                if (td.style.backgroundColor !== gameProperties.obstacleCellColor) {
                    let [row, col] = event.target.getAttribute("title").split("/");
                    document.getElementById("x").value = parseInt(row);
                    document.getElementById("y").value = parseInt(col);
                    currentGameState.originX = parseInt(row) - 1;
                    currentGameState.originY = parseInt(col) - 1;
                }
            };
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    for (let i = 0; i < gameProperties.obstacleCount; i++) {
        let row = Math.floor(Math.random() * gameProperties.rowCount);
        let col = Math.floor(Math.random() * gameProperties.columnCount);
        document.getElementById(`${row}-${col}`).setAttribute("data-state", "obstacle");
        document.getElementById(`${row}-${col}`).style.backgroundColor = gameProperties.obstacleCellColor;
    }
}

function setInitialValues() {
    document.getElementById("x").setAttribute("max", gameProperties.rowCount);
    document.getElementById("y").setAttribute("max", gameProperties.columnCount);
    document.getElementById("highestScore").innerHTML = gameProperties.heightestScore;
    document.getElementById("currentScore").innerHTML = currentGameState.currentScore;
}

function normalizeGameState() {
    const { originX, originY, algorithm, currentScore } = currentGameState;
    document.getElementById("x").value = originX;
    document.getElementById("y").value = originY;
    document.getElementById("algorithm").value = algorithm;
    document.getElementById("currentScore").innerHTML = currentScore;
}

function createEventListeners() {
    document.getElementById("algorithm").addEventListener("change", (event) => {
        currentGameState.algorithm = event.target.value;
    });
    document.getElementById("x").addEventListener("change", (event) => {
        event.target.value = Math.max(event.target.value, 1);
        event.target.value = Math.min(event.target.value, gameProperties.rowCount);
        currentGameState.originX = event.target.value - 1;
    });
    document.getElementById("y").addEventListener("change", (event) => {
        event.target.value = Math.max(event.target.value, 0);
        event.target.value = Math.min(event.target.value, gameProperties.rowCount);
        currentGameState.originY = event.target.value - 1;
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
            cell.setAttribute("data-state", "flooded");
            cell.style.backgroundColor = color;
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

        if (currentCell.getAttribute("data-state") === "empty") {
            await fillCellWithDelay(currentRow, currentCol, exploredCellColor);

            if (currentRow - 1 >= 0) {
                queue.push([currentRow - 1, currentCol]);
            }
            if (currentRow + 1 < rowCount) {
                queue.push([currentRow + 1, currentCol]);
            }
            if (currentCol - 1 >= 0) {
                queue.push([currentRow, currentCol - 1]);
            }
            if (currentCol + 1 < columnCount) {
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

        if (currentCell.getAttribute("data-state") === "empty") {
            await fillCellWithDelay(currentRow, currentCol, exploredCellColor);

            if (currentRow - 1 >= 0) {
                stack.push([currentRow - 1, currentCol]);
            }
            if (currentRow + 1 < rowCount) {
                stack.push([currentRow + 1, currentCol]);
            }
            if (currentCol - 1 >= 0) {
                stack.push([currentRow, currentCol - 1]);
            }
            if (currentCol + 1 < columnCount) {
                stack.push([currentRow, currentCol + 1]);
            }
        }
    }
    return;
}

function clearTable() {
    for (let i = 0; i < gameProperties.rowCount; i++) {
        for (let j = 0; j < gameProperties.columnCount; j++) {
            if (document.getElementById(`${i}-${j}`).getAttribute("data-state") === "flooded") {
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
    const { originX, originY, algorithm } = currentGameState;
    currentGameState = {
        ...initialGameState,
    };
    normalizeGameState();
    if (algorithm === "bfs") {
        await floodFillBFS(originX, originY);
    } else {
        await floodFillDFS(originX, originY);
    }
    document.getElementById("currentScore").innerHTML = currentGameState.currentScore;
    if (currentGameState.currentScore > gameProperties.heightestScore) {
        gameProperties.heightestScore = currentGameState.currentScore;
        document.getElementById("highestScore").innerHTML = currentGameState.currentScore;
    }
}

function reset() {
    clearTable();
    currentGameState = {
        ...initialGameState,
    };
    normalizeGameState();
}

function shuffle() {
    clearTable();
    for (let i = 0; i < gameProperties.rowCount; i++) {
        for (let j = 0; j < gameProperties.columnCount; j++) {
            document.getElementById(`${i}-${j}`).style.backgroundColor = gameProperties.initialCellColor;
        }
    }
    for (let i = 0; i < gameProperties.obstacleCount; i++) {
        let row = Math.floor(Math.random() * gameProperties.rowCount);
        let col = Math.floor(Math.random() * gameProperties.columnCount);
        document.getElementById(`${row}-${col}`).style.backgroundColor = gameProperties.obstacleCellColor;
    }
}

renderTable();
setInitialValues();
createEventListeners();
