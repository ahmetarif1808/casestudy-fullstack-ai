import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { sendMessage, getMessages, Message } from './src/api';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [nickname, setNickname] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Mesajları yükle
  const loadMessages = async () => {
    try {
      const response = await getMessages();
      setMessages(response.data);
    } catch (error) {
      console.error('Mesajlar yüklenemedi:', error);
    }
  };

  // İlk yükleme ve auto-refresh
  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000); // 5 saniyede bir
    return () => clearInterval(interval);
  }, []);

  // Mesaj gönder
  const handleSend = async () => {
    if (!text.trim() || loading) return;

    setLoading(true);
    try {
      await sendMessage(nickname || 'anonymous', text);
      setText('');
      await loadMessages();
    } catch (error: any) {
      Alert.alert('Hata', 'Mesaj gönderilemedi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Pull to refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await loadMessages();
    setRefreshing(false);
  };

  // Sentiment rengini belirle
  const getSentimentColor = (label: string) => {
    switch (label) {
      case 'positive':
        return '#10b981'; // Yeşil
      case 'negative':
        return '#ef4444'; // Kırmızı
      default:
        return '#6b7280'; // Gri (neutral)
    }
  };

  // Mesaj kartı render
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={styles.messageCard}>
      <View style={styles.messageHeader}>
        <Text style={styles.nickname}>{item.nickname}</Text>
        <View
          style={[
            styles.sentimentBadge,
            { backgroundColor: getSentimentColor(item.sentimentLabel) },
          ]}>
          <Text style={styles.sentimentText}>
            {item.sentimentLabel} ({(item.sentimentScore * 100).toFixed(1)}%)
          </Text>
        </View>
      </View>
      <Text style={styles.messageText}>{item.text}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.createdAt).toLocaleString('tr-TR')}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🤖 AI Sentiment Chat</Text>
          <Text style={styles.headerSubtitle}>
            Mesajların duygu analizi yapılıyor
          </Text>
        </View>

        {/* Mesaj Listesi */}
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id.toString()}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          inverted={false}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Henüz mesaj yok</Text>
              <Text style={styles.emptySubtext}>İlk mesajı sen gönder!</Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.nicknameInput}
            placeholder="Rumuz (opsiyonel)"
            value={nickname}
            onChangeText={setNickname}
            maxLength={20}
          />
          <View style={styles.messageInputRow}>
            <TextInput
              style={styles.messageInput}
              placeholder="Mesajını yaz..."
              value={text}
              onChangeText={setText}
              multiline
              maxLength={500}
              editable={!loading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                loading && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={loading || !text.trim()}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#1f2937',
    padding: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
  },
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  nickname: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sentimentText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 8,
  },
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 16,
  },
  nicknameInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 8,
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  messageInput: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  sendButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});