import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { hospitalApi } from '../../api/services';
import { Appointment, AppointmentStatus } from '../../types';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import StatusBadge from '../../components/StatusBadge';
import { formatDateFr, formatTimeRangeFr } from '../../utils/dateFormat';

export default function PatientAppointmentsScreen() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'ALL'>('ALL');

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    const list = await hospitalApi.getAppointments({
      patientId: user?.patientId || undefined,
    });
    setAppointments(list);
    setLoading(false);
  };

  const handleCancel = (appointment: Appointment) => {
    Alert.alert(
      'Annuler le rendez-vous',
      `Confirmez-vous l'annulation de votre rendez-vous avec ${
        appointment.doctor?.nom || 'le médecin'
      } ?`,
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            await hospitalApi.updateAppointmentStatus(appointment.id, 'CANCELLED');
            loadAppointments();
          },
        },
      ]
    );
  };

  const filtered = appointments.filter((a) =>
    filterStatus === 'ALL' ? true : a.statut === filterStatus
  );

  const filters: { key: AppointmentStatus | 'ALL'; label: string }[] = [
    { key: 'ALL', label: 'Tous' },
    { key: 'PENDING', label: 'En attente' },
    { key: 'CONFIRMED', label: 'Confirmés' },
    { key: 'COMPLETED', label: 'Terminés' },
    { key: 'CANCELLED', label: 'Annulés' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        {filters.map((f) => {
          const active = filterStatus === f.key;
          return (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterTab, active && styles.filterTabActive]}
              onPress={() => setFilterStatus(f.key)}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onRefresh={loadAppointments}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucun rendez-vous trouvé</Text>
              <Text style={styles.emptySub}>
                Vos consultations réservées apparaîtront ici.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.doctorName}>
                    {item.doctor?.nom || `Médecin #${item.doctorId}`}
                  </Text>
                  <Text style={styles.licence}>
                    Licence : {item.doctor?.licence || 'N/A'}
                  </Text>
                </View>
                <StatusBadge status={item.statut} />
              </View>

              <View style={styles.dateBox}>
                <Text style={styles.dateText}>
                  📅 {formatDateFr(item.availability?.start)}
                </Text>
                <Text style={styles.timeText}>
                  🕒 {formatTimeRangeFr(item.availability?.start, item.availability?.end)}
                </Text>
              </View>

              {item.medicalRecord ? (
                <View style={styles.diagnosticBox}>
                  <Text style={styles.diagnosticTitle}>📋 Diagnostic / Compte-rendu médical :</Text>
                  <Text style={styles.diagnosticText}>{item.medicalRecord.diagnostic}</Text>
                </View>
              ) : null}

              {(item.statut === 'PENDING' || item.statut === 'CONFIRMED') && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancel(item)}
                >
                  <Text style={styles.cancelButtonText}>Annuler ce rendez-vous</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  filterBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 6,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.background,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  licence: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dateBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  timeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  diagnosticBox: {
    marginTop: 12,
    backgroundColor: COLORS.secondaryLight,
    borderRadius: 10,
    padding: 12,
  },
  diagnosticTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.secondary,
    marginBottom: 4,
  },
  diagnosticText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.dangerLight,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: COLORS.danger,
    fontWeight: '700',
    fontSize: 13,
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
