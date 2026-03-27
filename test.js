// Czyszczenie i ustawienie danych
nodes = [];
conns = new connMatrix();

addNode(new cpmNode(0));
addNode(new cpmNode(3));
addNode(new cpmNode(5));
addNode(new cpmNode(2));
addNode(new cpmNode(4));
addNode(new cpmNode(3));
addNode(new cpmNode(2));
addNode(new cpmNode(4));
addNode(new cpmNode(3));
addNode(new cpmNode(2));
addNode(new cpmNode(0));

link(0, 1);
link(0, 2);
link(1, 3);
link(2, 4);
link(2, 5);
link(3, 6); 
link(4, 6);
link(5, 7); 
link(5, 8);
link(6, 8);
link(7, 8);
link(8, 9);
link(9, 10); 

const criticalPath = solveCPM();

console.log("Węzły po obliczeniach:", nodes);
console.log("Indeksy ścieżki krytycznej:", criticalPath);