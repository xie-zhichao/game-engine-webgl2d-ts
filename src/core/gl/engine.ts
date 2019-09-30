/**
 * 渲染引擎
 */
import { WebGLUtils, GLContext } from './gl';
import { Shader } from './shaders/shader';
import { Matrix4x4 } from '../math/matrix4x4';
import { MessageBus } from '../message/messageBus';
import { AssetManager } from '../assets/assetManager';
import { AsyncShaderLoader } from './shaders/AsyncShaderLoader';
import { MaterialManager } from '../graghics/materialManager';
import { Material } from '../graghics/material';
import { Color } from '../graghics/color';
import { ZoneManager } from '../world/ZoneManager';
import { ComponentManager } from '../components/ComponentManager';
import { SpriteComponentBuilder } from '../components/SpriteComponent';
import { BehaviorManager } from '../behaviors/BehaviorManager';
import { KeyboardMovementBehaviorBuilder } from '../behaviors/KeyboardMovementBehavior';
import { RotationBehaviorBuilder } from '../behaviors/RotationBehavior';
import { Message } from '../message/message';
import { IMessageHandler } from '../message/IMessageHandler';
import { MouseContext, InputManager } from '../input/InputManager';
import { AudioManager } from '../audio/AudioManager';
import { AnimatedSpriteComponentBuilder } from '../components/AnimatedSpriteComponent';
import { CollisionComponentBuilder } from '../components/CollisionComponent';
import { CollisionManager } from '../collision/CollisionManager';
import { MouseClickBehaviorBuilder } from '../behaviors/MouseClickBehavior';
import { PlayerBehaviorBuilder } from '../behaviors/PlayerBehavior';
import { ScrollBehaviorBuilder } from '../behaviors/ScrollBehavior';
import { VisibilityOnMessageBehaviorBuilder } from '../behaviors/VisibilityOnMessageBehavior';
import { BitmapTextComponentBuilder } from '../components/BitmapTextComponent';
import { BitmapFontManager } from '../graghics/BitmapFontManager';
import { Vector2 } from '../math/vector2';

export class Engine implements IMessageHandler {
  private glContext: GLContext;
  private shader: Shader | undefined;
  private projection: Matrix4x4 | undefined;

  private _previousTime = 0;

  private _gameWidth: number;
  private _gameHeight: number;

  private _isFirstUpdate = true;
  private _aspect: number | undefined;

  constructor( elementName?: string, width = 320, height = 480) {
    this.glContext = WebGLUtils.initialize(elementName);
    this.loop = this.loop.bind(this);
    this.preloading = this.preloading.bind(this);

    this._gameWidth = width;
    this._gameHeight = height;

    console.log('Engine is created.');
  }

  public async start() {
    const { gl, canvas } = this.glContext;

    if (this._gameWidth !== undefined && this._gameHeight !== undefined) {
      this._aspect = this._gameWidth / this._gameHeight;
    }

    ComponentManager.registerBuilder(new SpriteComponentBuilder());
    ComponentManager.registerBuilder(new AnimatedSpriteComponentBuilder());
    ComponentManager.registerBuilder(new CollisionComponentBuilder());
    ComponentManager.registerBuilder(new BitmapTextComponentBuilder());

    BehaviorManager.registerBuilder(new KeyboardMovementBehaviorBuilder());
    BehaviorManager.registerBuilder(new RotationBehaviorBuilder());
    BehaviorManager.registerBuilder(new MouseClickBehaviorBuilder());
    BehaviorManager.registerBuilder(new PlayerBehaviorBuilder());
    BehaviorManager.registerBuilder(new ScrollBehaviorBuilder());
    BehaviorManager.registerBuilder(new VisibilityOnMessageBehaviorBuilder());

    AssetManager.initialize();
    InputManager.initialize(canvas);
    ZoneManager.initialize(gl);

    Message.subscribe('MOUSE_UP', this);

    gl.clearColor(146 / 255, 206 / 255, 247 / 255, 1);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    try {
      this.shader = await AsyncShaderLoader.load('basic', gl, 'resource/shader/vertex-source-1.glsl',
        'resource/shader/fragment-source-1.glsl');
      this.shader.use();

      BitmapFontManager.addFont("default", "resource/fonts/text.txt");
      BitmapFontManager.load();

      MaterialManager.registerMaterial(new Material(gl, "bg", "resource/assets/textures/bg.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "end", "resource/assets/textures/end.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "middle", "resource/assets/textures/middle.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "grass", "resource/assets/textures/grass.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "duck", "resource/assets/textures/duck.png", Color.white()));

      MaterialManager.registerMaterial(new Material(gl, "playbtn", "resource/assets/textures/playbtn.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "restartbtn", "resource/assets/textures/restartbtn.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "score", "resource/assets/textures/score.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "title", "resource/assets/textures/title.png", Color.white()));
      MaterialManager.registerMaterial(new Material(gl, "tutorial", "resource/assets/textures/tutorial.png", Color.white()));

      AudioManager.loadSoundFile("flap", "resource/sounds/flap.mp3", false);
      AudioManager.loadSoundFile("ting", "resource/sounds/ting.mp3", false);
      AudioManager.loadSoundFile("dead", "resource/sounds/dead.mp3", false);

    } catch (error) {
      throw new Error(`scene load error: ${error}`);
    }

    this.projection = Matrix4x4.orthographic(0, canvas.width, canvas.height, 0, -100.0, 100.0);
    this.resize();
    this.preloading();

    console.log('Engine is started.');
  }

  private preloading(): void {
    const { gl } = this.glContext;
    MessageBus.update(0);

    if (!BitmapFontManager.updateReady()) {
      requestAnimationFrame(this.preloading);
      return;
    }

    ZoneManager.changeZone(gl, 0);

    this.loop();
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
    const { gl } = this.glContext;
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (this.shader !== undefined && this.projection !== undefined) {
      ZoneManager.render(this.shader);

      const projectionPosition = this.shader.getUniformLocation('u_projection');
      gl.uniformMatrix4fv(projectionPosition, false, new Float32Array(this.projection.data));
    }
  }

  public resize() {
    const { gl, canvas } = this.glContext;

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
