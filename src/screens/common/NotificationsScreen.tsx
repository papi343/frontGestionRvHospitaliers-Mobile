import React, { useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDateFr, formatTimeFr } from '../../utils/dateFormat';

export default function NotificationsScreen() {
  const { notifications, fetchNotifications, markNotificationRead } = useAuthStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter((n) => !n.lu).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>🔔 Notifications</Text>
          <Text style={styles.sub}>
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : 'Toutes vos notifications sont à jour'}
          </Text>
        </View>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        onRefresh={fetchNotifications}
        refreshing={false}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Aucune notification</Text>
            <Text style={styles.emptySub}>
              Les alertes de rendez-vous et comptes-rendus apparaîtront ici en temps réel.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.lu && styles.cardUnread]}
            onPress={() => {
              if (!item.lu) markNotificationRead(item.id);
            }}
          >
            <View style={styles.row}>
              <View style={[styles.dot, item.lu ? styles.dotRead : styles.dotUnread]} />
              <View style={styles.content}>
                <Text style={[styles.message, !item.lu && styles.messageUnread]}>
                  {item.message}
                </Text>
                <Text style={styles.date}>
                  {formatDateFr(item.createdAt)} à {formatTimeFr(item.createdAt)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  sub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardUnread: {
    backgroundColor: COLORS.primaryLight,
    borderColor: '#BAE6FD',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  dotUnread: {
    backgroundColor: COLORS.primary,
  },
  dotRead: {
    backgroundColor: COLORS.textMuted,
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  messageUnread: {
    fontWeight: '700',
  },
  date: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  emptyBox: {
    padding: 36,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
});
