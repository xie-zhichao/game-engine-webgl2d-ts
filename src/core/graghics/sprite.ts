import { GLBuffer, AttributeInfo } from "../gl/glBuffer";
import { Shader } from "../gl/shaders/shader";
import { Material } from "./material";
import { MaterialManager } from "./materialManager";
import { Matrix4x4 } from "../math/matrix4x4";
import { Vertex } from "./Vertex";
import { Vector3 } from "../math/vector3";

/**
 * Sprite
 */
export class Sprite {

  protected _name: string;
  protected _width: number;
  protected _height: number;

  protected _origin = Vector3.zero;

  protected gl: WebGLRenderingContext;
  protected buffer: GLBuffer;
  protected materialName: string;
  protected material: Material | undefined;

  protected vertices: Vertex[] = [];

  public constructor(gl: WebGLRenderingContext, name: string, materialName: string, width = 100, height = 100) {
    this.gl = gl;
    this._name = name;

    this.materialName = materialName;
    const material = MaterialManager.getMaterial(materialName);
    if (material === undefined) {
      throw new Error(`material: ${materialName} not found.`);
    }
    this.material = material;

    this.buffer = new GLBuffer(this.gl);
    this._width = width;
    this._height = height;
  }

  public get name() {
    return this._name;
  }

  public get origin(): Vector3 {
    return this._origin;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public set origin(value: Vector3) {
    this._origin = value;
    this.recalculateVertices();
  }

  public destroy() {
    this.buffer && this.buffer.destroy();
    MaterialManager.releaseMaterial(this.materialName);
    this.material = undefined;
    this.materialName = '';
  }

  protected calculateVertices() {
    const minX = -(this._width * this._origin.x);
    const maxX = this._width * (1.0 - this._origin.x);

    const minY = -(this._height * this._origin.y);
    const maxY = this._height * (1.0 - this._origin.y);

    this.vertices = [
      // x,y,z   ,u, v
      new Vertex(minX, minY, 0, 0, 0),
      new Vertex(minX, maxY, 0, 0, 1.0),
      new Vertex(maxX, maxY, 0, 1.0, 1.0),

      new Vertex(maxX, maxY, 0, 1.0, 1.0),
      new Vertex(maxX, minY, 0, 1.0, 0),
      new Vertex(minX, minY, 0, 0, 0)
    ];

    for (const v of this.vertices) {
      this.buffer.pushBackData(v.toArray());
    }

    this.buffer.upload();
    this.buffer.unbind();
  }

  protected recalculateVertices() {
    const minX = -(this._width * this._origin.x);
    const maxX = this._width * (1.0 - this._origin.x);

    const minY = -(this._height * this._origin.y);
    const maxY = this._height * (1.0 - this._origin.y);

    this.vertices[0].position.set(minX, minY);
    this.vertices[1].position.set(minX, maxY);
    this.vertices[2].position.set(maxX, maxY);

    this.vertices[3].position.set(maxX, maxY);
    this.vertices[4].position.set(maxX, minY);
    this.vertices[5].position.set(minX, minY);

    for (const v of this.vertices) {
      this.buffer.pushBackData(v.toArray());
    }

    this.buffer.upload();
    this.buffer.unbind();
  }

  public load(): void {
    const positonAttribute = new AttributeInfo(0, 3, 0);
    this.buffer.addAttributeLocation(positonAttribute);

    const texCoordArribute = new AttributeInfo(1, 2, 3);
    this.buffer.addAttributeLocation(texCoordArribute);

    this.calculateVertices();
  }

  public update(_time: number): void { }

  public draw(shader: Shader, model: Matrix4x4): void {
    if (this.buffer === undefined) {
      throw new Error('buffer is not initialized!');
    }

    if (this.material === undefined) {
      throw new Error('material is not initialized!');
    }

    const colorPosition = shader.getUniformLocation('u_tint');
    this.gl.uniform4fv(colorPosition, this.material.tint.toFloat32Array());

    const modelPosition = shader.getUniformLocation('u_model');
    this.gl.uniformMatrix4fv(modelPosition, false, model.toFloat32Array());

    if (this.material.diffuseTexture !== undefined) {
      this.material.diffuseTexture.activateAndBind(0);
      const diffuseLocation = shader.getUniformLocation('u_diffuse');
      this.gl.uniform1i(diffuseLocation, 0);
    }

    this.buffer.bind();
    this.buffer.draw();
  }

}
