import React, {memo, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Canvas, RoundedRect} from '@shopify/react-native-skia';
import type {SharedValue} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LevelTile} from '../../types';
import {Theme} from '../../theme';
import {GameConfig} from '../../constants/gameConfig';
import {getTileBaseColor, tileIconName} from '../Tile/tileColor';
import {Ball} from '../Ball/Ball';

export interface GridLayout {
  cellSize: number;
  boardWidth: number;
  boardHeight: number;
}

export function computeGridLayout(rows: number, cols: number, maxWidth: number, maxHeight: number): GridLayout {
  const gap = GameConfig.TILE_GAP;
  const cellFromWidth = (maxWidth - gap * (cols - 1)) / cols;
  const cellFromHeight = (maxHeight - gap * (rows - 1)) / rows;
  const cellSize = Math.max(8, Math.floor(Math.min(cellFromWidth, cellFromHeight)));
  return {
    cellSize,
    boardWidth: cellSize * cols + gap * (cols - 1),
    boardHeight: cellSize * rows + gap * (rows - 1),
  };
}

export interface GridProps {
  grid: LevelTile[][];
  layout: GridLayout;
  theme: Theme;
  ballX: SharedValue<number>;
  ballY: SharedValue<number>;
}

export const Grid = memo(function Grid({grid, layout, theme, ballX, ballY}: GridProps) {
  const gap = GameConfig.TILE_GAP;
  const {cellSize, boardWidth, boardHeight} = layout;
  const cornerRadius = theme.radius.xs;

  const icons = useMemo(() => {
    const items: {key: string; x: number; y: number; name: string}[] = [];
    grid.forEach((row, r) => {
      row.forEach((tile, c) => {
        const name = tileIconName(tile);
        if (name) {
          items.push({
            key: `${r}-${c}`,
            x: c * (cellSize + gap),
            y: r * (cellSize + gap),
            name,
          });
        }
      });
    });
    return items;
  }, [grid, cellSize, gap]);

  return (
    <View style={{width: boardWidth, height: boardHeight}}>
      <Canvas style={StyleSheet.absoluteFill}>
        {grid.map((row, r) =>
          row.map((tile, c) => (
            <RoundedRect
              key={`${r}-${c}`}
              x={c * (cellSize + gap)}
              y={r * (cellSize + gap)}
              width={cellSize}
              height={cellSize}
              r={cornerRadius}
              color={getTileBaseColor(tile, theme.colors)}
            />
          )),
        )}
        <Ball
          cx={ballX}
          cy={ballY}
          radius={cellSize * 0.34}
          color={theme.colors.ballCore}
          glowColor={theme.colors.ballGlow}
        />
      </Canvas>
      {icons.map(icon => (
        <View
          key={icon.key}
          pointerEvents="none"
          style={[
            styles.iconWrap,
            {
              left: icon.x,
              top: icon.y,
              width: cellSize,
              height: cellSize,
            },
          ]}>
          <Icon name={icon.name} size={cellSize * 0.42} color={theme.colors.textOnPrimary} />
        </View>
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  iconWrap: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
