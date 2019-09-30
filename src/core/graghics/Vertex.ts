import { Vector3 } from "../math/vector3";
import { Vector2 } from "../math/vector2";

export class Vertex {
  public position: Vector3 = Vector3.zero;
  public texCoords: Vector2 = Vector2.zero;

  public constructor(x = 0, y = 0, z = 0, tu = 0, tv = 0) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;

    this.texCoords.x = tu;
    this.texCoords.y = tv;
  }

  public toArray(): number[] {
    let array: number[] = [];

    array = array.concat(this.position.toArray());
    array = array.concat(this.texCoords.toArray());

    return array;
  }

  public toFloat32Array(): Float32Array {
    return new Float32Array(this.toArray());
  }
}
