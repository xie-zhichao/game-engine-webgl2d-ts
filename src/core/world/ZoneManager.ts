import { getWebGLContext } from '../gl/glContext';
import { IMessageHandler } from "../message/IMessageHandler";
import { Zone } from "./Zone";
import { AssetManager, MESSAGE_ASSET_LOADER_ASSET_LOADED } from "../assets/assetManager";
import { Message } from "../message/message";
import { Shader } from "../gl/shaders/shader";
import { JsonAsset } from "../assets/JsonAssetLoader";

class ZoneLoader implements IMessageHandler {
  public onMessage(message: Message): void {
    if (message.code.indexOf(MESSAGE_ASSET_LOADER_ASSET_LOADED) !== -1) {
      console.log(`zone loaded: ${message.code}`);
      const asset = message.context as JsonAsset;
      ZoneManager.loadZone(asset);
    }
  }
}

export class ZoneManager {
  // private static _globalZoneID: number = -1;
  private static _registeredZones: { [id: number]: string } = {};
  private static _acitveZone: Zone | undefined;

  private static zoneLoader: ZoneLoader = new ZoneLoader();

  public static initialize(zoneAsset: string): void {
    ZoneManager._registeredZones[0] = zoneAsset;
  }

  public static changeZone(id: number): void {
    if (ZoneManager._acitveZone !== undefined) {
      ZoneManager._acitveZone.onDeactivated();
      ZoneManager._acitveZone.unload();
      ZoneManager._acitveZone = undefined;
    }

    if (ZoneManager._registeredZones[id] !== undefined) {
      if (AssetManager.isAssetLoaded(ZoneManager._registeredZones[id])) {
        const asset = AssetManager.getAsset(ZoneManager._registeredZones[id]);

        if (asset === undefined) {
          throw new Error(`can not find asset with zoneId: ${id}`);
        }
        ZoneManager.loadZone(asset);
      } else {
        Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + ZoneManager._registeredZones[id], ZoneManager.zoneLoader);
        AssetManager.loadAsset(ZoneManager._registeredZones[id]);
      }
    } else {
      throw new Error(`Zone id: ${id} does not exist.`);
    }
  }

  public static update(time: number): void {
    if (ZoneManager._acitveZone !== undefined) {
      ZoneManager._acitveZone.update(time);
    }
  }

  public static render(shader: Shader): void {
    if (ZoneManager._acitveZone !== undefined) {
      ZoneManager._acitveZone.render(shader);
    }
  }

  public static loadZone(asset: JsonAsset): void {
    const { gl } = getWebGLContext();
    const zoneData = asset.data;

    let zoneId: number;
    if (zoneData.id === undefined) {
      throw new Error('zone file format error: zone id not present.');
    } else {
      zoneId = Number(zoneData.id);
    }

    let zoneName: string;
    if (zoneData.name === undefined) {
      throw new Error('zone file format error: zone name not present.');
    } else {
      zoneName = String(zoneData.name);
    }

    let zoneDescription: string;
    if (zoneData.description !== undefined) {
      zoneDescription = String(zoneData.description);
    } else {
      zoneDescription = '';
    }

    ZoneManager._acitveZone = new Zone(gl, zoneId, zoneName, zoneDescription);
    ZoneManager._acitveZone.initialize(zoneData);
    ZoneManager._acitveZone.onActivated();
    ZoneManager._acitveZone.load();
  }
}
