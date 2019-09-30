export interface IComponentData {
  name: string | undefined;

  setFromJson(json: any): void;
}