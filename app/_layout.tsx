import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import { SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider, useApp } from '@/lib/AppContext';
import { LockScreen } from '@/components/LockScreen';
import { OnboardingScreen } from '@/components/OnboardingScreen';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { configureDefaultTypography } from '@/lib/typography';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const { colors, state } = useApp();
  const { isLocked, authenticate, biometricSupported, biometricType } = useBiometricAuth();

  if (!state.onboardingComplete) {
    return <OnboardingScreen />;
  }

  if (isLocked) {
    return (
      <LockScreen
        colors={colors}
        onAuthenticate={authenticate}
        biometricSupported={biometricSupported}
        biometricType={biometricType}
      />
    );
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="add-debt" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="search" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="debt/[id]" options={{ presentation: 'card', animation: 'slide_from_right' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={colors.text === '#F5F5F7' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    SpaceGrotesk_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      configureDefaultTypography();
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
