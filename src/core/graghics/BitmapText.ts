import { Vector3 } from "../math/vector3";
import { GLBuffer, AttributeInfo } from "../gl/glBuffer";
import { Material } from "./material";
import { BitmapFont } from "./BitmapFont";
import { Vertex } from "./Vertex";
import { Shader } from "../gl/shaders/shader";
import { Matrix4x4 } from "../math/matrix4x4";
import { BitmapFontManager } from "./BitmapFontManager";
import { Color } from "./color";

export class BitmapText {

  private _gl: WebGLRenderingContext;

  private _fontName: string;
  private _isDirty: boolean = false;

  protected _name: string;
  protected _origin = Vector3.zero;

  protected _buffer: GLBuffer | undefined;
  protected _material: Material | undefined;
  protected _bitmapFont: BitmapFont | undefined;
  protected _vertices: Vertex[] = [];
  protected _text = '';

  public constructor(name: string, fontName: string, gl: WebGLRenderingContext) {
    this._name = name;
    this._fontName = fontName;
    this._gl = gl;
  }

  public get name(): string {
    return this._name;
  }

  public get text(): string {
    return this._text;
  }

  public set text(value: string) {
    if (this._text !== value) {
      this._text = value;
      this._isDirty = true;
    }
  }

  public get origin(): Vector3 {
    return this._origin;
  }

  public set origin(value: Vector3) {
    this._origin = value;
    this.calculateVertices();
  }

  public destroy(): void {
    this._buffer && this._buffer.destroy();
    this._material && this._material.destroy();
    this._material = undefined;
  }

  public load(): void {
    this._bitmapFont = BitmapFontManager.getFont(this._fontName);

    this._material = new Material(this._gl, `BITMAP_FONT_${this.name}_${this._bitmapFont.size}`, this._bitmapFont.textureName, Color.white());

    this._buffer = new GLBuffer(this._gl);

    let positionAttribute = new AttributeInfo(0, 3);
    this._buffer.addAttributeLocation(positionAttribute);

    let texCoordAttribute = new AttributeInfo(1, 2);
    this._buffer.addAttributeLocation(texCoordAttribute);
  }

  public update(_time: number): void {
    if (this._isDirty && this._bitmapFont!.isLoaded) {
      this.calculateVertices();
      this._isDirty = false;
    }
  }

  public draw(shader: Shader, model: Matrix4x4): void {
    let modelLocation = shader.getUniformLocation("u_model");
    this._gl.uniformMatrix4fv(modelLocation, false, model.toFloat32Array());

    let colorLocation = shader.getUniformLocation("u_tint");
    this._gl.uniform4fv(colorLocation, this._material!.tint.toFloat32Array());

    if (this._material!.diffuseTexture !== undefined) {
      this._material!.diffuseTexture.activateAndBind(0);
      let diffuseLocation = shader.getUniformLocation("u_diffuse");
      this._gl.uniform1i(diffuseLocation, 0);
    }

    this._buffer!.bind();
    this._buffer!.draw();
  }

  private calculateVertices(): void {
    this._vertices.length = 0;
    this._buffer!.clearData();

    let x = 0;
    let y = 0;

    for (let c of this._text) {
      if (c === "\n") {
        x = 0;
        y += this._bitmapFont!.size;
        continue;
      }

      let g = this._bitmapFont!.getGlyph(c);

      let minX = x + g.xOffset!;
      let minY = y + g.yOffset!;

      let maxX = minX + g.width!;
      let maxY = minY + g.height!;


      let minu = g.x! / this._bitmapFont!.imageWidth;
      let minv = g.y! / this._bitmapFont!.imageHeight;

      let maxu = (g.x! + g.width!) / this._bitmapFont!.imageWidth;
      let maxv = (g.y! + g.height!) / this._bitmapFont!.imageHeight;

      this._vertices.push(new Vertex(minX, minY, 0, minu, minv));
      this._vertices.push(new Vertex(minX, maxY, 0, minu, maxv));
      this._vertices.push(new Vertex(maxX, maxY, 0, maxu, maxv));
      this._vertices.push(new Vertex(maxX, maxY, 0, maxu, maxv));
      this._vertices.push(new Vertex(maxX, minY, 0, maxu, minv));
      this._vertices.push(new Vertex(minX, minY, 0, minu, minv));

      x += g.xAdvance!;
    }

    for (let v of this._vertices) {
      this._buffer!.pushBackData(v.toArray());
    }

    this._buffer!.upload();
    this._buffer!.unbind();
  }
}
