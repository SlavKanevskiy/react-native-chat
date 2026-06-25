import autochatConfig from './autochat.config';

type AutochatConfig = {
  email: string;
  password: string;
  chatId: string;
  chatName?: string;
  chatEmail?: string;
};

const AUTOCHAT_PROFILE = 'autochat';

// Capture URL params once at module load — before Expo Router navigates away
// and changes window.location (losing the query string).
const _initialParams: Record<string, string> = (() => {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  p.forEach((value, key) => { result[key] = value.trim(); });
  return result;
})();

function urlParam(key: string): string {
  return _initialParams[key] ?? '';
}

/**
 * Autochat is enabled if:
 *  - EXPO_PUBLIC_APP_PROFILE=autochat (build-time, via yarn start:autochat), OR
 *  - Initial URL had ?email=...&password=...&chatId=... (runtime, iframe embed)
 */
export const isAutochatProfileEnabled = (): boolean => {
  if (process.env.EXPO_PUBLIC_APP_PROFILE === AUTOCHAT_PROFILE) return true;
  return !!(urlParam('email') && urlParam('password') && urlParam('chatId'));
};

export const getAutochatConfig = (): AutochatConfig | null => {
  const email =
    urlParam('email') ||
    process.env.EXPO_PUBLIC_AUTOCHAT_EMAIL?.trim() ||
    autochatConfig.email?.trim();

  const password =
    urlParam('password') ||
    process.env.EXPO_PUBLIC_AUTOCHAT_PASSWORD?.trim() ||
    autochatConfig.password?.trim();

  const chatId =
    urlParam('chatId') ||
    process.env.EXPO_PUBLIC_AUTOCHAT_CHAT_ID?.trim() ||
    autochatConfig.chatId?.trim();

  const chatName =
    urlParam('chatName') ||
    process.env.EXPO_PUBLIC_AUTOCHAT_CHAT_NAME?.trim() ||
    autochatConfig.chatName?.trim();

  const chatEmail =
    urlParam('chatEmail') ||
    process.env.EXPO_PUBLIC_AUTOCHAT_CHAT_EMAIL?.trim() ||
    autochatConfig.chatEmail?.trim();

  if (!email || !password || !chatId || !isAutochatProfileEnabled()) {
    return null;
  }

  return { email, password, chatId, chatName, chatEmail };
};
