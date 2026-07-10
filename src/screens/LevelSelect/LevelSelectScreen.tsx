import React, {useMemo} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList, LevelDefinition} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useProgressStore} from '../../store/useProgressStore';
import {LevelLoader} from '../../engine/LevelLoader';
import {LevelCard} from './LevelCard';

type Props = NativeStackScreenProps<RootStackParamList, 'LevelSelect'>;

const NUM_COLUMNS = 3;

export function LevelSelectScreen({navigation, route}: Props) {
  const theme = useAppTheme();
  const packId = route.params?.packId ?? LevelLoader.getAllPacks()[0]?.packId;
  const pack = LevelLoader.getPack(packId ?? '') ?? LevelLoader.getAllPacks()[0];

  const levelProgress = useProgressStore(state => state.levelProgress);
  const isLevelUnlocked = useProgressStore(state => state.isLevelUnlocked);
  const orderedIds = useMemo(() => LevelLoader.getOrderedLevelIds(), []);

  const handleSelect = (level: LevelDefinition) => {
    navigation.navigate('Game', {levelId: level.id});
  };

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Icon
            name="chevron-left"
            size={28}
            color={theme.colors.textPrimary}
            onPress={() => navigation.goBack()}
            suppressHighlighting
          />
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>{pack?.packName ?? 'Levels'}</Text>
          <View style={styles.headerSpacer} />
        </View>

        <FlatList
          data={pack?.levels ?? []}
          keyExtractor={item => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          renderItem={({item}) => (
            <LevelCard
              level={item}
              progress={levelProgress[item.id]}
              unlocked={isLevelUnlocked(item.id, item.order, orderedIds)}
              onPress={handleSelect}
            />
          )}
        />
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
  headerSpacer: {width: 28},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
});
