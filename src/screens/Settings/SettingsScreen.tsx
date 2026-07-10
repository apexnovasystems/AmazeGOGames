import React from 'react';
import {Alert, Linking, ScrollView, StyleSheet, Switch, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useSettingsStore, ThemePreference} from '../../store/useSettingsStore';
import {useProgressStore} from '../../store/useProgressStore';
import {useStatsStore} from '../../store/useStatsStore';
import {useAchievementsStore} from '../../store/useAchievementsStore';
import {useDailyChallengeStore} from '../../store/useDailyChallengeStore';
import {AdsService} from '../../services/AdsService';
import {Card} from '../../components/Card';
import {Button} from '../../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const THEME_OPTIONS: {value: ThemePreference; label: string; icon: string}[] = [
  {value: 'system', label: 'System', icon: 'theme-light-dark'},
  {value: 'light', label: 'Light', icon: 'white-balance-sunny'},
  {value: 'dark', label: 'Dark', icon: 'weather-night'},
];

const PLAY_STORE_URL = 'market://details?id=com.paintroll.game';
const PLAY_STORE_WEB_URL = 'https://play.google.com/store/apps/details?id=com.paintroll.game';

export function SettingsScreen({navigation}: Props) {
  const theme = useAppTheme();
  const settings = useSettingsStore();
  const resetProgress = useProgressStore(state => state.resetProgress);
  const resetStats = useStatsStore(state => state.resetAll);
  const resetAchievements = useAchievementsStore(state => state.resetAll);
  const resetDaily = useDailyChallengeStore(state => state.resetAll);

  const handleRateApp = () => {
    Linking.openURL(PLAY_STORE_URL).catch(() => {
      Linking.openURL(PLAY_STORE_WEB_URL).catch(() => undefined);
    });
  };

  const handleResetProgress = () => {
    Alert.alert(
      'Reset Progress?',
      'This clears every level, star, coin, achievement, and streak. Purchased Remove Ads and owned themes will also be lost. This cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            resetProgress();
            resetStats();
            resetAchievements();
            resetDaily();
            navigation.navigate('Home');
          },
        },
      ],
    );
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
          <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Settings</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Card style={styles.section}>
            <Text style={[styles.sectionLabel, {color: theme.colors.textMuted}]}>Appearance</Text>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map(option => {
                const active = settings.themePreference === option.value;
                return (
                  <View
                    key={option.value}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: active ? theme.colors.primary : 'transparent',
                        borderColor: theme.colors.glassBorder,
                        borderRadius: theme.radius.md,
                      },
                    ]}
                    onTouchEnd={() => settings.setThemePreference(option.value)}>
                    <Icon
                      name={option.icon}
                      size={20}
                      color={active ? theme.colors.textOnPrimary : theme.colors.textSecondary}
                    />
                    <Text
                      style={{
                        color: active ? theme.colors.textOnPrimary : theme.colors.textSecondary,
                        fontSize: 12,
                        fontWeight: '600',
                        marginTop: 4,
                      }}>
                      {option.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.sectionLabel, {color: theme.colors.textMuted}]}>Audio & Feedback</Text>
            <SettingRow
              icon="volume-high"
              label="Sound Effects"
              value={settings.soundEnabled}
              onToggle={settings.toggleSound}
              theme={theme}
            />
            <SettingRow
              icon="music-note"
              label="Music"
              value={settings.musicEnabled}
              onToggle={settings.toggleMusic}
              theme={theme}
            />
            <SettingRow
              icon="vibrate"
              label="Vibration"
              value={settings.vibrationEnabled}
              onToggle={settings.toggleVibration}
              theme={theme}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.sectionLabel, {color: theme.colors.textMuted}]}>More</Text>
            <NavRow
              icon="trophy"
              label="Achievements"
              theme={theme}
              onPress={() => navigation.navigate('Achievements')}
            />
            <NavRow icon="cart" label="Shop" theme={theme} onPress={() => navigation.navigate('Shop')} />
            <NavRow icon="star-outline" label="Rate PaintRoll" theme={theme} onPress={handleRateApp} />
            <NavRow
              icon="shield-lock-outline"
              label="Privacy Options"
              theme={theme}
              onPress={() => {
                AdsService.openPrivacyOptions().then(shown => {
                  if (!shown) {
                    Alert.alert('Privacy Options', 'No additional ad privacy choices are required for your region.');
                  }
                });
              }}
            />
          </Card>

          <Card style={styles.section}>
            <Text style={[styles.sectionLabel, {color: theme.colors.textMuted}]}>Danger Zone</Text>
            <Button label="Reset Progress" variant="danger" size="md" fullWidth onPress={handleResetProgress} />
          </Card>

          <Text style={[styles.about, {color: theme.colors.textMuted}]}>PaintRoll v0.0.1</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SettingRow({
  icon,
  label,
  value,
  onToggle,
  theme,
}: {
  icon: string;
  label: string;
  value: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof useAppTheme>;
}) {
  return (
    <View style={styles.settingRow}>
      <Icon name={icon} size={20} color={theme.colors.textSecondary} />
      <Text style={[styles.settingLabel, {color: theme.colors.textPrimary}]}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{false: theme.colors.glassBorder, true: theme.colors.primary}}
        thumbColor={theme.colors.textOnPrimary}
      />
    </View>
  );
}

function NavRow({
  icon,
  label,
  theme,
  onPress,
}: {
  icon: string;
  label: string;
  theme: ReturnType<typeof useAppTheme>;
  onPress: () => void;
}) {
  return (
    <View style={styles.settingRow} onTouchEnd={onPress}>
      <Icon name={icon} size={20} color={theme.colors.textSecondary} />
      <Text style={[styles.settingLabel, {color: theme.colors.textPrimary}]}>{label}</Text>
      <Icon name="chevron-right" size={20} color={theme.colors.textMuted} />
    </View>
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
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  about: {
    textAlign: 'center',
    fontSize: 12,
  },
});
