import React, {useCallback, useEffect, useRef, useState} from 'react';
import {LayoutChangeEvent, Pressable, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {runOnJS} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Direction, RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useBallPosition} from '../../hooks/useBallPosition';
import {useGameTimer} from '../../hooks/useGameTimer';
import {useGameStore} from '../../store/useGameStore';
import {useProgressStore} from '../../store/useProgressStore';
import {LevelLoader} from '../../engine/LevelLoader';
import {WinEngine} from '../../engine/WinEngine';
import {createSwipeGesture} from '../../engine/SwipeEngine';
import {Grid, computeGridLayout} from '../../components/Grid/Grid';
import {GameHUD, CurrencyBadge} from '../../components/HUD';
import {ConfettiOverlay} from '../../components/Particles/ConfettiOverlay';
import {GameConfig} from '../../constants/gameConfig';
import {SoundService} from '../../services/SoundService';
import {PauseModal} from '../Pause/PauseModal';
import {VictoryModal} from './VictoryModal';
import {FailedModal} from './FailedModal';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

const DIRECTION_LABEL: Record<string, string> = {
  UP: 'Up',
  DOWN: 'Down',
  LEFT: 'Left',
  RIGHT: 'Right',
};

export function GameScreen({navigation, route}: Props) {
  const theme = useAppTheme();
  const {levelId} = route.params;

  const level = useGameStore(state => state.level);
  const gameState = useGameStore(state => state.gameState);
  const hint = useGameStore(state => state.hint);
  const loadLevel = useGameStore(state => state.loadLevel);
  const move = useGameStore(state => state.move);
  const undo = useGameStore(state => state.undo);
  const restart = useGameStore(state => state.restart);
  const pause = useGameStore(state => state.pause);
  const resume = useGameStore(state => state.resume);
  const tick = useGameStore(state => state.tick);
  const requestHint = useGameStore(state => state.requestHint);
  const unlockTile = useGameStore(state => state.unlockTile);
  const coins = useProgressStore(state => state.coins);

  const [containerSize, setContainerSize] = useState({width: 0, height: 0});
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const previousPaintedCount = useRef<number | null>(null);
  const previousStatus = useRef<string | null>(null);

  useEffect(() => {
    loadLevel(levelId);
  }, [levelId, loadLevel]);

  useGameTimer(gameState?.status ?? 'idle', tick);

  useEffect(() => {
    if (!gameState) {
      return;
    }
    if (previousPaintedCount.current !== null && gameState.paintedCount > previousPaintedCount.current) {
      SoundService.play('paint');
    }
    previousPaintedCount.current = gameState.paintedCount;

    if (gameState.status === 'won' && previousStatus.current !== 'won') {
      setConfettiTrigger(n => n + 1);
    }
    previousStatus.current = gameState.status;
  }, [gameState]);

  const layout = level
    ? computeGridLayout(level.rows, level.cols, containerSize.width, containerSize.height)
    : {cellSize: 0, boardWidth: 0, boardHeight: 0};
  const gap = GameConfig.TILE_GAP;

  const ballRow = gameState?.ballPosition.row ?? 0;
  const ballCol = gameState?.ballPosition.col ?? 0;
  const {cx, cy} = useBallPosition(ballRow, ballCol, layout.cellSize, gap);

  const handleSwipe = useCallback(
    (direction: Direction) => {
      SoundService.play('swipe');
      move(direction);
    },
    [move],
  );

  const handleTap = useCallback(
    (x: number, y: number) => {
      const col = Math.floor(x / (layout.cellSize + gap));
      const row = Math.floor(y / (layout.cellSize + gap));
      if (!level || row < 0 || col < 0 || row >= level.rows || col >= level.cols) {
        return;
      }
      unlockTile({row, col});
    },
    [layout.cellSize, gap, level, unlockTile],
  );

  const swipeGesture = createSwipeGesture(handleSwipe);
  const tapGesture = Gesture.Tap().onEnd(event => {
    'worklet';
    runOnJS(handleTap)(event.x, event.y);
  });
  const composedGesture = Gesture.Race(swipeGesture, tapGesture);

  const handleLayout = (event: LayoutChangeEvent) => {
    const {width, height} = event.nativeEvent.layout;
    setContainerSize({width, height});
  };

  if (!level || !gameState) {
    return (
      <LinearGradient colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]} style={styles.flex} />
    );
  }

  const nextLevel = LevelLoader.getNextLevel(level.id);
  const projectedStars =
    gameState.status === 'won' ? WinEngine.rateStars(gameState.moveCount, level.starThresholds).stars : 0;

  return (
    <LinearGradient colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]} style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Icon
            name="pause"
            size={24}
            color={theme.colors.textPrimary}
            onPress={pause}
            suppressHighlighting
          />
          <Text style={[styles.title, {color: theme.colors.textPrimary}]} numberOfLines={1}>
            {level.name}
          </Text>
          <CurrencyBadge icon="hexagon-multiple" value={coins} tint={theme.colors.coin} />
        </View>

        <GameHUD
          moveCount={gameState.moveCount}
          elapsedMs={gameState.elapsedMs}
          timeLimitMs={level.parTimeSeconds * 1000}
          paintedCount={gameState.paintedCount}
          paintableTotal={gameState.paintableTotal}
        />

        {hint && (
          <View style={[styles.hintBanner, {backgroundColor: theme.colors.glass, borderColor: theme.colors.glassBorder}]}>
            <Icon name="lightbulb-on" size={16} color={theme.colors.warning} />
            <Text style={[styles.hintText, {color: theme.colors.textPrimary}]}>
              Try swiping {DIRECTION_LABEL[hint.direction]}
            </Text>
          </View>
        )}

        <View style={styles.boardArea} onLayout={handleLayout}>
          {layout.cellSize > 0 && (
            <GestureDetector gesture={composedGesture}>
              <View>
                <Grid grid={gameState.grid} layout={layout} theme={theme} ballX={cx} ballY={cy} />
              </View>
            </GestureDetector>
          )}
        </View>

        <View style={styles.toolbar}>
          <ToolbarButton
            icon="undo"
            label="Undo"
            disabled={gameState.history.length === 0 || gameState.status !== 'playing'}
            onPress={undo}
            theme={theme}
          />
          <ToolbarButton icon="restart" label="Restart" onPress={restart} theme={theme} />
          <ToolbarButton
            icon="lightbulb-on-outline"
            label={`Hint (${GameConfig.HINT_COIN_COST})`}
            disabled={gameState.hintsUsed >= GameConfig.MAX_HINTS_PER_LEVEL}
            onPress={requestHint}
            theme={theme}
          />
        </View>
      </SafeAreaView>

      <ConfettiOverlay
        trigger={confettiTrigger}
        colors={[theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.star]}
      />

      <PauseModal
        visible={gameState.status === 'paused'}
        onResume={resume}
        onRestart={restart}
        onExit={() => navigation.goBack()}
      />

      <VictoryModal
        visible={gameState.status === 'won'}
        stars={projectedStars}
        moveCount={gameState.moveCount}
        coinsEarned={level.coinsReward}
        hasNextLevel={Boolean(nextLevel)}
        onNext={() => nextLevel && loadLevel(nextLevel.id)}
        onReplay={restart}
        onExit={() => navigation.goBack()}
      />

      <FailedModal
        visible={gameState.status === 'lost'}
        paintedCount={gameState.paintedCount}
        paintableTotal={gameState.paintableTotal}
        onRetry={restart}
        onExit={() => navigation.goBack()}
      />
    </LinearGradient>
  );
}

function ToolbarButton({
  icon,
  label,
  onPress,
  disabled,
  theme,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <Pressable
      disabled={disabled}
      onPress={() => {
        SoundService.play('click');
        onPress();
      }}
      hitSlop={12}
      style={[
        styles.toolbarButton,
        {
          backgroundColor: theme.colors.glass,
          borderColor: theme.colors.glassBorder,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.4 : 1,
        },
      ]}>
      <Icon name={icon} size={20} color={theme.colors.textPrimary} />
      <Text style={[styles.toolbarLabel, {color: theme.colors.textSecondary}]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
  },
  hintBanner: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
  },
  hintText: {
    fontSize: 13,
    fontWeight: '600',
  },
  boardArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  toolbarButton: {
    flex: 1,
    maxWidth: 140,
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
    borderWidth: 1,
  },
  toolbarLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
