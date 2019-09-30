import { IBehaviorData } from "./IBehaviorData";
import { Vector3 } from "../math/vector3";
import { BaseBehavior } from "./BaseBehavior";
import { IBehaviorBuilder } from "./IBehaviorBuilder";
import { IBehavior } from "./IBehavior";

export class RotationBehaviorData implements IBehaviorData {
  public name: string | undefined;

  public rotation: Vector3 = Vector3.zero;

  public setFromJson(json: any): void {
    if (json.name === undefined) {
      throw new Error('name must be defined in behavior data.');
    }

    this.name = String(json.name);

    if (json.rotation !== undefined) {
      this.rotation.setFromJson(json.rotation);
    }
  }
}

export class RotationBehaviorBuilder implements IBehaviorBuilder {
  public get type(): string {
    return 'rotation';
  }

  public buildFromJson(json: any): IBehavior {
    const data = new RotationBehaviorData();
    data.setFromJson(json);
    return new RotationBehavior(data);
  }
}

export class RotationBehavior extends BaseBehavior {
  private _rotation: Vector3;

  public constructor(data: RotationBehaviorData) {
    super(data);

    this._rotation = data.rotation;
  }

  public update(time: number): void {
    if (this._owner === undefined) {
      console.log('owner is undefined.');
      return;
    }

    this._owner.transform.rotation.add(this._rotation);
    
    super.update(time);
  }
}
