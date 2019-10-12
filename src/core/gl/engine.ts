/**
 * 渲染引擎
 */
import { baseInitial } from './BeforeStartup';
import { createWebGLContext, getWebGLContext, setActiveWebGLContext } from './glContext';
import { Shader } from './shaders/shader';
import { Matrix4x4 } from '../math/matrix4x4';
import { MessageBus } from '../message/messageBus';
import { BasicShader } from './shaders/BasicShader';
import { ZoneManager } from '../world/ZoneManager';
import { Message } from '../message/message';
import { IMessageHandler } from '../message/IMessageHandler';
import { MouseContext, InputManager } from '../input/InputManager';
import { CollisionManager } from '../collision/CollisionManager';
import { BitmapFontManager } from '../graghics/BitmapFontManager';
import { Vector2 } from '../math/vector2';

export class Engine implements IMessageHandler {
  private elementName: string | undefined;
  private shader: Shader | undefined;
  private projection: Matrix4x4 | undefined;

  private _previousTime = 0;

  private _gameWidth: number;
  private _gameHeight: number;

  private _isFirstUpdate = true;
  private _aspect: number | undefined;

  constructor(elementName?: string, width = 320, height = 480) {
    this.elementName = elementName;
    this.loop = this.loop.bind(this);
    this.preloading = this.preloading.bind(this);

    this._gameWidth = width;
    this._gameHeight = height;

    console.log('Engine is created.');
  }

  public async start() {
    // 创建并激活WebGLContext
    const { gl, canvas } = setActiveWebGLContext(createWebGLContext(this.elementName));

    // 初始化基础环境
    baseInitial();

    // 加载shader
    this.shader = new BasicShader('basic');
    (this.shader as BasicShader).loadAsync('resource/shader/vertex-source-1.glsl', 'resource/shader/fragment-source-1.glsl');

    if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
      this._aspect = this._gameWidth / this._gameHeight;
    }

    Message.subscribe('MOUSE_UP', this);

    gl.clearColor(146 / 255, 206 / 255, 247 / 255, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    this.projection = Matrix4x4.orthographic(0, canvas.width, canvas.height, 0, -100.0, 100.0);
    this.resize();
    this.preloading();

    console.log('Engine is started.');
  }

  private preloading(): void {
    MessageBus.update(0);

    if (!(this.shader as BasicShader).isLoaded || !BitmapFontManager.updateReady()) {
      requestAnimationFrame(this.preloading);
      return;
    }

    this.shader!.use();
    ZoneManager.changeZone(0);

    this.loop();
    console.log('Engine is loaded.');
  }

  private loop() {
    if (this._isFirstUpdate) {
      this._isFirstUpdate = false;
    }
    this.update();
    this.render();

    requestAnimationFrame(this.loop);
  }

  private update() {
    const delta = performance.now() - this._previousTime;

    MessageBus.update(delta);
    ZoneManager.update(delta);
    CollisionManager.update(delta);

    this._previousTime = performance.now();
  }

  private render() {
    const { gl } = getWebGLContext();
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.shader !== undefined && this.projection !== undefined) {
      ZoneManager.render(this.shader);

      const projectionPosition = this.shader.getUniformLocation('u_projection');
      gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this.projection.data));
    }
  }

  public resize() {
    const { gl, canvas } = getWebGLContext();

    if (this._gameWidth === undefined || this._gameHeight === undefined) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, window.innerWidth, window.innerHeight);
      this.projection = Matrix4x4.orthographic(0, window.innerWidth, window.innerHeight, 0, -100.0, 100.0);
    } else {
      let newWidth = window.innerWidth;
      let newHeight = window.innerHeight;
      let newWidthToHeight = newWidth / newHeight;
      let gameArea = document.getElementById("gameArea");

      if (gameArea === null) {
        throw new Error('game area must defined.');
      }

      if (newWidthToHeight > this._aspect!) {
        newWidth = newHeight * this._aspect!;
        gameArea.style.height = newHeight + 'px';
        gameArea.style.width = newWidth + 'px';
      } else {
        newHeight = newWidth / this._aspect!;
        gameArea.style.width = newWidth + 'px';
        gameArea.style.height = newHeight + 'px';
      }

      gameArea.style.marginTop = (-newHeight / 2) + 'px';
      gameArea.style.marginLeft = (-newWidth / 2) + 'px';

      canvas.width = newWidth;
      canvas.height = newHeight;

      gl.viewport(0, 0, newWidth, newHeight);
      this.projection = Matrix4x4.orthographic(0, this._gameWidth, this._gameHeight, 0, -100.0, 100.0);

      let resolutionScale = new Vector2(newWidth / this._gameWidth, newHeight / this._gameHeight);
      InputManager.setResolutionScale(resolutionScale);
    }
  }

  public onMessage(message: Message) {
    if (message.code === 'MOUSE_UP') {
      const context = message.context as MouseContext;
      document.title = `Pos: [${context.position.x},${context.position.y}]`;
    }
  }

}
