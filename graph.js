console.log("Skrypt załadowany");

class conMatrix {
  constructor(){
    this.data = [[false]];
    this.size = 1;
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

const node = new cpmNode(10);
const conns = new conMatrix();
conns.extendMatrix();
console.log(node);
console.log(conns);
