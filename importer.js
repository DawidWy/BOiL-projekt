function importCsv() {
    const fileInput = document.getElementById('csv-file');
    const file = fileInput.files[0];

    if (!file) {
        alert("Wybierz plik CSV do importu!");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');

        // Sprawdź czy pierwsza linia to nagłówek, jeśli tak, pomiń
        let startIndex = 0;
        if (lines[0] && lines[0].toLowerCase().includes('czynność')) {
            startIndex = 1;
        }

        stagingArea = []; // Wyczyść obecną listę

        for (let i = startIndex; i < lines.length; i++) {
            const parts = lines[i].split(';').map(part => part.trim());
            if (parts.length >= 3) {
                const name = parts[0].toUpperCase();
                const time = parseInt(parts[1]);
                let prev = parts[2] || "-";

                if (!name || isNaN(time)) {
                    alert(`Błąd w linii ${i + 1}: nieprawidłowa nazwa lub czas.`);
                    return;
                }

                // Sprawdź duplikaty
                const duplicate = stagingArea.find(t => t.name === name);
                if (duplicate) {
                    alert(`Błąd: Czynność '${name}' już istnieje w linii ${i + 1}.`);
                    return;
                }

                stagingArea.push({ name, time, prev });
            } else {
                alert(`Błąd w linii ${i + 1}: oczekiwano 3 kolumn oddzielonych średnikiem.`);
                return;
            }
        }

        updateWorkTableUI();
        alert("Dane zaimportowane pomyślnie!");
    };

    reader.onerror = function() {
        alert("Błąd podczas czytania pliku!");
    };

    reader.readAsText(file);
}