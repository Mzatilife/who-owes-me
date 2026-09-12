import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useApp } from '@/lib/AppContext';

export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricAuthState {
  isLocked: boolean;
  biometricSupported: boolean;
  biometricType: BiometricType;
  authenticate: () => Promise<void>;
  hasHardware: boolean;
}

export function useBiometricAuth(): BiometricAuthState {
  const { state } = useApp();
  const enabled = state?.settings?.biometricEnabled ?? false;
  const [isLocked, setIsLocked] = useState(enabled);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>('none');
  const [hasHardware, setHasHardware] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsLocked(false);
      return;
    }

    if (Platform.OS === 'web') {
      setIsLocked(false);
      setBiometricSupported(false);
      return;
    }

    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setHasHardware(compatible);

      if (!compatible) {
        setBiometricSupported(false);
        setIsLocked(false);
        return;
      }

      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricSupported(enrolled);

      if (!enrolled) {
        setIsLocked(false);
        return;
      }

      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType('facial');
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType('iris');
      } else {
        setBiometricType('fingerprint');
      }

      setIsLocked(true);
    })();
  }, [enabled]);

  const authenticate = useCallback(async () => {
    if (Platform.OS === 'web' || !biometricSupported) {
      setIsLocked(false);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Unlock Who Owes Me',
      fallbackLabel: 'Use Passcode',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      setIsLocked(false);
    }
  }, [biometricSupported]);

  return {
    isLocked,
    biometricSupported,
    biometricType,
    authenticate,
    hasHardware,
  };
}
