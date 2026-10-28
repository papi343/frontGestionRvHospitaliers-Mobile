import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppointmentStatus } from '../types';
import { STATUS_CONFIG } from '../theme/colors';

interface Props {
  status: AppointmentStatus;
}

export default function StatusBadge({ status }: Props) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.PENDING;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});
