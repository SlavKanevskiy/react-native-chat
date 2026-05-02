import React from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';

export default function CreateChatInput({
  email,
  setEmail,
  onAddUser,
  addingUser,
  hasError
}: {
  email: string,
  setEmail: (val: string) => void,
  onAddUser: () => void,
  addingUser: boolean,
  hasError?: boolean
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.addUserContainer}>
      <TextInput
        style={[styles.addUserInput, hasError && styles.errorInput]}
        placeholder={t('chatList.placeholder_email')}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TouchableOpacity style={styles.addUserButton} onPress={onAddUser} disabled={addingUser}>
        {addingUser ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.addUserButtonText}>{t('chatList.btn_create')}</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  addUserContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  addUserInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    marginRight: 10,
  },
  addUserButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 90,
  },
  addUserButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorInput: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  }
});
