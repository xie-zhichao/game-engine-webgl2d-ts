import { Scene } from "./Scene";
import { SimObject } from "./simObject";
import { AnyObject } from "../../common/BaseTypes";
import { ComponentManager } from "../components/ComponentManager";
import { Shader } from "../gl/shaders/shader";
import { BehaviorManager } from "../behaviors/BehaviorManager";

export enum ZoneState {
  UNINITIALIZED,
  LOADING,
  UPDATING
}

export class Zone {
  private _gl: WebGLRenderingContext;
  private _id: number;
  private _name: string;
  private _description: string;
  private _scene: Scene;
  private _state: ZoneState = ZoneState.UNINITIALIZED;
  private _globalID: number = -1;

  public constructor(gl: WebGLRenderingContext, id: number, name: string, description: string) {
    this._gl = gl;
    this._id = id;
    this._name = name;
    this._description = description;
    this._scene = new Scene();
  }

  public initialize(zoneData: AnyObject): void {
    if (zoneData.objects === undefined) {
      throw new Error('Zone initialization error: objects not present.');
    }

    for (const o in zoneData.objects) {
      if (zoneData.objects.hasOwnProperty(o)) {
        const element = zoneData.objects[o];
        this.loadSimObject(element, this._scene.root);
      }
    }
  }

  private loadSimObject(dataSection: AnyObject, parent: SimObject): void {
    let name: string;
    if (dataSection.name === undefined) {
      throw new Error('SimObject name is undefined');
    }
    name = String(dataSection.name);

    this._globalID++;
    const simObject = new SimObject(this._globalID, name, this._scene);

    if (dataSection.transform !== undefined) {
      simObject.transform.setFromJson(dataSection.transform);
    }

    if (dataSection.components !== undefined) {
      for (const c in dataSection.components) {
        if (dataSection.components.hasOwnProperty(c)) {
          const element = dataSection.components[c];
          let component = ComponentManager.extractComponent(this._gl, element);
          simObject.addComponent(component);
        }
      }
    } else {
      console.log(`No components in ${name}`);
    }

    if (dataSection.behaviors !== undefined) {
      for (let b in dataSection.behaviors) {
        const data = dataSection.behaviors[b];
        const behavior = BehaviorManager.extractBehavior(data);
        simObject.addBehavior(behavior);
      }
    }

    if (dataSection.children !== undefined) {
      for (const o in dataSection.children) {
        if (dataSection.children.hasOwnProperty(o)) {
          const obj = dataSection.children[o];
          this.loadSimObject(obj, simObject);
        }
      }
    }

    if (parent !== undefined) {
      parent.addChild(simObject);
    }
  }

  public get id(): number {
    return this._id;
  }

  public get name(): string {
    return this._name;
  }

  public get description(): string {
    return this._description;
  }

  public get scene(): Scene {
    return this._scene;
  }

  public load(): void {
    this._state = ZoneState.LOADING;

    this._scene.load();
    this._scene.root.updateReady();

    this._state = ZoneState.UPDATING;
  }

  public unload(): void {

  }

  public update(time: number): void {
    if (this._state === ZoneState.UPDATING) {
      this._scene.update(time);
    }
  }

  public render(shader: Shader): void {
    if (this._state === ZoneState.UPDATING) {
      this._scene.render(shader);
    }
  }

  public onActivated(): void {

  }

  public onDeactivated(): void {

  }
}
