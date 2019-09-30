import { IAsset } from "./IAsset";
import { IAssetLoader } from "./IAssetLoader";
import { HttpClient } from "../../common/http/httpclient";
import { AssetManager } from "./assetManager";

export class JsonAsset implements IAsset {
  public readonly name: string;
  public readonly data: any;

  public constructor(name: string, data: any) {
    this.name = name;
    this.data = data;
  }
}

export class JsonAssetLoader implements IAssetLoader {
  public get supportedExtensions(): string[] {
    return ['json'];
  }

  public async loadAsset(assetName: string): Promise<void> {
    const { response: assetJson } = await HttpClient.get(assetName);
    this.onJsonLoaded(assetName, assetJson);
  }

  private onJsonLoaded(assetName: string, assetJson: string) {
    console.log('onJsonLoaded: assetName/assetJson', assetName, assetJson);

    const json = JSON.parse(assetJson);
    const asset = new JsonAsset(assetName, json);
    AssetManager.onAssetLoaded(asset);
  }
}
