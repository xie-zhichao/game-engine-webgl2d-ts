import { IAssetLoader } from "./IAssetLoader";
import { AssetManager } from "./assetManager";
import { HttpClient } from "../../common/http/httpclient";
import { IAsset } from "./IAsset";

export class TextAsset implements IAsset {

  public readonly name: string;

  public readonly data: string;

  public constructor(name: string, data: string) {
    this.name = name;
    this.data = data;
  }
}

export class TextAssetLoader implements IAssetLoader {

  public get supportedExtensions(): string[] {
    return ["txt"];
  }

  public async loadAsset(assetName: string) {
    const { response: text } = await HttpClient.get(assetName);
    this.onTextLoaded(assetName, text);
  }

  private onTextLoaded(assetName: string, text: string): void {
      const asset = new TextAsset(assetName, text);
      AssetManager.onAssetLoaded(asset);
  }
}
