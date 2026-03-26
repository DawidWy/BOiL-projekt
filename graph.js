console.log("Skrypt załadowany");

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
function addNode(node) {
  nodes.push(node);
  conns.extendMatrix();
}
function link(a, b) {
  conns.data[a][b] = true;
}
function unlink(a,b) {
  conns.data[a][b] = false;
}
function getOutgoing(number) {
  let outgoing = [];
  for (let i = 0; i < conns.size; i++) {
    if (conns.data[number][i]) {
      outgoing.push(i);
    }
  }
  return outgoing;
}
function getIncoming(number) {
  let incoming = [];
  for (let i = 0; i < conns.size; i++) {
    if (conns.data[i][number]) {
      incoming.push(i);
    }
  }
  return incoming;
}
let nodes = []
let conns = new connMatrix();
//Debug poniżej
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
