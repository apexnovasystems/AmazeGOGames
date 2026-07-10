import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useAppTheme} from '../../hooks/useAppTheme';
import {Button} from '../Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Last-resort safety net around the whole app. A crash anywhere in the tree
 * (a bad level payload, a native module hiccup, etc.) would otherwise leave
 * players staring at a blank/frozen screen in a release build, with no way
 * back in but force-closing the app. This swaps in a friendly recovery
 * screen instead.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {hasError: false};

  static getDerivedStateFromError(): ErrorBoundaryState {
    return {hasError: true};
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.warn('[ErrorBoundary] caught error', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({hasError: false});
  };

  render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={this.handleReset} />;
    }
    return this.props.children;
  }
}

function ErrorFallback({onReset}: {onReset: () => void}) {
  const theme = useAppTheme();

  return (
    <LinearGradient
      colors={[theme.colors.backgroundGradientStart, theme.colors.backgroundGradientEnd]}
      style={styles.flex}>
      <View style={styles.center}>
        <Icon name="emoticon-sad-outline" size={56} color={theme.colors.danger} />
        <Text style={[styles.title, {color: theme.colors.textPrimary}]}>Something went wrong</Text>
        <Text style={[styles.subtitle, {color: theme.colors.textMuted}]}>
          PaintRoll hit an unexpected snag. Your progress is saved — tap below to keep playing.
        </Text>
        <Button label="Try Again" size="lg" onPress={onReset} style={styles.button} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
  },
});
