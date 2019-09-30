/**
 * web gl初始化模块
 */

/**
 * 初始化后返回的web gl上下文
 */
export interface GLContext {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
}

/**
 * 初始化工具类
 */
export class WebGLUtils {
  static initialize(elementId?: string): GLContext {
    let cavans: HTMLCanvasElement;
    let gl: WebGLRenderingContext;

    if (elementId !== undefined) {
      cavans = document.getElementById(elementId) as HTMLCanvasElement;
      if (cavans === null || cavans === undefined) {
        throw new Error(`Can not find a cavans by id: ${elementId}!`);
      }
    } else {
      cavans = document.createElement('canvas') as HTMLCanvasElement;
      cavans.innerText = 'please check if your browser support webgl.';
      document.body.appendChild(cavans);
    }

    gl = (cavans.getContext('webgl') || cavans.getContext('experimental-webgl')) as WebGLRenderingContext;
    if (gl === undefined || gl === null) {
      throw new Error('Can not get webgl context!');
    }

    return {
      canvas: cavans,
      gl
    };
  }
}

export default WebGLUtils;
