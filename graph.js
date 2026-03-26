// Klasa connMatrix to kierunkowa nieważona macierz łączności,
// w skrócie notuje kto z kim się łączy w grafie
class connMatrix {
  constructor(){
    this.data = [];
    this.size = 0;
  }

  extendMatrix() {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i].push(false);
    }
    this.size+=1;
    let newRow = Array(this.size).fill(false);
    this.data.push(newRow);
  }
}

// Klasa cpmNode to jeden węzeł w grafie
class cpmNode {
  constructor(time){
    this.es = null;
    this.t = time;
    this.ef = null;
    this.ls = null;
    this.r = null;
    this.lf = null;
  }
}
// Funkcja addNode dodaje węzeł i poszerza connMatrix
function addNode(node) {
  nodes.push(node);
  conns.extendMatrix();
}

// Funkcja link łączy 2 węzły po ich indeksach
function link(a, b) {
  conns.data[a][b] = true;
}

// Funkcja unlink rozłącza 2 węzły po ich indeksach
function unlink(a,b) {
  conns.data[a][b] = false;
}

// Funkcja getOutgoing zwraca listę węzłów do których dany węzeł się łączy
function getOutgoing(number) {
  let outgoing = [];
  for (let i = 0; i < conns.size; i++) {
    if (conns.data[number][i]) {
      outgoing.push(i);
    }
  }
  return outgoing;
}

// Funkcja getIncoming zwraca listę węzłów które się łączą do danego węzła
function getIncoming(number) {
  let incoming = [];
  for (let i = 0; i < conns.size; i++) {
    if (conns.data[i][number]) {
      incoming.push(i);
    }
  }
  return incoming;
}

// nodes to tablica węzłów, pewnie powinna być zdefiniowana poza biblioteką,
// ale na razie jest zdefiniowana tutaj
let nodes = []

// conns to tablica łączności, taka sama sytuacja jak wyżej
let conns = new connMatrix();

// Przykładowe zastosowanie poniżej
const node = new cpmNode(10);

addNode(node);
addNode(node);
addNode(node);

link(0,1);
link(1,2);
link(0,2);

console.log(getIncoming(0));
console.log(getOutgoing(0));
console.log(conns);
