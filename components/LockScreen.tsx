import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import { Lock } from 'lucide-react-native';
import { ThemeColors } from '@/lib/theme';
import { BiometricType } from '@/hooks/useBiometricAuth';

interface LockScreenProps {
  colors: ThemeColors;
  onAuthenticate: () => Promise<void>;
  biometricSupported: boolean;
  biometricType: BiometricType;
}

export function LockScreen({ colors, onAuthenticate, biometricSupported, biometricType }: LockScreenProps) {
  const [error, setError] = useState<string | null>(null);
  const [attempting, setAttempting] = useState(false);
  const scaleAnim = useState(new Animated.Value(0.8))[0];
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    if (biometricSupported) {
      onAuthenticate().catch(() => setError('Authentication failed. Try again.'));
    }
  }, []);

  const handleRetry = async () => {
    setError(null);
    setAttempting(true);
    try {
      await onAuthenticate();
    } catch (e) {
      setError('Access denied. Even your phone doesn\'t trust you.');
    } finally {
      setAttempting(false);
    }
  };

  const promptText = !biometricSupported
    ? 'Biometric authentication isn\'t available on this device.'
    : biometricType === 'facial'
      ? 'Look at your phone to unlock'
      : 'Touch the sensor to unlock';

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Image source={require('@/assets/images/wom-icon.png')} style={styles.brandIcon} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Who Owes Me?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {promptText}
        </Text>

        {error && (
          <View style={[styles.errorBox, { backgroundColor: colors.danger + '15', borderColor: colors.danger + '40' }]}>
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {biometricSupported && (
          <TouchableOpacity
            onPress={handleRetry}
            disabled={attempting}
            style={[styles.unlockBtn, { backgroundColor: colors.primary, opacity: attempting ? 0.6 : 1 }]}
            activeOpacity={0.8}
          >
            <Lock size={18} color="#FFF" strokeWidth={2.5} />
            <Text style={styles.unlockBtnText}>{attempting ? 'Authenticating...' : 'Tap to Unlock'}</Text>
          </TouchableOpacity>
        )}

        {!biometricSupported && (
          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            Disable App Lock in Settings to access your debts.
          </Text>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  content: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1.5,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
  },
  brandIcon: {
    width: 76,
    height: 76,
    borderRadius: 22,
  },
  errorBox: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    marginBottom: 20,
    width: '100%',
  },
  errorText: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  unlockBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
    width: '100%',
  },
  unlockBtnText: {
    color: '#FFF',
    fontFamily: 'Outfit_400Regular',
    fontSize: 17,
    fontWeight: '700',
  },
  hint: {
    fontFamily: 'Outfit_400Regular',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
  },
});
