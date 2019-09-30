import { IComponentData } from "./IComponentData";
import { IShape2D } from "../graghics/shapes2D/IShape2D";
import { Rectangle2D } from "../graghics/shapes2D/Rectangle2D";
import { Circle2D } from "../graghics/shapes2D/Circle2D";
import { IComponentBuilder } from "./IComponentBuilder";
import { IComponent } from "./IComponent";
import { BaseComponent } from "./baseComponent";
import { CollisionManager } from "../collision/CollisionManager";
import { Shader } from "../gl/shaders/shader";

export class CollisionComponentData implements IComponentData {
  public name: string | undefined;
  public shape: IShape2D | undefined;

  public setFromJson(json: any) {
    if (json.name !== undefined) {
      this.name = String(json.name);
    }

    if (json.shape === undefined) {
      throw new Error('CollisionComponentData requires "shape".');
    } else {
      if (json.shape.type === undefined) {
        throw new Error('CollisionComponentData requires "shape.type".');
      }

      const shapeType = String(json.shape.type).toLowerCase();
      switch(shapeType) {
        case 'rectangle':
          this.shape = new Rectangle2D();
          break;
        case 'circle':
          this.shape = new Circle2D();
          break;
        default:
          throw new Error(`Unsupported shape type: ${shapeType}.`);
      }

      this.shape.setFromJson(json.shape);
    }
  }
}

export class CollisionComponentBuilder implements IComponentBuilder {
  public get type(): string {
    return 'collision';
  }

  public buildFromJson(_gl: WebGLRenderingContext, json: any): IComponent {
    const data = new CollisionComponentData();
    data.setFromJson(json);
    return new CollisionComponent(data);
  }
}

export class CollisionComponent extends BaseComponent {
  private _shape: IShape2D;

  public constructor(data: CollisionComponentData) {
    super(data);

    if (data.shape === undefined) {
      throw new Error('shape of CollisionComponentData is undefined.');
    }

    this._shape = data.shape;
  }

  public get shape(): IShape2D {
    return this._shape;
  }

  public load() {
    super.load();

    this._shape.position.copyFrom(this.owner!.transform.position.toVector2().add(this._shape.offset));

    CollisionManager.registerCollisionComponent(this);
  }

  public update(time: number) {
    this._shape.position.copyFrom(this.owner!.transform.position.toVector2().add(this._shape.offset));
    super.update(time);
  }

  public render(shader: Shader) {
    super.render(shader);
  }

  public onCollisionEntry(other: CollisionComponent) {
    console.log('onCollisionEntry', this, other);
  }

  public onCollisionUpdate(_other: CollisionComponent) {
    // console.log('onCollisionUpdate', this, _other);
  }

  public onCollisionExit(other: CollisionComponent) {
    console.log('onCollisionExit', this, other);
  }
}
