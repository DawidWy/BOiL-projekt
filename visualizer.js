/* Funkcja pomocnicza. generuje strukturę HTML dla "okienka" CPM.
Buduje tabelkę 3x3 z polami: ES, T, EF (góra), Nazwa (środek), LS, r, LF (dół).*/
function createNodeHtml(nodeTitle, nodeData, isCritical, isLegend = false) {
    const color = isCritical ? '#ff4d4d' : '#666';
    const containerWidth = isLegend ? '100%' : '150px';

    return `
        <div class="cpm-node-container" style="border: 2px solid ${color}; background: #fff; font-family: sans-serif; width: ${containerWidth}; text-align: center; border-collapse: collapse; box-shadow: 2px 2px 5px rgba(0,0,0,0.1);">
            <div style="display: flex; border-bottom: 1px solid #ccc;">
                <div style="flex: 1; padding: 4px; border-right: 1px solid #ccc;" title="Earliest Start (Najwcześniejszy Start)">${nodeData.es}</div>
                <div style="flex: 1; padding: 4px; border-right: 1px solid #ccc; font-weight: bold;" title="Time (Czas trwania)">${nodeData.t}</div>
                <div style="flex: 1; padding: 4px;" title="Earliest Finish (Najwcześniejszy Koniec)">${nodeData.ef}</div>
            </div>
            
            <div style="padding: 8px; background: #f0f0f0; border-bottom: 1px solid #ccc; font-weight: bold; font-size: 1.1em; color: #333;" title="${nodeTitle}">
                ${nodeTitle}
            </div>
            
            <div style="display: flex;">
                <div style="flex: 1; padding: 4px; border-right: 1px solid #ccc;" title="Latest Start (Najpóźniejszy Start)">${nodeData.ls}</div>
                <div style="flex: 1; padding: 4px; border-right: 1px solid #ccc; color: ${color}; font-weight: bold;" title="Reserve (Rezerwa czasu)">${nodeData.r}</div>
                <div style="flex: 1; padding: 4px;" title="Latest Finish (Najpóźniejszy Koniec)">${nodeData.lf}</div>
            </div>
        </div>
    `;
}

// Renderowanie legendy pod grafem
function renderGraphLegend() {
    const legendContent = document.getElementById('graph-legend-content');
    if (!legendContent) return;

    const legendData = { es: 'ES', t: 'T', ef: 'EF', ls: 'LS', r: 'r', lf: 'LF' };
    const nodeHtml = createNodeHtml('Nazwa Zadania', legendData, false, true);

    legendContent.innerHTML = `
        <div style="display: flex; gap: 20px; align-items: start; flex-wrap: wrap;">
            <div style="width: 160px;">${nodeHtml}</div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.9em; font-family: sans-serif; line-height: 1.6;">
                <li><strong>ES</strong>: Najwcześniejszy Start | <strong>T</strong>: Czas trwania | <strong>EF</strong>: Najwcześniejszy Koniec</li>
                <li><strong>LS</strong>: Najpóźniejszy Start | <strong>r</strong>: Rezerwa czasu | <strong>LF</strong>: Najpóźniejszy Koniec</li>
                <li style="color: #ff4d4d; font-weight: bold;">Czerwona ramka / linia: Ścieżka krytyczna (r = 0)</li>
                <li style="color: #666; font-style: italic;">Użyj <strong>Ctrl + Scroll</strong>, aby przybliżyć graf.</li>
            </ul>
        </div>
    `;
}

// Renderowanie wykresu Gantta
function renderGanttChart(criticalPath) {
    const ganttContent = document.getElementById('gantt-chart-content');
    if (!ganttContent || !nodes || nodes.length === 0) return;

    // Pobranie ustawień trybu (ASAP/ALAP) oraz Osi (Dni/Daty)
    const modeSelect = document.getElementById('gantt-mode');
    const mode = modeSelect ? modeSelect.value : 'ASAP';
    
    const axisModeSelect = document.getElementById('gantt-axis-mode');
    const axisMode = axisModeSelect ? axisModeSelect.value : 'DAYS';
    
    const dateInput = document.getElementById('gantt-start-date');
    let startDate = new Date();
    if (dateInput && dateInput.value) {
        startDate = new Date(dateInput.value);
    }

    // Określenie całkowitego czasu trwania projektu
    const maxTime = Math.max(...nodes.map(n => n.ef));
    if (maxTime === 0) return;

    // Funkcja pomocnicza: dodaje X dni do daty startowej i zwraca format DD.MM
    function getFormattedDate(baseDate, daysToAdd) {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + daysToAdd);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        return `${day}.${month}`;
    }

    // Inicjalizacja tabeli HTML
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    table.style.fontFamily = 'sans-serif';
    table.style.tableLayout = 'fixed'; 

    let headerHtml = `<tr><th style="border: 1px solid #ddd; padding: 10px; width: 120px; background: #f4f4f4;">Zadanie</th>`;
    
    // Generowanie osi czasu (nagłówki)
    for (let t = 0; t < maxTime; t++) {
        let label = axisMode === 'DATES' ? getFormattedDate(startDate, t) : t;
        headerHtml += `
            <th style="border-left: 1px solid #ddd; border-bottom: 1px solid #ddd; padding: 0; position: relative; height: 30px; background: #f4f4f4; min-width: 35px;">
                <span style="position: absolute; left: -12px; top: 8px; font-size: 0.75em; font-weight: normal; color: #666; background: #f4f4f4; padding: 0 2px; z-index: 1;">${label}</span>
            </th>`;
    }
    
    // Ostatni punkt na osi
    let lastLabel = axisMode === 'DATES' ? getFormattedDate(startDate, maxTime) : maxTime;
    headerHtml += `
        <th style="border-left: 1px solid #ddd; border-bottom: 1px solid #ddd; width: 10px; position: relative; background: #f4f4f4;">
            <span style="position: absolute; left: -12px; top: 8px; font-size: 0.75em; font-weight: normal; color: #666; background: #f4f4f4; padding: 0 2px; z-index: 1;">${lastLabel}</span>
        </th></tr>`;
    
    table.innerHTML = headerHtml;

    // Generowanie wierszy z paskami zadań
    nodes.forEach((node, i) => {
        const isCritical = criticalPath.includes(i);
        const row = table.insertRow();

        const cellLabel = row.insertCell(0);
        const taskName = typeof stagingArea !== 'undefined' && stagingArea[i] ? stagingArea[i].name : `Zadanie ${i}`;
        
        cellLabel.innerText = taskName;
        cellLabel.style.border = "1px solid #ddd";
        cellLabel.style.padding = "6px 10px";

        // Wyróżnienie zadań krytycznych
        if (isCritical) {
            cellLabel.style.color = "#ff4d4d";
            cellLabel.style.fontWeight = "bold";
        }

        const start = mode === 'ASAP' ? node.es : node.ls;
        const end = mode === 'ASAP' ? node.ef : node.lf;

        for (let t = 0; t < maxTime; t++) {
            const cellTime = row.insertCell(t + 1);
            cellTime.style.borderLeft = "1px solid #eee"; 
            cellTime.style.borderBottom = "1px solid #eee";
            cellTime.style.position = "relative";
            cellTime.style.height = "32px";

            if (t >= start && t < end) {
                const bar = document.createElement('div');
                bar.style.position = "absolute";
                bar.style.top = "7px";
                bar.style.left = "0";
                bar.style.width = "100%"; 
                bar.style.height = "18px";
                
                if (isCritical) {
                    bar.style.backgroundColor = "#ff4d4d";
                } else {
                    bar.style.backgroundColor = mode === 'ASAP' ? "#4dabff" : "#9b59b6";
                }
                
                // Dostosowanie dymka podpowiedzi zależnie od trybu
                if (axisMode === 'DATES') {
                    bar.title = `${taskName}: [${getFormattedDate(startDate, start)} - ${getFormattedDate(startDate, end)}] (${mode})`;
                } else {
                    bar.title = `${taskName}: [Dzień ${start} - Dzień ${end}] (${mode})`;
                }
                
                cellTime.appendChild(bar);
            }
        }
        const lastCell = row.insertCell(-1);
        lastCell.style.borderLeft = "1px solid #eee";
    });

    // Oczyszczenie starego wykresu i wstawienie nowo wygenerowanej tabeli
    ganttContent.innerHTML = '';
    ganttContent.appendChild(table);
}

// Główna funkcja wizualizacji
function renderVisuals() {
    // Pobieranie wyniku obliczeń
    const criticalPath = solveCPM(); 
    renderGraphLegend();

    // Przygotowanie danych
    const cyElements = { nodes: [], edges: [] };

    nodes.forEach((nodeData, i) => {
        cyElements.nodes.push({
            data: { id: i.toString(), cpmData: nodeData, isCritical: criticalPath.includes(i) }
        });
    });

    for (let i = 0; i < conns.size; i++) {
        for (let j = 0; j < conns.size; j++) {
            if (conns.data[i][j]) {
                const isCriticalEdge = criticalPath.includes(i) && criticalPath.includes(j) && (nodes[j].es === nodes[i].ef);
                cyElements.edges.push({
                    data: { source: i.toString(), target: j.toString(), isCritical: isCriticalEdge }
                });
            }
        }
    }

    // Konfiguracja i uruchomienie silnika graficznego
    const cy = cytoscape({
        container: document.getElementById('cy'),
        elements: cyElements,
        userZoomingEnabled: false, // Blokada zoomowania samym scrollowaniem
        style: [
            { selector: 'edge', style: { 'width': 3, 'line-color': '#ccc', 'target-arrow-color': '#ccc', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier' } },
            { selector: 'edge[?isCritical]', style: { 'line-color': '#ff4d4d', 'target-arrow-color': '#ff4d4d' } }
        ],
        layout: { name: 'breadthfirst', directed: true, padding: 30 }
    });

    cy.nodeHtmlLabel([{
        query: 'node', halign: 'center', valign: 'center', halignBox: 'center', valignBox: 'center',
        tpl: function(data) {
            let rawName = (typeof stagingArea !== 'undefined' && stagingArea[data.id]) 
                ? stagingArea[data.id].name 
                : `Zadanie ${data.id}`;

            const MAX_LENGTH = 12;
            let displayName = rawName.length > MAX_LENGTH 
                ? rawName.substring(0, MAX_LENGTH - 3) + '...' 
                : rawName;

            return createNodeHtml(displayName, data.cpmData, data.isCritical);
        }
    }]);

    // Obsługa ZOOM tylko z klawiszem CTRL
    const cyContainer = document.getElementById('cy');
    cyContainer.addEventListener('wheel', function(e) {
        if (e.ctrlKey) {
            e.preventDefault();
            const zoomSpeed = 0.15;
            const factor = e.deltaY > 0 ? (1 / (1 + zoomSpeed)) : (1 + zoomSpeed);
            cy.zoom({
                level: cy.zoom() * factor,
                renderedPosition: { x: e.offsetX, y: e.offsetY }
            });
        }
    }, { passive: false });

    // Wyświetlenie tekstowo ścieżki krytycznej
    const pathContainer = document.getElementById('critical-path-text');
    if (pathContainer) {
        const criticalPathNames = criticalPath.map(index => {
            return (typeof stagingArea !== 'undefined' && stagingArea[index]) 
                ? stagingArea[index].name 
                : `Zadanie ${index}`;
        });
        
        pathContainer.innerHTML = `<h3>Ścieżka krytyczna: <span style="color: red;">${criticalPathNames.join(' → ')}</span></h3>`;
    }

    renderGanttChart(criticalPath);
    cy.fit(); // Dopasowanie grafu do okna na starcie
}

// Start wizualizacji
document.addEventListener('DOMContentLoaded', renderVisuals);