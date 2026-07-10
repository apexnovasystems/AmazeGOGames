import React, {memo} from 'react';
import {Circle, Shadow} from '@shopify/react-native-skia';
import type {SharedValue} from 'react-native-reanimated';

export interface BallProps {
  cx: SharedValue<number>;
  cy: SharedValue<number>;
  radius: number;
  color: string;
  glowColor: string;
}

export const Ball = memo(function Ball({cx, cy, radius, color, glowColor}: BallProps) {
  return (
    <Circle cx={cx} cy={cy} r={radius} color={color}>
      <Shadow dx={0} dy={3} blur={8} color={glowColor} />
    </Circle>
  );
});
