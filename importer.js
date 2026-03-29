function importCsv() {
    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];

    if (!file) {
        alert("Wybierz plik CSV do importu!");
        return;
    }

    // Pobieranie aktualnie wybranego trybu wprowadzania (PRED lub EVENT)
    const modeSelect = document.getElementById('input-mode-select');
    let currentMode = modeSelect ? modeSelect.value : 'PRED';

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');

        // Sprawdzenie czy pierwsza linia to nagłówek, jeśli tak, pomiń
        let startIndex = 0;
        if (lines[0] && lines[0].toLowerCase().includes('czynność')) {
            startIndex = 1;
        }

        let tempArea = []; 

        for (let i = startIndex; i < lines.length; i++) {
            const parts = lines[i].split(';').map(part => part.trim());
            if (parts.length >= 3) {
                const name = parts[0].toUpperCase();
                const time = parseInt(parts[1]);
                let prev = parts[2] || "-";

                // Walidacja podstawowa
                if (!name || isNaN(time)) {
                    alert(`Błąd w linii ${i + 1}: nieprawidłowa nazwa lub czas.`);
                    return; 
                }

                // Walidacja formatu i automatyczna zmiana
                const isEventFormat = /^\d+-\d+$/.test(prev); 

                // Zabezpieczenie: Jeśli pole to sam myślnik "-", omijamy walidację, 
                // bo brak poprzednika zapisuje się tak samo w obu trybach.
                
                // Jesteśmy w Zdarzeniach, ale w pliku są klasyczni Poprzednicy
                if (currentMode === 'EVENT' && !isEventFormat && prev !== "-") {
                    const switchMode = confirm(`Wykryto niezgodność w linii ${i + 1}: W pliku są klasyczni Poprzednicy ('${prev}'), a wybrany tryb to Następstwo Zdarzeń.\n\nCzy chcesz automatycznie przełączyć tryb na "Poprzednicy" i wgrać plik?`);
                    
                    if (switchMode) {
                        changeModeUI('PRED');   // Zmień interfejs
                        currentMode = 'PRED';   // Zmień logikę
                        tempArea = [];          // Wyczyść dotychczasowy brudnopis
                        i = startIndex - 1;     // Cofnij pętlę na sam początek (restart wczytywania)
                        continue;
                    } else {
                        fileInput.value = ''; 
                        return;
                    }
                }

                // Jesteśmy w Poprzednikach, ale w pliku są Zdarzenia
                if (currentMode === 'PRED' && isEventFormat && prev !== "-") {
                    const switchMode = confirm(`Wykryto niezgodność w linii ${i + 1}: W pliku jest Następstwo Zdarzeń ('${prev}'), a wybrany tryb to klasyczni Poprzednicy.\n\nCzy chcesz automatycznie przełączyć tryb na "Następstwo zdarzeń" i wgrać plik?`);
                    
                    if (switchMode) {
                        changeModeUI('EVENT');  // Zmień interfejs
                        currentMode = 'EVENT';  // Zmień logikę
                        tempArea = [];          // Wyczyść dotychczasowy brudnopis
                        i = startIndex - 1;     // Cofnij pętlę na sam początek (restart wczytywania)
                        continue;
                    } else {
                        fileInput.value = '';
                        return;
                    }
                }

                // Sprawdzenie duplikaty
                const duplicate = tempArea.find(t => t.name === name);
                if (duplicate) {
                    alert(`Błąd: Czynność '${name}' już istnieje w linii ${i + 1}.`);
                    return;
                }

                // Dodaj do tymczasowej listy
                tempArea.push({ name, time, prev });
            } else {
                alert(`Błąd w linii ${i + 1}: oczekiwano 3 kolumn oddzielonych średnikiem.`);
                return;
            }
        }

        // Jeśli wczytywanie się powiodło, aktualizujemy system
        stagingArea = tempArea;
        updateWorkTableUI();
        
        // Czyścimy input po wgraniu, by móc wgrać ten sam plik ponownie, jeśli zaszłaby potrzeba
        fileInput.value = ''; 
        alert("Dane zaimportowane pomyślnie!");
    };

    reader.onerror = function() {
        alert("Błąd podczas czytania pliku!");
    };

    // Uruchomienie odczytu
    reader.readAsText(file);
}

// Zmiana etykiety HTML i wartość Selecta  
function changeModeUI(newMode) {
    const modeSelect = document.getElementById('input-mode-select');
    if (modeSelect) modeSelect.value = newMode;
    
    const label = document.getElementById('label-prev');
    const input = document.getElementById('task-prev');
    const th = document.getElementById('th-prev');
    
    if (newMode === 'EVENT') {
        if(label) label.innerText = "Następstwo zdarzeń";
        if(input) input.placeholder = "np. 1-2";
        if(th) th.innerText = "Następstwo zdarzeń";
    } else {
        if(label) label.innerText = "Poprzednicy";
        if(input) input.placeholder = "-";
        if(th) th.innerText = "Poprzednicy";
    }
}