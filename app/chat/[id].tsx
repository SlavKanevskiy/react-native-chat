import {Stack, useLocalSearchParams} from 'expo-router';
import {collection, doc, onSnapshot, orderBy, query, serverTimestamp, writeBatch} from 'firebase/firestore';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import ChatItem from '../../components/ChatItem';
import MessageInput from '../../components/MessageInput';
import MessageItem from '../../components/MessageItem';
import {auth, db} from '../../utils/firebase';

export default function ChatScreen() {
  const { t } = useTranslation();
  const CURRENT_USER_ID = auth.currentUser?.uid;
  const { id, chatName, chatEmail } = useLocalSearchParams();
  const chatId = id as string;
  const displayName = (chatName as string) || t('chatList.unknown_chat');
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc')); // Fetch newest first

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs: any[] = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching messages: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    if (newMessage.trim() === '') return;

    const text = newMessage;
    setNewMessage(''); // optimistic clear

    try {
      const batch = writeBatch(db);

      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const newMessageRef = doc(messagesRef); // Auto-generates an ID
      batch.set(newMessageRef, {
        senderId: CURRENT_USER_ID,
        text: text,
        timestamp: serverTimestamp()
      });

      const chatRef = doc(db, 'chats', chatId);
      batch.update(chatRef, {
        lastMessageTimestamp: serverTimestamp()
      });

      await batch.commit();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => {
    const isMine = item.senderId === CURRENT_USER_ID;
    return <MessageItem item={item} isMine={isMine} />;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 130}
    >
      <Stack.Screen options={{
        headerTitle: () => (
          <ChatItem
            item={{ chatName: displayName, chatEmail: chatEmail as string || '' }}
            onPress={() => {}}
          />
        )
      }} />
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        inverted // Messages are fetched desc, so invert flatlist to show newest at bottom
        contentContainerStyle={styles.messagesList}
      />
      <MessageInput
        message={newMessage}
        setMessage={setNewMessage}
        onSend={sendMessage}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
});
