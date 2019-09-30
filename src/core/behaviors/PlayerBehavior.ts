import { IBehaviorData } from "./IBehaviorData";
import { Vector2 } from "../math/vector2";
import { IBehaviorBuilder } from "./IBehaviorBuilder";
import { BaseBehavior } from "./BaseBehavior";
import { IMessageHandler } from "../message/IMessageHandler";
import { Vector3 } from "../math/vector3";
import { AnimatedSpriteComponent } from "../components/AnimatedSpriteComponent";
import { Message } from "../message/message";
import { MathUtils } from "../math/MathUtils";
import { AudioManager } from "../audio/AudioManager";
import { CollisionData } from "../collision/CollisionManager";

export class PlayerBehaviorData implements IBehaviorData {
  public name: string | undefined;
  public acceleration: Vector2 = new Vector2(0, 920);
  public playerCollisionComponent: string | undefined;
  public groundCollisionComponent: string | undefined;
  public animatedSpriteName: string | undefined;
  public scoreCollisionComponent: string | undefined;

  public setFromJson(json: any) {
    if (json.name === undefined) {
      throw new Error("Name must be defined in behavior data.");
    }

    this.name = String(json.name);

    if (json.acceleration !== undefined) {
      this.acceleration.setFromJson(json.acceleration);
    }

    if (json.animatedSpriteName === undefined) {
      throw new Error("animatedSpriteName must be defined in behavior data.");
    } else {
      this.animatedSpriteName = String(json.animatedSpriteName);
    }

    if (json.playerCollisionComponent === undefined) {
      throw new Error("playerCollisionComponent must be defined in behavior data.");
    } else {
      this.playerCollisionComponent = String(json.playerCollisionComponent);
    }

    if (json.groundCollisionComponent === undefined) {
      throw new Error("groundCollisionComponent must be defined in behavior data.");
    } else {
      this.groundCollisionComponent = String(json.groundCollisionComponent);
    }

    if (json.scoreCollisionComponent === undefined) {
      throw new Error("scoreCollisionComponent must be defined in behavior data.");
    } else {
      this.scoreCollisionComponent = String(json.scoreCollisionComponent);
    }
  }
}

export class PlayerBehaviorBuilder implements IBehaviorBuilder {
  public get type(): string {
    return 'player';
  }

  public buildFromJson(json: any) {
    const data = new PlayerBehaviorData();
    data.setFromJson(json);
    return new PlayerBehavior(data);
  }
}

export class PlayerBehavior extends BaseBehavior implements IMessageHandler {
  private _acceleration: Vector2;
  private _velocity: Vector2 = Vector2.zero;
  private _isAlive = true;
  private _playerCollisionComponent: string;
  private _groundCollisionComponent: string;
  private _scoreCollisionComponent: string;
  private _animatedSpriteName: string;
  private _isPlaying = false;
  private _initialPosition = Vector3.zero;
  private _score = 0;
  private _highScore = 0;

  private _sprite: AnimatedSpriteComponent | undefined;

  private _pipeNames = ["pipe1Collision_end", "pipe1Collision_middle_top", "pipe1Collision_endneg", "pipe1Collision_middle_bottom"];

  public constructor(data: PlayerBehaviorData) {
    super(data);

    this._acceleration = data.acceleration;

    if (data.animatedSpriteName === undefined) {
      throw new Error("animatedSpriteName must be defined in behavior data.");
    } else {
      this._animatedSpriteName = String(data.animatedSpriteName);
    }

    if (data.playerCollisionComponent === undefined) {
      throw new Error("playerCollisionComponent must be defined in behavior data.");
    } else {
      this._playerCollisionComponent = String(data.playerCollisionComponent);
    }

    if (data.groundCollisionComponent === undefined) {
      throw new Error("groundCollisionComponent must be defined in behavior data.");
    } else {
      this._groundCollisionComponent = String(data.groundCollisionComponent);
    }

    if (data.scoreCollisionComponent === undefined) {
      throw new Error("scoreCollisionComponent must be defined in behavior data.");
    } else {
      this._scoreCollisionComponent = String(data.scoreCollisionComponent);
    }

    Message.subscribe("MOUSE_DOWN", this);
    Message.subscribe("COLLISION_ENTRY", this);

    Message.subscribe("GAME_READY", this);
    Message.subscribe("GAME_RESET", this);
    Message.subscribe("GAME_START", this);

    Message.subscribe("PLAYER_DIED", this);
  }

  public updateReady() {
    if (this._owner === undefined) {
      throw new Error("owner is undefined.");
    }

    const comp = this._owner.getComponentByName(this._animatedSpriteName);
    if (comp === undefined) {
      throw new Error(`AnimatedSpriteComponent named '${this._animatedSpriteName}' is not exist in the owner.`);
    }
    this._sprite = comp as AnimatedSpriteComponent;
    this._sprite.setFrame(0);
    this._initialPosition.copyFrom(this._owner.transform.position);
  }

  public update(time: number) {
    if (this._owner === undefined) {
      throw new Error("owner is undefined.");
    }

    if (this._sprite === undefined) {
      throw new Error("sprite is undefined.");
    }

    const seconds = time / 1000;
    if (this._isPlaying) {
      this._velocity.add(this._acceleration.clone().scale(seconds));
    }

    if (this._velocity.y > 400) {
      this._velocity.y = 400;
    }

    if (this._owner.transform.position.y < -13) {
      this._owner.transform.position.y = -13;
      this._velocity.y = 0;
    }

    this._owner.transform.position.add(this._velocity.clone().scale(seconds).toVector3());

    if (this._velocity.y < 0) {
      this._owner.transform.rotation.z -= MathUtils.degToRad(600.0) * seconds;
      if (this._owner.transform.rotation.z < MathUtils.degToRad(-20)) {
        this._owner.transform.rotation.z = MathUtils.degToRad(-20);
      }
    }

    if (this.isFalling() || !this._isAlive) {
      this._owner.transform.rotation.z += MathUtils.degToRad(480.0) * seconds;
      if (this._owner.transform.rotation.z > MathUtils.degToRad(90)) {
        this._owner.transform.rotation.z = MathUtils.degToRad(90);
      }
    }

    if (this.shouldNotFlap()) {
      this._sprite && this._sprite.stop();
    } else {
      if (this._sprite && !this._sprite.isPlaying) {
        this._sprite.play();
      }
    }

    super.update(time);
  }

  public onMessage(message: Message): void {
    switch (message.code) {
      case "MOUSE_DOWN":
        this.onFlap();
        break;
      case "COLLISION_ENTRY":
        let data: CollisionData = message.context as CollisionData;
        if (data.a.name !== this._playerCollisionComponent && data.b.name !== this._playerCollisionComponent) {
          return;
        }
        if (data.a.name === this._groundCollisionComponent || data.b.name === this._groundCollisionComponent) {
          this.die();
          this.decelerate();
        } else if (this._pipeNames.indexOf(data.a.name!) !== -1 || this._pipeNames.indexOf(data.b.name!) !== -1) {
          this.die();
        } else if (data.a.name === this._scoreCollisionComponent || data.b.name === this._scoreCollisionComponent) {
          if (this._isAlive && this._isPlaying) {
            this.setScore(this._score + 1);
            AudioManager.playSound("ting");
          }
        }
        break;

      // Shows the tutorial, click to GAME_START
      case "GAME_RESET":
        Message.send("GAME_HIDE", this);
        Message.send("RESET_HIDE", this);
        Message.send("SPLASH_HIDE", this);
        Message.send("TUTORIAL_SHOW", this);
        this.reset();
        break;

      // Starts the main game.
      case "GAME_START":
        Message.send("GAME_SHOW", this);
        Message.send("RESET_HIDE", this);
        Message.send("SPLASH_HIDE", this);
        Message.send("TUTORIAL_HIDE", this);
        this._isPlaying = true;
        this._isAlive = true;
        this.start();
        break;

      // Zone is loaded, show play button/splash screen
      case "GAME_READY":
        Message.send("RESET_HIDE", this);
        Message.send("TUTORIAL_HIDE", this);
        Message.send("GAME_HIDE", this);
        Message.send("SPLASH_SHOW", this);
        break;

      // Show score and restart button
      case "PLAYER_DIED":
        Message.send("RESET_SHOW", this);
        break;
    }
  }

  private isFalling(): boolean {
    return this._velocity.y > 220.0;
  }

  private shouldNotFlap(): boolean {
    return !this._isPlaying || this._velocity.y > 220.0 || !this._isAlive;
  }

  private die(): void {
    if (this._isAlive) {
      this._isAlive = false;
      AudioManager.playSound("dead");
      Message.send("PLAYER_DIED", this);
    }
  }

  private reset(): void {
    if (this._sprite === undefined || this._sprite.owner === undefined) {
      throw new Error("AnimatedSpriteComponent or owner is undefined.");
    }
    this._isAlive = true;
    this._isPlaying = false;
    this._sprite.owner.transform.position.copyFrom(this._initialPosition);
    this._sprite.owner.transform.rotation.z = 0;
    this.setScore(0);

    this._velocity.set(0, 0);
    this._acceleration.set(0, 920);
    this._sprite.play();
  }

  private start(): void {
    this._isPlaying = true;
    Message.send("PLAYER_RESET", this);
  }

  private decelerate(): void {
    this._acceleration.y = 0;
    this._velocity.y = 0;
  }

  private onFlap(): void {
    if (this._isAlive && this._isPlaying) {
      this._velocity.y = -280;
      AudioManager.playSound("flap");
    }
  }

  private setScore(score: number): void {
    this._score = score;
    Message.send("counterText:SetText", this, this._score);
    Message.send("scoreText:SetText", this, this._score);

    if (this._score > this._highScore) {
      this._highScore = this._score;
      Message.send("bestText:SetText", this, this._highScore);
    }
  }
}
