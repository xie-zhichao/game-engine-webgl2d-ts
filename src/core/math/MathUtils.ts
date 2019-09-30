export class MathUtils {
  static clamp(value: number, min: number, max: number): number {
    if (value < min) {
      return min;
    }
    if (value > max) {
      return max;
    }
    return value;
  }

  static degToRad(degrees: number): number {
    return degrees * Math.PI / 180.0;
  }

  static radToDeg(radians: number): number {
    return radians * 180.0 / Math.PI;
  }
}