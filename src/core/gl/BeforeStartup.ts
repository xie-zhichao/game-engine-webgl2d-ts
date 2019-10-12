import { getWebGLContext } from './glContext';
import { AssetManager } from '../assets/assetManager';
import { MaterialManager } from '../graghics/materialManager';
import { Material } from '../graghics/material';
import { Color } from '../graghics/color';
import { ComponentManager } from '../components/ComponentManager';
import { SpriteComponentBuilder } from '../components/SpriteComponent';
import { BehaviorManager } from '../behaviors/BehaviorManager';
import { KeyboardMovementBehaviorBuilder } from '../behaviors/KeyboardMovementBehavior';
import { RotationBehaviorBuilder } from '../behaviors/RotationBehavior';
import { AudioManager } from '../audio/AudioManager';
import { AnimatedSpriteComponentBuilder } from '../components/AnimatedSpriteComponent';
import { CollisionComponentBuilder } from '../components/CollisionComponent';
import { MouseClickBehaviorBuilder } from '../behaviors/MouseClickBehavior';
import { PlayerBehaviorBuilder } from '../behaviors/PlayerBehavior';
import { ScrollBehaviorBuilder } from '../behaviors/ScrollBehavior';
import { VisibilityOnMessageBehaviorBuilder } from '../behaviors/VisibilityOnMessageBehavior';
import { BitmapTextComponentBuilder } from '../components/BitmapTextComponent';
import { BitmapFontManager } from '../graghics/BitmapFontManager';
import { ImageAssetLoader } from '../assets/imageAssetLoader';
import { JsonAssetLoader } from '../assets/JsonAssetLoader';
import { TextAssetLoader } from '../assets/TextAsset';
import { InputManager } from '../input/InputManager';
import { ZoneManager } from '../world/ZoneManager';

export function baseInitial() {
  const { gl, canvas } = getWebGLContext();
  
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

  AssetManager.initialize([new ImageAssetLoader(), new JsonAssetLoader(), new TextAssetLoader()]);
  InputManager.initialize(canvas);
  ZoneManager.initialize('resource/zones/testZone.json');

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
}
