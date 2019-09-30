export class SoundEffect {
  private _player: HTMLAudioElement | undefined;

  public assetPath: string;

  public constructor(assetPath: string, loop: boolean) {
    this.assetPath = assetPath;
    this._player = new Audio(assetPath);
    this._player.loop = loop;
  }


  public get loop(): boolean {
    if (this._player === undefined) {
      throw new Error('this player is not created or destroyed');
    }
    return this._player.loop;
  }


  public set loop(value: boolean) {
    if (this._player === undefined) {
      throw new Error('this player is not created or destroyed');
    }
    this._player.loop = value;
  }

  public destroy(): void {
    this._player = undefined;
  }

  public play(): void {
    if (this._player === undefined) {
      throw new Error('this player is not created or destroyed');
    }
    if (!this._player.paused) {
      this.stop();
    }

    this._player.play();
  }

  public pause(): void {
    if (this._player === undefined) {
      throw new Error('this player is not created or destroyed');
    }

    this._player.pause();
  }

  public stop(): void {
    if (this._player === undefined) {
      throw new Error('this player is not created or destroyed');
    }
    this._player.pause();
    this._player.currentTime = 0;
  }
}

export class AudioManager {
  private static _soundEffects: { [name: string]: SoundEffect } = {};

  public static loadSoundFile(name: string, assetPath: string, loop: boolean): void {
    AudioManager._soundEffects[name] = new SoundEffect(assetPath, loop);
  }

  public static playSound(name: string): void {
    if (AudioManager._soundEffects[name] !== undefined) {
      AudioManager._soundEffects[name].play();
    }
  }

  public static pauseSound(name: string): void {
    if (AudioManager._soundEffects[name] !== undefined) {
      AudioManager._soundEffects[name].pause();
    }
  }

  public static pauseAll(): void {
    const names = Object.keys(AudioManager._soundEffects);
    for (const name of names) {
      AudioManager._soundEffects[name].pause();
    }
  }

  public static stopSound(name: string): void {
    if (AudioManager._soundEffects[name] !== undefined) {
      AudioManager._soundEffects[name].stop();
    }
  }

  public static stopAll(): void {
    const names = Object.keys(AudioManager._soundEffects);
    for (const name of names) {
      AudioManager._soundEffects[name].stop();
    }
  }
}
