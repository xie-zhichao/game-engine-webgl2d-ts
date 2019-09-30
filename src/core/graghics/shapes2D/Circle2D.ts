import { IShape2D } from "./IShape2D";
import { Vector2 } from "../../math/vector2";
import { Rectangle2D } from "./Rectangle2D";

export class Circle2D implements IShape2D {
  public position = Vector2.zero;
  public origin = Vector2.zero;
  public radius = 0;

  public get offset(): Vector2 {
    return new Vector2(this.radius + this.radius * this.origin.x, this.radius + this.radius * this.origin.y);
  }

  public setFromJson(json: any) {
    if (json.position !== undefined) {
      this.position.setFromJson(json.position);
    }

    if (json.origin !== undefined) {
      this.origin.setFromJson(json.position);
    }

    if (json.radius === undefined) {
      throw new Error('Circle2D requires radius.');
    }
    this.radius = Number(json.radius);
  }

  public intersects(other: IShape2D): boolean {
    if (other instanceof Circle2D) {
      const distance = Math.abs(Vector2.distance(other.position, this.position));
      return distance <= this.radius + other.radius;
    }

    if (other instanceof Rectangle2D) {
      const deltaX = this.position.x - Math.max(other.position.x, Math.min(this.position.x, other.position.x + other.width));
      const deltaY = this.position.y - Math.max(other.position.y, Math.min(this.position.y, other.position.y + other.height));
      return deltaX * deltaX + deltaY * deltaY < this.radius * this.radius;
    }

    return false;
  }

  public pointInShape(point: Vector2): boolean {
    const absDistance = Math.abs(Vector2.distance(this.position, point));
    return absDistance <= this.radius;
  }
}
