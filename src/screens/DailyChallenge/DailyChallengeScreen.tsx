import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';

type Props = NativeStackScreenProps<RootStackParamList, 'DailyChallenge'>;

export function DailyChallengeScreen({navigation}: Props) {
  const theme = useAppTheme();

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
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Daily Challenge</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.center}>
          <Icon name="calendar-star" size={40} color={theme.colors.textMuted} />
          <Text style={{color: theme.colors.textMuted, marginTop: 8}}>A new challenge lands here every day.</Text>
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
  headerSpacer: {width: 28},
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
