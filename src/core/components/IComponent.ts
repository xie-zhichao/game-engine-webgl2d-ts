import { Shader } from "../gl/shaders/shader";
import { SimObject } from "../world/simObject";

export interface IComponent {
  name: string | undefined;
  readonly owner: SimObject | undefined;
  
  getOwner(): SimObject | undefined;
  setOwner(owner: SimObject): void;

  load(): void;

  update(time: number): void;

  render(shader: Shader): void;
}
