import { CollisionComponent } from "../components/CollisionComponent";

export class CollisionData {
  public a: CollisionComponent;
  public b: CollisionComponent;
  public time: number;

  public constructor(time: number, a: CollisionComponent, b: CollisionComponent) {
    this.time = time;
    this.a = a;
    this.b = b;
  }
}

export class CollisionManager {
  private static _totalTime = 0;
  private static _components: CollisionComponent[] = [];

  private static _collisionData: CollisionData[] = [];

  private constructor() { }

  public static registerCollisionComponent(component: CollisionComponent) {
    CollisionManager._components.push(component);
  }

  public static unRegisterCollisionComponent(component: CollisionComponent) {
    const index = CollisionManager._components.indexOf(component);
    if (index !== -1) {
      CollisionManager._components.splice(index, 1);
    }
  }

  public static clear() {
    CollisionManager._components.length = 0;
  }

  public static update(time: number) {
    CollisionManager._totalTime += time;

    const len = CollisionManager._components.length;
    for (let i = 0; i < len; i++) {
      const c = CollisionManager._components[i];
      for (let j = i + 1; j < len; j++) {
        const o = CollisionManager._components[j];
        if (c.shape.intersects(o.shape)) {
          let exists: boolean = false;
          for (const d of CollisionManager._collisionData) {
            if ((d.a === c && d.b === o) || (d.a === o && d.b === c)) {
              c.onCollisionUpdate(o);
              o.onCollisionUpdate(c);
              d.time = CollisionManager._totalTime;
              exists = true;
              break;
            }
          }

          if (!exists) {
            const col = new CollisionData(CollisionManager._totalTime, c, o);
            c.onCollisionEntry(o);
            o.onCollisionEntry(c);
            this._collisionData.push(col);
          }
        }
      }
    }

    const removeData: CollisionData[] = [];
    for(const d of CollisionManager._collisionData) {
      if (d.time !== CollisionManager._totalTime) {
        removeData.push(d);
      }
    }

    while (removeData.length !== 0) {
      const data = removeData.shift();
      if (data === undefined) continue;
      const index = CollisionManager._collisionData.indexOf(data);
      CollisionManager._collisionData.splice(index, 1);

      data.a.onCollisionExit(data.b);
      data.b.onCollisionExit(data.a);
    }
  }
}