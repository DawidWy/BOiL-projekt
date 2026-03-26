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
  conns.data[b][a] = true;
}
function unlink(a,b) {
  conns.data[a][b] = false
  conns.data[a][b] = false
}
let nodes = []
let conns = new connMatrix();
//Debug poniżej
const node = new cpmNode(10);

addNode(node);
addNode(node);

link(0,1)

console.log(node);
console.log(conns);
