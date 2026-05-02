import {useRouter} from 'expo-router';
import {addDoc, collection, documentId, getDocs, onSnapshot, query, serverTimestamp, where} from 'firebase/firestore';
import React, {useEffect, useState} from 'react';
import {ActivityIndicator, Button, FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {db} from '../utils/firebase';

const CURRENT_USER_ID = 'DhqIGBMyZKh8p0PNOB7N';

export default function ChatListScreen() {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("Initializing chat query for user:", CURRENT_USER_ID);
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', CURRENT_USER_ID)
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      console.log("Chats snapshot received, documents:", querySnapshot);
      const chatData: any[] = [];
      const userIdsToFetch = new Set<string>();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants) {
            data.participants.forEach((uid: string) => {
              if (uid !== CURRENT_USER_ID) {
                  userIdsToFetch.add(uid);
              } else if (data.participants.length === 1) {
                  // myself chat
                  userIdsToFetch.add(uid);
              }
            });
        }
        chatData.push({ id: doc.id, ...data });
      });

      // Fetch user details for other participants
      const usersMap: Record<string, any> = {};
      if (userIdsToFetch.size > 0) {
         const usersRef = collection(db, 'users');
         // Firestore 'in' query supports max 10 elements.
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
            // Чат с самим собой
            targetUserId = CURRENT_USER_ID;
        }

        const targetUser = targetUserId ? usersMap[targetUserId] : null;

        let chatName = 'Unknown Chat';
        if (targetUser) {
           chatName = `${targetUser.firstName} ${targetUser.lastName}`;
           if (targetUserId === CURRENT_USER_ID) {
               chatName += ' (Вы)';
           }
        }

        return {
          ...chat,
          chatName,
          chatEmail: targetUser?.email || ''
        };
      });

      // Sort by lastMessageTimestamp if available
      formattedChats.sort((a, b) => {
        const timeA = a.lastMessageTimestamp?.toMillis() || 0;
        const timeB = b.lastMessageTimestamp?.toMillis() || 0;
        return timeB - timeA; // Descending
      });

      setChats(formattedChats);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching chats: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createTestChat = async () => {
    try {
      // Create a dummy user first so we have a name
      const testUserId = 'test_user_' + Math.floor(Math.random() * 1000);
      /*
        We are not actually creating the user doc here to keep it simple,
        it will just show "Unknown Chat" if user doc doesn't exist,
        which is fine for testing the list.
      */

      const docRef = await addDoc(collection(db, 'chats'), {
        participants: [CURRENT_USER_ID, testUserId],
        lastMessageTimestamp: serverTimestamp()
      });
      console.log("Test chat created with ID: ", docRef.id);
    } catch (e) {
      console.error("Error creating test chat: ", e);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push(`/chat/${item.id}`)}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.chatName.charAt(0)}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{item.chatName}</Text>
        {!!item.chatEmail && <Text style={styles.chatEmail}>{item.chatEmail}</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={styles.emptyText}>У вас пока нет чатов</Text>
            <View style={{ marginTop: 20 }}>
              <Button title="Создать тестовый чат" onPress={createTestChat} />
            </View>
          </View>
        }
      />
      {chats.length > 0 && (
         <View style={{ padding: 20 }}>
           <Button title="Создать еще чат" onPress={createTestChat} />
         </View>
      )}
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
  emptyText: {
    fontSize: 16,
    color: '#666',
  }
});
