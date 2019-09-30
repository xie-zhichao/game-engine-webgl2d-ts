import { AssetManager, MESSAGE_ASSET_LOADER_ASSET_LOADED } from "../assets/assetManager";
import { Message } from "../message/message";
import { Vector2 } from "../math/vector2";
import { IMessageHandler } from "../message/IMessageHandler";
import { TextAsset } from "../assets/TextAsset";

class FontUtilities {

  public static extractFieldValue(field: string): string {
    return field.split("=")[1];
  }
}

export class FontGlyph {
  public id: number | undefined;
  public x: number | undefined;
  public y: number | undefined;
  public width: number | undefined;
  public height: number | undefined;
  public xOffset: number | undefined;
  public yOffset: number | undefined;
  public xAdvance: number | undefined;
  public page: number | undefined;
  public channel: number | undefined;

  public static fromFields(fields: string[]): FontGlyph {
    let glyph: FontGlyph = new FontGlyph();

    glyph.id = Number(FontUtilities.extractFieldValue(fields[1]));
    glyph.x = Number(FontUtilities.extractFieldValue(fields[2]));
    glyph.y = Number(FontUtilities.extractFieldValue(fields[3]));
    glyph.width = Number(FontUtilities.extractFieldValue(fields[4]));
    glyph.height = Number(FontUtilities.extractFieldValue(fields[5]));
    glyph.xOffset = Number(FontUtilities.extractFieldValue(fields[6]));
    glyph.yOffset = Number(FontUtilities.extractFieldValue(fields[7]));
    glyph.xAdvance = Number(FontUtilities.extractFieldValue(fields[8]));
    glyph.page = Number(FontUtilities.extractFieldValue(fields[9]));
    glyph.channel = Number(FontUtilities.extractFieldValue(fields[10]));

    return glyph;
  }
}

export class BitmapFont implements IMessageHandler {

  private _name: string;
  private _fontFileName: string;
  private _assetLoaded = false;
  private _imageFile = '';
  private _glyphs: { [id: number]: FontGlyph } = {};
  private _size = 0;
  private _imageWidth = 0;
  private _imageHeight = 0;

  public constructor(name: string, fontFile: string) {
    this._name = name;
    this._fontFileName = fontFile;
  }

  public get name(): string {
    return this._name;
  }

  public get size(): number {
    return this._size;
  }

  public get imageWidth(): number {
    return this._imageWidth;
  }

  public get imageHeight(): number {
    return this._imageHeight;
  }

  public get textureName(): string {
    return this._imageFile;
  }

  public get isLoaded(): boolean {
    return this._assetLoaded;
  }

  public load(): void {
    let asset = AssetManager.getAsset(this._fontFileName);
    if (asset !== undefined) {
      this.processFontFile(asset.data);
    } else {
      Message.subscribe(MESSAGE_ASSET_LOADER_ASSET_LOADED + this._fontFileName, this);
    }
  }

  public onMessage(message: Message): void {
    if (message.code === MESSAGE_ASSET_LOADER_ASSET_LOADED + this._fontFileName) {
      this.processFontFile((message.context as TextAsset).data);
    }
  }

  public getGlyph(char: string): FontGlyph {

    // Replace unrecognized characters with a '?'.
    let code = char.charCodeAt(0);
    code = (this._glyphs[code] === undefined) ? 63 : code;
    return this._glyphs[code];
  }

  public measureText(text: string): Vector2 {
    let size = Vector2.zero;

    let maxX = 0;
    let x = 0;
    let y = 0;

    for (let c of text) {
      switch (c) {
        case "\n":
          if (x > maxX) {
            maxX = x;
          }
          x = 0;
          y += this._size;
          break;
        default:
          x += this.getGlyph(c).xAdvance!;
          break;
      }
    }

    size.set(maxX, y);
    return size;
  }

  private processFontFile(content: string): void {
    let charCount: number = 0;
    let lines: string[] = content.split("\n");
    for (let line of lines) {

      // Sanitize the line.
      let data = line.replace(/\s\s+/g, ' ');
      let fields = data.split(" ");

      // Look at the type of line
      switch (fields[0]) {
        case "info":
          this._size = Number(FontUtilities.extractFieldValue(fields[2]));
          break;
        case "common":
          this._imageWidth = Number(FontUtilities.extractFieldValue(fields[3]));
          this._imageHeight = Number(FontUtilities.extractFieldValue(fields[4]));
          break;
        case "page":
          {
            // let id: number = Number(FontUtilities.extractFieldValue(fields[1]));

            this._imageFile = FontUtilities.extractFieldValue(fields[2]);

            // Strip quotes.
            this._imageFile = this._imageFile.replace(/"/g, "");

            // Prepend the path to the image name. TODO: This should be configurable.
            this._imageFile = ("resource/fonts/" + this._imageFile).trim();
          }
          break;
        case "chars":
          charCount = Number(FontUtilities.extractFieldValue(fields[1]));

          // Increment the expected count, the file's count is off by one.
          charCount++;
          break;
        case "char":
          {
            let glyph = FontGlyph.fromFields(fields);
            this._glyphs[glyph.id!] = glyph;
          }
          break;
      }
    }

    // Verify the loaded glyphs
    let actualGlyphCount = 0;

    // Only count properties
    let keys = Object.keys(this._glyphs);
    for (let key of keys) {
      if (this._glyphs.hasOwnProperty(key)) {
        actualGlyphCount++;
      }
    }

    if (actualGlyphCount !== charCount) {
      throw new Error(`Font file reported existence of ${charCount} glyphs, but only ${actualGlyphCount} were found.`);
    }

    this._assetLoaded = true;
  }
}
