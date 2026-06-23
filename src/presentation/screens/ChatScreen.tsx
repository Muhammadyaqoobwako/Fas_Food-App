import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useApp } from '../state/AppContext';
import { COLORS, SPACING, FONTS, globalStyles } from '../styles/theme';
import { Ionicons } from '@expo/vector-icons';

type ChatScreenRouteProp = RouteProp<RootStackParamList, 'Chat'>;

export const ChatScreen = () => {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation();
  const { orderId, customerName, riderName } = route.params;

  const { cashier, chatMessages, sendChatMessage } = useApp();
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const currentUser = cashier?.username || '';
  const currentRole = cashier?.role === 'driver' ? 'rider' : 'customer';

  // Filter messages for this specific order
  const messages = chatMessages.filter(msg => msg.orderId === orderId);

  // Auto scroll to end when messages load/update
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!text.trim()) return;
    await sendChatMessage(orderId, text.trim());
    setText('');
  };

  const getRecipientName = () => {
    return currentRole === 'customer' ? riderName : customerName;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Info Header */}
        <View style={styles.headerInfo}>
          <View style={styles.avatarMini}>
            <Ionicons name="chatbubbles-outline" size={20} color="#FFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.recipientName}>{getRecipientName()}</Text>
            <Text style={styles.orderRef}>
              Order Ref: {orderId.substring(0, 10).toUpperCase()} • {currentRole === 'customer' ? 'Delivery Rider' : 'Valued Customer'}
            </Text>
          </View>
        </View>

        {/* Message Feed */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageList}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Ionicons name="chatbubble-ellipses-outline" size={48} color={COLORS.borderLight} />
              <Text style={styles.emptyText}>No messages yet. Send a message to coordinate the delivery.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMe = item.sender.toLowerCase() === currentUser.toLowerCase();
            const messageTime = item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';

            return (
              <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowOther]}>
                {!isMe && (
                  <View style={styles.senderAvatar}>
                    <Text style={styles.senderAvatarText}>
                      {item.sender.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.senderName, isMe ? styles.senderNameMe : styles.senderNameOther]}>
                    {isMe ? 'You' : item.sender} ({item.senderRole === 'rider' ? 'Rider' : 'Customer'})
                  </Text>
                  <Text style={styles.messageText}>{item.message}</Text>
                  <Text style={styles.messageTime}>{messageTime}</Text>
                </View>
              </View>
            );
          }}
        />

        {/* Footer Chat Input */}
        <View style={styles.footerInputRow}>
          <TextInput
            style={styles.chatInput}
            value={text}
            onChangeText={setText}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.textSecondary}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !text.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardContainer: {
    flex: 1,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  avatarMini: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  headerTextContainer: {
    flex: 1,
  },
  recipientName: {
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    fontSize: FONTS.md,
  },
  orderRef: {
    color: COLORS.textSecondary,
    fontSize: FONTS.xs,
    marginTop: 2,
  },
  messageList: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: FONTS.sm,
    textAlign: 'center',
    marginTop: SPACING.md,
    marginHorizontal: SPACING.xl,
    lineHeight: 20,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
    maxWidth: '85%',
  },
  messageRowMe: {
    alignSelf: 'flex-end',
  },
  messageRowOther: {
    alignSelf: 'flex-start',
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    marginBottom: 2,
  },
  senderAvatarText: {
    color: '#FFF',
    fontSize: FONTS.xs,
    fontWeight: 'bold',
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: COLORS.cardBgElevated,
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  senderName: {
    fontSize: FONTS.xs - 2,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  senderNameMe: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  senderNameOther: {
    color: COLORS.secondary,
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  footerInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#1E1E24',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    color: COLORS.textPrimary,
    fontSize: FONTS.sm,
    maxHeight: 100,
    minHeight: 38,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
});
