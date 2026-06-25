import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { auth } from '../utils/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { View, ActivityIndicator } from 'react-native';
import '../utils/i18n';
import { getAutochatConfig, isAutochatProfileEnabled } from '../utils/autochat';

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const autochatRedirectDoneRef = useRef(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usr) => {
      setUser(usr);
      if (initializing) setInitializing(false);
    });
    return unsubscribe;
  }, [initializing]);

  useEffect(() => {
    if (initializing) return;

    const inAuthGroup = segments[0] === 'auth';
    const inChatGroup = segments[0] === 'chat';

    if (!user && !inAuthGroup) {
      // Redirect to the login page.
      router.replace('/auth');
      return;
    }

    if (user && isAutochatProfileEnabled() && !autochatRedirectDoneRef.current) {
      const config = getAutochatConfig();
      if (config && !inChatGroup) {
        autochatRedirectDoneRef.current = true;
        router.replace({
          pathname: '/chat/[id]',
          params: {
            id: config.chatId,
            chatName: config.chatName || 'Global chat',
            chatEmail: config.chatEmail || '',
          },
        });
        return;
      }
    }

    if (user && inAuthGroup) {
      // Redirect away from the login page.
      router.replace('/');
    }
  }, [user, initializing, segments]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'RNchat' }} />
      <Stack.Screen name="chat/[id]" options={{ title: '' }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
    </Stack>
  );
}
