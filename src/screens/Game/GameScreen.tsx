import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {LevelLoader} from '../../engine/LevelLoader';

type Props = NativeStackScreenProps<RootStackParamList, 'Game'>;

export function GameScreen({navigation, route}: Props) {
  const theme = useAppTheme();
  const level = LevelLoader.getLevelById(route.params.levelId);

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Icon
            name="close"
            size={26}
            color={theme.colors.textPrimary}
            onPress={() => navigation.goBack()}
            suppressHighlighting
          />
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>{level?.name ?? 'Level'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.center}>
          <Text style={{color: theme.colors.textMuted}}>
            {level ? `${level.rows} x ${level.cols} grid — ${level.difficulty}` : 'Level not found'}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerSpacer: {width: 26},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
