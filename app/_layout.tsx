import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AppProvider, useColors } from '@/lib/AppContext';
import { LockScreen } from '@/components/LockScreen';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const colors = useColors();
  const { isLocked, authenticate, biometricSupported, biometricType } = useBiometricAuth();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

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

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
