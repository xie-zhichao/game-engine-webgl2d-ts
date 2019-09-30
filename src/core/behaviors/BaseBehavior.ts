import { IBehavior } from "./IBehavior";
import { IBehaviorData } from "./IBehaviorData";
import { SimObject } from "../world/simObject";

export abstract class BaseBehavior implements IBehavior {
  public name: string | undefined;

  protected _data: IBehaviorData;
  protected _owner: SimObject | undefined;

  public constructor(data: IBehaviorData) {
    this._data = data;
    this.name = this._data.name;
  }

  public setOwner(owner: SimObject): void {
    this._owner = owner;
  }

  public getOwner(): SimObject | undefined {
    return this._owner;
  }

  public updateReady(): void { }

  public update(_time: number) { }

  public apply(_userData: any) { }
}