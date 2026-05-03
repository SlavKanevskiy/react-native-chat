import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Button } from 'react-native';
import { auth, db } from '../utils/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function AuthScreen() {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const [step, setStep] = useState<'email' | 'login' | 'register'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const checkEmail = async () => {
    if (!email.trim()) return Alert.alert(t('auth.title_email'), t('auth.error_email_empty'));
    setLoading(true);
    try {
      const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setStep('register');
      } else {
        setStep('login');
      }
    } catch (e: any) {
      Alert.alert(t('auth.title_email'), e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!password) return Alert.alert(t('auth.title_login'), t('auth.error_password_empty'));
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      Alert.alert(t('auth.title_login'), t('auth.error_login'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !password) return Alert.alert(t('auth.title_register'), t('auth.error_fill_all'));
    if (password !== confirmPassword) return Alert.alert(t('auth.title_register'), t('auth.error_passwords_dont_match'));
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase()
      });
      
      router.replace('/');
    } catch (e: any) {
      Alert.alert(t('auth.title_register'), e.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(nextLang);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.langToggle}>
        <Button title={i18n.language === 'ru' ? 'EN' : 'RU'} onPress={toggleLanguage} />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>
          {step === 'email' && t('auth.title_email')}
          {step === 'login' && t('auth.title_login')}
          {step === 'register' && t('auth.title_register')}
        </Text>

        {step === 'email' && (
          <>
            <TextInput
              style={styles.input}
              placeholder={t('auth.email_placeholder')}
              placeholderTextColor="#555"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <TouchableOpacity style={styles.button} onPress={checkEmail} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('auth.next')}</Text>}
            </TouchableOpacity>
          </>
        )}

        {step === 'login' && (
          <>
            <Text style={styles.subtitle}>{email}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.password_placeholder')}
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('auth.login_btn')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')} style={styles.link}>
              <Text style={styles.linkText}>{t('auth.change_email')}</Text>
            </TouchableOpacity>
          </>
        )}

        {step === 'register' && (
          <>
            <Text style={styles.subtitle}>{t('auth.subtitle_register', { email })}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('auth.first_name_placeholder')}
              placeholderTextColor="#555"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.last_name_placeholder')}
              placeholderTextColor="#555"
              value={lastName}
              onChangeText={setLastName}
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.password_placeholder')}
              placeholderTextColor="#555"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder={t('auth.confirm_password_placeholder')}
              placeholderTextColor="#555"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('auth.register_btn')}</Text>}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('email')} style={styles.link}>
              <Text style={styles.linkText}>{t('auth.change_email')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  langToggle: {
    alignItems: 'flex-end',
    padding: 15,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  link: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  }
});
