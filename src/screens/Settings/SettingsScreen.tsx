import React from 'react';
import {ScrollView, StyleSheet, Switch, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../../types';
import {useAppTheme} from '../../hooks/useAppTheme';
import {useSettingsStore, ThemePreference} from '../../store/useSettingsStore';
import {Card} from '../../components/Card';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const THEME_OPTIONS: {value: ThemePreference; label: string; icon: string}[] = [
  {value: 'system', label: 'System', icon: 'theme-light-dark'},
  {value: 'light', label: 'Light', icon: 'white-balance-sunny'},
  {value: 'dark', label: 'Dark', icon: 'weather-night'},
];

export function SettingsScreen({navigation}: Props) {
  const theme = useAppTheme();
  const settings = useSettingsStore();

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
});
