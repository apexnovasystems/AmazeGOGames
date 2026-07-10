import {ColorPalette} from '../../theme';
import {LevelTile, TileType} from '../../types';

/**
 * Resolves the fill color for a tile. Painted state visually dominates
 * (matches the "every tile the ball touches becomes painted" rule) —
 * special tile types keep their identity via a small icon overlay
 * instead of a competing base color once painted.
 */
export function getTileBaseColor(tile: LevelTile, colors: ColorPalette): string {
  if (tile.type === TileType.Wall) {
    return colors.tileWall;
  }
  if (tile.type === TileType.Obstacle) {
    return colors.tileObstacle;
  }
  if (tile.type === TileType.Void) {
    return 'transparent';
  }
  if (tile.type === TileType.Locked) {
    return colors.tileLocked;
  }

  if (tile.painted) {
    return colors.tilePainted;
  }

  switch (tile.type) {
    case TileType.Ice:
      return colors.tileIce;
    case TileType.Portal:
      return colors.tilePortal;
    case TileType.Teleport:
      return colors.tileTeleport;
    case TileType.Empty:
    default:
      return colors.tileEmpty;
  }
}

export function tileIconName(tile: LevelTile): string | null {
  switch (tile.type) {
    case TileType.Locked:
      return 'lock';
    case TileType.Ice:
      return 'snowflake';
    case TileType.Portal:
      return 'radar';
    case TileType.Teleport:
      return 'target';
    default:
      return null;
  }
}
