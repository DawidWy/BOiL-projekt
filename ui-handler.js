// Tablica tymczasowa przechowująca dane zadań przed wysłaniem do obliczeń
let stagingArea = [];
// Przechowuje indeks aktualnie edytowanego zadania (null oznacza tryb dodawania)
let editIndex = null; 

function addTaskToTable() {
    // Pobranie referencji do pól wejściowych
    const nameInput = document.getElementById('task-name');
    const timeInput = document.getElementById('task-time');
    const prevInput = document.getElementById('task-prev');

    // Normalizacja i czyszczenie danych z białych znaków
    const name = nameInput.value.trim().toUpperCase();
    const time = parseInt(timeInput.value);
    // Jeśli pole poprzedników jest puste, ustawiamy domyślnie myślnik "-"
    const prev = prevInput.value.trim().toUpperCase() || "-";

    // Sprawdzenie, czy nazwa jest podana i czas jest liczbą
    if (!name || isNaN(time)) {
        alert("Wypełnij poprawnie nazwę i czas!");
        return;
    }

    // Sprawdzenie duplikatów
    const duplicate = stagingArea.find((t, index) => t.name === name && index !== editIndex);
    if (duplicate) {
        alert("Czynność o tej nazwie już istnieje na liście!");
        return;
    }
    // Zapisanie zadania do tablicy roboczej
    if (editIndex !== null) {
        stagingArea[editIndex] = { name, time, prev };
        editIndex = null;
        document.querySelector('.btn-add').innerText = "Dodaj do listy";
        document.querySelector('.btn-add').style.background = "#4dabff";
    } else {
        // Dodawanie nowego zadania
        stagingArea.push({ name, time, prev });
    }

    resetInputs();
    updateWorkTableUI();
}
// Edycja wybranego wiersza
function editTask(index) {
    const task = stagingArea[index];

    //Załadowanie pól do formularza
    document.getElementById('task-name').value = task.name;
    document.getElementById('task-time').value = task.time;
    document.getElementById('task-prev').value = task.prev;

    editIndex = index;
    
    // Zmiana przycisku na tryb edycji
    const addBtn = document.querySelector('.btn-add');
    addBtn.innerText = "Zapisz zmiany";
    addBtn.style.background = "#f39c12"; 
    
    document.getElementById('input-section').scrollIntoView({ behavior: 'smooth' });
}

function removeTaskFromTable(index) {
    stagingArea.splice(index, 1);
    if (editIndex === index) {
        editIndex = null;
        resetInputs();
        document.querySelector('.btn-add').innerText = "Dodaj do listy";
        document.querySelector('.btn-add').style.background = "#4dabff";
    }
    updateWorkTableUI();
}

// Generuje i wstrzykuje do HTML kod tabeli roboczej
function updateWorkTableUI() {
    const tbody = document.getElementById('work-table-body');
    tbody.innerHTML = "";

    stagingArea.forEach((task, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td style="border: 1px solid #ddd; padding: 8px; text-align:center; font-weight: bold; color: #666; background: #fafafa;">Zadanie ${index}</td>
            
            <td style="border: 1px solid #ddd; padding: 8px; text-align:center">${task.name}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align:center">${task.prev}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align:center">${task.time}</td>
            <td style="border: 1px solid #ddd; padding: 8px; text-align:center">
                <button onclick="editTask(${index})" style="background:#f39c12; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer; margin-right:5px">Edytuj</button>
                <button onclick="removeTaskFromTable(${index})" style="background:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:3px; cursor:pointer">Usuń</button>
            </td>
        `;
    });
}

// Przekazuje dane z listy roboczej do silnika grafu (graph.js)
function calculateProject() {
    // Zabezpieczenie przed przesyłaniem pustej listy
    if (stagingArea.length === 0) {
        alert("Najpierw dodaj czynności do listy!");
        return;
    }

    // Reset starych struktur z graph.js przed nowymi obliczeniami
    nodes = [];
    if (typeof connMatrix === "function") {
        conns = new connMatrix();
    }
    let nameToIndex = {};

    // Tworzenie węzłów
    stagingArea.forEach((task, i) => {
        addNode(new cpmNode(task.time));
        nameToIndex[task.name] = i;
    });

    // Tworzenie połączeń
    stagingArea.forEach((task, i) => {
        if (task.prev !== "-" && task.prev !== "") {
            const preds = task.prev.split(',').map(p => p.trim());
            preds.forEach(pName => {
                if (nameToIndex.hasOwnProperty(pName)) {
                    link(nameToIndex[pName], i);
                }
            });
        }
    });

    // Renderowanie
    renderVisuals();
}

// Czyści pola formularza po dodaniu zadania lub przy resecie
function resetInputs() {
    const nameInput = document.getElementById('task-name');
    const timeInput = document.getElementById('task-time');
    const prevInput = document.getElementById('task-prev');
    
    if(nameInput) nameInput.value = "";
    if(timeInput) timeInput.value = "1";
    if(prevInput) prevInput.value = "";
}

// czyszczenie wszystkich danych i wyników
function hardReset(force = false) {
    if (!force) {
        const userConfirmed = confirm("Czy na pewno chcesz zresetować cały projekt?\n\nUsunięta zostanie lista zadań, graf oraz wykres Gantta.");
        if (!userConfirmed) return;
    }

    //Czyszczenie pamięci (rejestrów)
    stagingArea = [];
    editIndex = null;
    nodes = [];
    if (typeof connMatrix === "function") {
        conns = new connMatrix();
    }

    resetInputs();
    updateWorkTableUI();

    // Sztywne czyszczenie diva od Cytoscape
    const cyContainer = document.getElementById('cy');
    if (cyContainer) {
        const newCy = cyContainer.cloneNode(false);
        cyContainer.parentNode.replaceChild(newCy, cyContainer);
    }

    // Czyszczenie reszty tekstów i wykresów
    const ganttArea = document.getElementById('gantt-chart-content');
    if (ganttArea) ganttArea.innerHTML = '';

    const pathArea = document.getElementById('critical-path-text');
    if (pathArea) pathArea.innerHTML = '';
    
    // Przywrócenie przycisku dodawania do stanu początkowego
    const addBtn = document.querySelector('.btn-add');
    if (addBtn) {
        addBtn.innerText = "Dodaj do listy";
        addBtn.style.background = "#4dabff";
    }

    console.log("System CPM: Projekt zresetowany.");
}

// Wywołanie automatyczne przy starcie
document.addEventListener('DOMContentLoaded', () => {
    hardReset(true);
});

// Zmiana trybu Gantta
function redrawGantt() {
    if (nodes && nodes.length > 0 && typeof solveCPM === "function") {
        const criticalPath = solveCPM();
        renderGanttChart(criticalPath);
    }
}

// Pokazuje/ukrywa wybór daty i ustawia dzisiejszą datę jako domyślną
function toggleDateInput() {
    const axisMode = document.getElementById('gantt-axis-mode').value;
    const dateContainer = document.getElementById('start-date-container');
    const dateInput = document.getElementById('gantt-start-date');

    if (axisMode === 'DATES') {
        dateContainer.style.display = 'block';
        // Jeśli pole jest puste, ustaw dzisiejszą datę jako startową
        if (!dateInput.value) {
            dateInput.valueAsDate = new Date();
        }
    } else {
        dateContainer.style.display = 'none';
    }
}