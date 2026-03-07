import RBTNode from "./RBTNode";
import RBTHistory from "./RBTHistory";
import RBTSnapshot from "./RBTSnapshot";

export default class RBTree {
  root: RBTNode | null;

  constructor() {
    this.root = null;
  }

  insert(value: number) : RBTHistory {
    const history = new RBTHistory(this.clone(), `Start inserting ${value}`);

    const newNode = new RBTNode(value);
    this.root = newNode;
    history.log(this, `Inserted ${value} as root`);

    return history;
  }

  clone(): RBTree {
    const newTree = new RBTree();
    newTree.root = this.root?.clone() || null;
    return newTree;
  }

  log(history: RBTSnapshot[], message: string) {
    history.push(new RBTSnapshot(this.clone(), message));
  }
}
