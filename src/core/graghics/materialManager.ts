import { Material } from "./material";

class MaterialReferenceNode {
  public material: Material;
  public referenceCount: number = 1;

  public constructor(material: Material) {
    this.material = material;
  }
}

export class MaterialManager {
  private static _materials: { [name: string]: MaterialReferenceNode } = {};

  private constructor() { }

  public static registerMaterial(material: Material): void {
    if (MaterialManager._materials[material.name] === undefined) {
      MaterialManager._materials[material.name] = new MaterialReferenceNode(material);
    }
  }

  public static getMaterial(materialName: string): Material | undefined {
    if (MaterialManager._materials[materialName] === undefined) {
      return undefined;
    } else {
      MaterialManager._materials[materialName].referenceCount++;
      return MaterialManager._materials[materialName].material;
    }
  }

  public static releaseMaterial(materialName: string) {
    const materialReferenceNode = MaterialManager._materials[materialName];
    if (materialReferenceNode === undefined) {
      console.warn(`Material named ${materialName} has not been registered.`);
    } else {
      materialReferenceNode.referenceCount--;
      if (materialReferenceNode.referenceCount < 1) {
        materialReferenceNode.material.destroy();
        delete MaterialManager._materials[materialName];
      }
    }
  }
}
