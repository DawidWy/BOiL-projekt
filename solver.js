function solveCPM() {
  const n = nodes.length;

  // Sortowanie topologiczne
  let topoOrder = [];
  let inDegree = nodes.map((_, i) => getIncoming(i).length);
  let queue = [];

  inDegree.forEach((deg, i) => {
    if (deg === 0) queue.push(i);
  });

  while (queue.length > 0) {
    let u = queue.shift();
    topoOrder.push(u);
    getOutgoing(u).forEach(v => {
      inDegree[v]--;
      if (inDegree[v] === 0) queue.push(v);
    });
  }

  // Sprawdzenie czy graf nie ma cykli
  if (topoOrder.length !== n) {
    console.error("Graf zawiera cykle! CPM wymaga grafu acyklicznego (DAG).");
    return;
  }

  // Przebieg w przod - wyznaczanie ES i EF
  topoOrder.forEach(i => {
    let incoming = getIncoming(i);
    if (incoming.length === 0) {
      nodes[i].es = 0;
    } else {
      // ES to maksymalny EF spośród wszystkich poprzedników
      nodes[i].es = Math.max(...incoming.map(prevIdx => nodes[prevIdx].ef));
    }
    nodes[i].ef = nodes[i].es + nodes[i].t;
  });

  // Wyznaczanie całkowiitego czasu trwania projektu
  let maxEF = Math.max(...nodes.map(node => node.ef));

  // Przebieg do tyłu - wyznaczenie LF i LS
  [...topoOrder].reverse().forEach(i => {
    let outgoing = getOutgoing(i);
    if (outgoing.length === 0) {
      nodes[i].lf = maxEF;
    } else {
      // LF to minimalny LS spośród wszystkich następców
      nodes[i].lf = Math.min(...outgoing.map(nextIdx => nodes[nextIdx].ls));
    }
    nodes[i].ls = nodes[i].lf - nodes[i].t;
    
    // Obliczanie rezerwy r
    nodes[i].r = nodes[i].lf - nodes[i].ef;
  });

  return getCriticalPath();
}

// Funkcja do wyciągnięcia indeksów ścieżki krytycznej
function getCriticalPath() {
  let criticalNodes = [];
  nodes.forEach((node, index) => {
    if (node.r === 0) {
      criticalNodes.push(index);
    }
  });
  return criticalNodes;
}