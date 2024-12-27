const seatingGrid = document.querySelector('.seating-grid');
const studentInput = document.getElementById('studentNumber');
const seatInput = document.getElementById('seatNumber');
const confirmButton = document.getElementById('confirmButton');
const displayButton = document.getElementById('displayButton');
const resultDiv = document.getElementById('result');
const resultContent = document.getElementById('resultContent');
const form = document.getElementById('seatForm');

const studentData = {}; // 出席番号と席番号のマッピング
const finalSeats = {}; // 確定した席
let currentStudentNumber = 1; // 現在の出席番号
let isDisplayingNumbers = false; // 表示/非表示の状態

// 初期化
function initialize() {
    studentInput.value = currentStudentNumber;
}

// 座席選択のハンドラ
seatingGrid.addEventListener('mouseover', (event) => {
    if (event.target.classList.contains('seat')) {
        event.target.classList.add('hovered');
    }
});

seatingGrid.addEventListener('mouseout', (event) => {
    if (event.target.classList.contains('seat')) {
        event.target.classList.remove('hovered');
    }
});

seatingGrid.addEventListener('click', (event) => {
    const seatElement = event.target;

    if (!seatElement.classList.contains('seat')) return;

    const seatNumber = parseInt(seatElement.dataset.seat, 10);
    if (finalSeats[seatNumber]) {
        alert(`席番号${seatNumber}は既に確定済みです。`);
        return;
    }

    document.querySelectorAll('.seat').forEach(seat => seat.classList.remove('selected'));
    seatInput.value = seatNumber;
    seatElement.classList.add('selected');
});

// 入力フォームの送信
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const studentNumber = parseInt(studentInput.value, 10);
    const seatNumber = parseInt(seatInput.value, 10);

    if (isNaN(seatNumber)) {
        alert('席番号を選んでください。');
        return;
    }

    studentData[studentNumber] = seatNumber;

    document.querySelectorAll('.seat').forEach(seat => seat.classList.remove('selected'));

    seatInput.value = '';
    currentStudentNumber++;
    studentInput.value = currentStudentNumber <= 39 ? currentStudentNumber : '';
});

// 確定ボタンのクリック
confirmButton.addEventListener('click', () => {
    resolveConflicts();
    displayConfirmedSeats();
    toggleDisplay(false); // 非表示モードに戻す
});

// 表示/非表示ボタンのクリック
displayButton.addEventListener('click', () => {
    isDisplayingNumbers = !isDisplayingNumbers;
    toggleDisplay(isDisplayingNumbers);
    displayButton.textContent = isDisplayingNumbers ? "非表示" : "表示";
});

// 確定した席の表示
function displayConfirmedSeats() {
    resultContent.innerHTML = '';
    Object.entries(finalSeats).forEach(([seat, student]) => {
        resultContent.innerHTML += `<p>席番号${seat}は出席番号${student}で確定</p>`;
    });
    resultDiv.classList.remove('hidden');
}

// 表示/非表示の切り替え
function toggleDisplay(isDisplaying) {
    document.querySelectorAll('.seat').forEach(seat => {
        const seatNumber = parseInt(seat.dataset.seat, 10);
        if (finalSeats[seatNumber]) {
            seat.textContent = isDisplaying ? finalSeats[seatNumber] : seatNumber;
        }
    });
}

// 衝突の解決
function resolveConflicts() {
    const seatCounts = {};

    // 席ごとのカウント
    Object.values(studentData).forEach(seat => {
        seatCounts[seat] = (seatCounts[seat] || 0) + 1;
    });

    // 確定する席と衝突する席を分ける
    Object.entries(studentData).forEach(([student, seat]) => {
        if (seatCounts[seat] === 1) {
            finalSeats[seat] = parseInt(student, 10);
        } else {
            // 衝突解決
            resultContent.innerHTML += `
                <p>席番号${seat}が衝突しています: 出席番号${student}</p>
                <button onclick="manualResolve(${seat})" class="resolve-btn">手動で解決</button>
            `;
        }
    });

    resultDiv.classList.remove('hidden');
}

// 手動で衝突解決
function manualResolve(seat) {
    const conflictingStudents = Object.entries(studentData)
        .filter(([student, s]) => s === seat)
        .map(([student]) => student);

    const selectedStudent = prompt(`席番号${seat}を確定させる出席番号を入力してください (${conflictingStudents.join(', ')}):`);
    if (conflictingStudents.includes(selectedStudent)) {
        finalSeats[seat] = parseInt(selectedStudent, 10);

        // 衝突していた他の出席番号をリセット
        conflictingStudents.forEach(student => {
            if (student !== selectedStudent) {
                delete studentData[student];
            }
        });

        displayConfirmedSeats();
    } else {
        alert('無効な入力です。');
    }
}

// 初期化
initialize();
