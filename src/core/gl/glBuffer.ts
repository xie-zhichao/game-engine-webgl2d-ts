export class AttributeInfo {
  public location: number;
  public size: number;
  public offset: number = 0;

  constructor(location: number, size: number, offset?: number) {
    this.location = location;
    this.size = size;
    if (offset !== undefined) {
      this.offset = offset;
    }
  }

  public clone(): AttributeInfo {
    return new AttributeInfo(this.location, this.size, this.offset);
  }
}

const GL = WebGLRenderingContext;

export class GLBuffer {
  private gl: WebGLRenderingContext;
  private hasArttributeLocation: boolean = false;
  private elementSize: number;
  private stride: number = 0;
  private buffer: WebGLBuffer;

  private targetBufferType: number;
  private dataType: number;
  private mode: number;
  private typeSize: number;

  private data: number[] = [];
  private attributes: AttributeInfo[] = [];

  public constructor(gl: WebGLRenderingContext, dataType: number = GL.FLOAT, targetBufferType: number = GL.ARRAY_BUFFER,
    mode: number = GL.TRIANGLES) {

    this.gl = gl;
    this.dataType = dataType;
    this.targetBufferType = targetBufferType;
    this.mode = mode;
    this.elementSize = 0;

    switch (this.dataType) {
      case GL.FLOAT:
      case GL.INT:
      case GL.UNSIGNED_INT:
        this.typeSize = 4;
        break;
      case GL.SHORT:
      case GL.UNSIGNED_SHORT:
        this.typeSize = 2;
        break;
      case GL.BYTE:
      case GL.UNSIGNED_BYTE:
        this.typeSize = 1;
        break;
      default:
        throw new Error(`unexpected data type: ${dataType}`);
    }

    const buffer = gl.createBuffer();
    if (buffer === null) {
      throw new Error('create buffer error');
    }
    this.buffer = buffer;
  }

  public destroy(): void {
    this.gl.deleteBuffer(this.buffer);
  }

  public bind(normalized: boolean = false): void {
    this.gl.bindBuffer(this.targetBufferType, this.buffer);

    if (this.hasArttributeLocation) {
      for (const it of this.attributes) {
        this.gl.vertexAttribPointer(it.location, it.size, this.dataType,
           normalized, this.stride, it.offset * this.typeSize);
        this.gl.enableVertexAttribArray(it.location);
      }
    }
  }

  public unbind(): void {
    for (const it of this.attributes) {
      this.gl.disableVertexAttribArray(it.location);
    }

    this.gl.bindBuffer(this.targetBufferType, null);
  }

  public addAttributeLocation(info: AttributeInfo): void {
    !this.hasArttributeLocation && (this.hasArttributeLocation = true);
    const infoClone = info.clone();
    infoClone.offset = this.elementSize;
    this.attributes.push(infoClone);
    this.elementSize += infoClone.size;
    this.stride = this.elementSize * this.typeSize;
  }

  public setData(data: number[]): void {
    this.clearData();
    this.pushBackData(data);
  }

  public pushBackData(data: number[]): void {
    for (const d of data) {
      this.data.push(d);
    }
  }

  public clearData(): void {
    this.data.length = 0;
  }

  public upload(): void {
    this.gl.bindBuffer(this.targetBufferType, this.buffer);

    let bufferData: ArrayBuffer | null;
    switch (this.dataType) {
      case GL.FLOAT:
        bufferData = new Float32Array(this.data);
        break;
      case GL.INT:
        bufferData = new Int32Array(this.data);
        break;
      case GL.UNSIGNED_INT:
        bufferData = new Uint32Array(this.data);
        break;
      case GL.SHORT:
        bufferData = new Int16Array(this.data);
        break;
      case GL.UNSIGNED_SHORT:
        bufferData = new Uint16Array(this.data);
        break;
      case GL.BYTE:
        bufferData = new Int8Array(this.data);
        break;
      case GL.UNSIGNED_BYTE:
        bufferData = new Uint8Array(this.data);
        break;
      default:
        bufferData = null;
    }

    this.gl.bufferData(this.targetBufferType, bufferData, GL.STATIC_DRAW);
  }

  public draw(): void {
    if (this.targetBufferType === GL.ARRAY_BUFFER) {
      this.gl.drawArrays(this.mode, 0, this.data.length / this.elementSize);
    } else if (this.targetBufferType === GL.ELEMENT_ARRAY_BUFFER) {
      this.gl.drawElements(this.mode, this.data.length, this.dataType, 0);
    }
  }

}
