/**
 * web gl初始化模块
 */

/**
 * 初始化后返回的web gl上下文
 */
interface WebGLContext {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
}

const webGLContexts: WebGLContext[] = [];
let actived = 0;

/**
 * 创建WebGLContext，返回序号，序号用来切换当前激活哪个WebGLContext
 * @param elementId 
 */
export function createWebGLContext(elementId?: string): number {
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

  webGLContexts.push({
    canvas,
    gl
  });

  return webGLContexts.length - 1;
}

export function getWebGLContext(): WebGLContext {
  const webGLContext = webGLContexts[actived];
  if (webGLContext === undefined) {
    throw new Error(`WebGLContext {${actived}} is not exist.`);
  }

  return webGLContext;
}

export function setActiveWebGLContext(active: number): WebGLContext {
  actived = active;
  return getWebGLContext();
}

export default getWebGLContext;

