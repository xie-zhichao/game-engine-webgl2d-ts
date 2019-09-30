import { Scene } from "./Scene";
import { IComponent } from "../components/IComponent";
import { Matrix4x4 } from "../math/matrix4x4";
import { Transform } from "../math/transform";
import { Shader } from "../gl/shaders/shader";
import { Vector3 } from "../math/vector3";
import { IBehavior } from "../behaviors/IBehavior";

export class SimObject {
  private _id: number;
  private _children: SimObject[] = [];
  private _parent: SimObject | undefined;
  private _isLoaded: boolean = false;
  private _scene: Scene | undefined;

  private _components: IComponent[] = [];
  private _behaviors: IBehavior[] = [];

  private _isVisible: boolean = true;

  private _localMatrix: Matrix4x4 = Matrix4x4.identity();
  private _worldMatrix: Matrix4x4 = Matrix4x4.identity();

  public name: string;

  public transform: Transform = new Transform();

  public constructor(id: number, name: string, scene?: Scene) {
    this._id = id;
    this.name = name;
    this._scene = scene;
  }

  public get id(): number {
    return this._id;
  }

  public get parent(): SimObject | undefined {
    return this._parent;
  }

  public get worldMatrix(): Matrix4x4 {
    return this._worldMatrix;
  }

  public get isLoaded(): boolean {
    return this._isLoaded;
  }

  public get isVisible(): boolean {
    return this._isVisible;
  }

  public set isVisible(value: boolean) {
    this._isVisible = value;
  }

  public addChild(child: SimObject) {
    child._parent = this;
    this._children.push(child);
    child.onAdded(this._scene);
  }

  public removeChild(child: SimObject): void {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      child._parent = undefined;
      this._children.splice(index, 1);
    }
  }

  public getComponentByName(name: string): IComponent | undefined {
    for (const comp of this._components) {
      if (comp.name === name) {
        return comp;
      }
    }

    for (const child of this._children) {
      const comp = child.getComponentByName(name);
      if (comp !== undefined) {
        return comp;
      }
    }

    return undefined;
  }

  public getObjectByName(name: string): SimObject | undefined {
    if (this.name === name) {
      return this;
    }

    for (const child of this._children) {
      const result = child.getObjectByName(name);
      if (result !== undefined) {
        return result;
      }
    }

    return undefined;
  }

  public addComponent(component: IComponent): void {
    this._components.push(component);
    component.setOwner(this);
  }

  public addBehavior(behavior: IBehavior) {
    this._behaviors.push(behavior);
    behavior.setOwner(this);
  }

  public load(): void {
    for (const c of this._components) {
      c.load();
    }

    for (const c of this._children) {
      c.load();
    }

    this._isLoaded = true;
  }

  public updateReady(): void {
    for (const c of this._children) {
      c.updateReady();
    }

    for (const b of this._behaviors) {
      b.updateReady();
    } 

    for (const c of this._children) {
      c.updateReady();
    }
  }

  public update(time: number): void {
    this._localMatrix = this.transform.getTransformationMatrix();
    this.updateWorldMatrix(this._parent !== undefined ? this._parent.worldMatrix : undefined);

    for (const c of this._components) {
      c.update(time);
    }

    for (const b of this._behaviors) {
      b.update(time);
    }

    for (const c of this._children) {
      c.update(time);
    }
  }

  public render(shader: Shader): void {
    if (!this._isVisible) {
      return;
    }
    
    for (const c of this._components) {
      c.render(shader);
    }

    for (const c of this._children) {
      c.render(shader);
    }
  }

  public getWorldPosition(): Vector3 {
    return new Vector3(this._worldMatrix.data[12], this._worldMatrix.data[13],
      this._worldMatrix.data[14]);
  }

  protected onAdded(scene: Scene | undefined): void {
    this._scene = scene;
  }

  private updateWorldMatrix(parentWorldMatrix: Matrix4x4 | undefined): void {
    if (parentWorldMatrix !== undefined) {
      this._worldMatrix = Matrix4x4.multiply(parentWorldMatrix, this._localMatrix);
    } else {
      this._worldMatrix.copyFrom(this._localMatrix);
    }
  }
}
