import { IAssetLoader } from "./IAssetLoader";
import { IAsset } from "./IAsset";
import { Message } from "../message/message";
import { ImageAssetLoader } from "./imageAssetLoader";
import { JsonAssetLoader } from "./JsonAssetLoader";
import { TextAssetLoader } from "./TextAsset";


export const MESSAGE_ASSET_LOADER_ASSET_LOADED = 'MESSAGE_ASSET_LOADER_ASSET_LOADED::';

export class AssetManager {
  private static loaders: IAssetLoader[] = [];
  private static loadedAssets: { [name: string]: IAsset } = {};

  private constructor() { }

  public static initialize():void {
    AssetManager.loaders.push(new ImageAssetLoader());
    AssetManager.loaders.push(new JsonAssetLoader());
    AssetManager.loaders.push(new TextAssetLoader());
  }

  public static registerLoader(loader: IAssetLoader): void {
    AssetManager.loaders.push(loader);
  }

  public static onAssetLoaded(asset: IAsset) {
    AssetManager.loadedAssets[asset.name] = asset;
    Message.send(MESSAGE_ASSET_LOADER_ASSET_LOADED + asset.name, this, asset);
  }

  public static loadAsset(assetName: string): void {
    const extension = (assetName.split('.').pop() || '').toLowerCase();
    for (const l of AssetManager.loaders) {
      if (l.supportedExtensions.indexOf(extension) !== -1) {
        l.loadAsset(assetName);
        return;
      }
    }

    console.warn(`there is no loader to load asset with extension: ${extension}`);
  }

  public static isAssetLoaded(assetName: string): boolean {
    return AssetManager.loadedAssets[assetName] !== undefined;
  }

  public static getAsset(assetName: string): IAsset | undefined {
    if (AssetManager.loadedAssets[assetName] !== undefined) {
      return AssetManager.loadedAssets[assetName];
    } else {
      AssetManager.loadAsset(assetName);
    }

    return undefined;
  }
}
