/**
 * web gl初始化模块
 */

/**
 * 初始化后返回的web gl上下文
 */
export interface WebGLContext {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
}

/**
 * 初始化工具类
 */

let glContext: WebGLContext;

/**
 * 启动的时候传elementId初始化，后面直接取
 * @param elementId 
 */
export function getWebGLContext(elementId?: string): WebGLContext {
  if (glContext !== undefined) {
    return glContext;
  }

  let canvas: HTMLCanvasElement;
  let gl: WebGLRenderingContext;

  if (elementId !== undefined) {
    canvas = document.getElementById(elementId) as HTMLCanvasElement;
    if (canvas === null || canvas === undefined) {
      throw new Error(`Can not find a cavans by id: ${elementId}!`);
    }
  } else {
    canvas = document.createElement('canvas') as HTMLCanvasElement;
    canvas.innerText = 'please check if your browser support webgl.';
    document.body.appendChild(canvas);
  }

  gl = (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')) as WebGLRenderingContext;
  if (gl === undefined || gl === null) {
    throw new Error('Can not get webgl context!');
  }

  glContext = {
    canvas,
    gl
  };

  return glContext;
}


export default {
  getWebGLContext
}
