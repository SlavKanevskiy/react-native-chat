import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ChatItem({ item, onPress }: { item: any, onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.chatItem} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.chatName.charAt(0)}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.chatName}</Text>
        {!!item.chatEmail && <Text style={styles.chatEmail}>{item.chatEmail}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
});
