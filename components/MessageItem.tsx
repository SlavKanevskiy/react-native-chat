import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MessageItem({ item, isMine }: { item: any, isMine: boolean }) {
  return (
    <View style={[styles.messageBubble, isMine ? styles.myMessage : styles.theirMessage]}>
      <Text style={[styles.messageText, isMine ? styles.myMessageText : styles.theirMessageText]}>
        {item.text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#000',
  },
});
