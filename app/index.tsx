import {Stack, useRouter} from 'expo-router';
import {addDoc, collection, documentId, getDocs, onSnapshot, query, serverTimestamp, where} from 'firebase/firestore';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Alert, Button, FlatList, StyleSheet, Text, View} from 'react-native';
import ChatItem from '../components/ChatItem';
import CreateChatInput from '../components/CreateChatInput';
import {auth, db} from '../utils/firebase';

export default function ChatListScreen() {
  const { t, i18n } = useTranslation();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newChatEmail, setNewChatEmail] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [hasEmailError, setHasEmailError] = useState(false);
  const router = useRouter();

  const CURRENT_USER_ID = auth.currentUser?.uid;

  useEffect(() => {
    if (!CURRENT_USER_ID) return;

    console.log("Initializing chat query for user:", CURRENT_USER_ID);
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', CURRENT_USER_ID)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const chatData: any[] = [];
      const userIdsToFetch = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants) {
          data.participants.forEach((uid: string) => {
            if (uid !== CURRENT_USER_ID) {
              userIdsToFetch.add(uid);
            } else if (data.participants.length === 1) {
              userIdsToFetch.add(uid);
            }
          });
        }
        chatData.push({ id: doc.id, ...data });
      });

      const usersMap: Record<string, any> = {};
      if (userIdsToFetch.size > 0) {
        const usersRef = collection(db, 'users');
        const userIdsArray = Array.from(userIdsToFetch).slice(0, 10);
        try {
          const usersQuery = query(usersRef, where(documentId(), 'in', userIdsArray));
          const usersSnapshot = await getDocs(usersQuery);
          usersSnapshot.forEach(doc => {
            usersMap[doc.id] = doc.data();
          });
        } catch (err) {
          console.error("Error fetching users:", err);
        }
      }

      const formattedChats = chatData.map(chat => {
        let targetUserId = chat.participants ? chat.participants.find((uid: string) => uid !== CURRENT_USER_ID) : null;
        if (!targetUserId && chat.participants && chat.participants.includes(CURRENT_USER_ID)) {
          targetUserId = CURRENT_USER_ID;
        }

        const targetUser = targetUserId ? usersMap[targetUserId] : null;

        let chatName = t('chatList.unknown_chat');
        if (targetUser) {
          chatName = `${targetUser.firstName} ${targetUser.lastName}`;
          if (targetUserId === CURRENT_USER_ID) {
            chatName += t('chatList.saved_messages_tag');
          }
        }

        return {
          ...chat,
          chatName,
          chatEmail: targetUser?.email || ''
        };
      });

      formattedChats.sort((a, b) => {
        const timeA = a.lastMessageTimestamp?.toMillis() || 0;
        const timeB = b.lastMessageTimestamp?.toMillis() || 0;
        return timeB - timeA;
      });

      setChats(formattedChats);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [CURRENT_USER_ID, t]);

  const handleAddUser = async () => {
    if (!CURRENT_USER_ID) return;
    if (!newChatEmail.trim()) {
      Alert.alert(t('auth.title_email'), t('chatList.error_email_empty'));
      return;
    }

    setAddingUser(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', newChatEmail.trim().toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert(t('auth.title_email'), t('chatList.error_user_not_found'));
        setHasEmailError(true);
        setAddingUser(false);
        return;
      }

      const otherUserId = querySnapshot.docs[0].id;

      const chatExists = chats.some(chat => {
        if (otherUserId === CURRENT_USER_ID) {
          return chat.participants?.length === 1;
        }
        return chat.participants?.includes(otherUserId);
      });

      if (chatExists) {
        Alert.alert(t('auth.title_email'), t('chatList.error_chat_exists'));
      } else {
        const otherUser = querySnapshot.docs[0].data();
        let chatName = `${otherUser.firstName} ${otherUser.lastName}`;
        if (otherUserId === CURRENT_USER_ID) {
          chatName += t('chatList.saved_messages_tag');
        }

        const participants = otherUserId === CURRENT_USER_ID ? [CURRENT_USER_ID] : [CURRENT_USER_ID, otherUserId];
        const docRef = await addDoc(collection(db, 'chats'), {
          participants,
          lastMessageTimestamp: serverTimestamp()
        });
        setNewChatEmail('');
        router.push({ pathname: '/chat/[id]', params: { id: docRef.id, chatName, chatEmail: otherUser.email } });
      }
    } catch (e: any) {
      console.error("Error creating chat: ", e);
      Alert.alert(t('auth.title_email'), e.message);
    } finally {
      setAddingUser(false);
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(nextLang);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <ChatItem item={item} onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.id, chatName: item.chatName, chatEmail: item.chatEmail } })} />
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{
        headerRight: () => (
          <View style={styles.headerRightContainer}>
            <Button title={i18n.language === 'ru' ? 'EN' : 'RU'} onPress={toggleLanguage} />
          </View>
        )
      }} />
      <CreateChatInput
        email={newChatEmail}
        setEmail={(val) => {
          setNewChatEmail(val);
          if (hasEmailError) setHasEmailError(false);
        }}
        onAddUser={handleAddUser}
        addingUser={addingUser}
        hasError={hasEmailError}
      />
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>{t('chatList.empty')}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  headerRightContainer: {
    marginRight: 20,
  }
});
