import { IBehaviorBuilder } from "./IBehaviorBuilder";
import { IBehavior } from "./IBehavior";

export class BehaviorManager {
  private static _registeredBuilders: { [type: string]: IBehaviorBuilder } = {};

  public static registerBuilder(builder: IBehaviorBuilder): void {
    BehaviorManager._registeredBuilders[builder.type] = builder;
  }

  public static extractBehavior(json: any): IBehavior {
    if (json.type !== undefined) {
      const behaviorBuilder = BehaviorManager._registeredBuilders[String(json.type)];
      if (behaviorBuilder !== undefined) {
        return behaviorBuilder.buildFromJson(json);
      }
    }

    throw new Error(`Behavior manager error: type: ${json.type} is missing or builder is not registered.`);
  }
}
