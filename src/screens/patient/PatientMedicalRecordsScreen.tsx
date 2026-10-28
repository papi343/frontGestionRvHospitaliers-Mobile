import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { hospitalApi } from '../../api/services';
import { Appointment } from '../../types';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDateFr, formatTimeRangeFr } from '../../utils/dateFormat';

export default function PatientMedicalRecordsScreen() {
  const { user } = useAuthStore();
  const [records, setRecords] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    const list = await hospitalApi.getAppointments({
      patientId: user?.patientId || undefined,
    });
    setRecords(list.filter((apt) => apt.medicalRecord !== null && apt.medicalRecord !== undefined));
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>📋 Mon Dossier Médical</Text>
        <Text style={styles.bannerSub}>
          Retrouvez l'historique complet des diagnostics rédigés par vos médecins
        </Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          onRefresh={loadRecords}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucun compte-rendu médical</Text>
              <Text style={styles.emptySub}>
                Vos diagnostics apparaîtront ici dès qu'un médecin aura complété votre consultation.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <Text style={styles.doctorName}>
                  🩺 {item.doctor?.nom || `Médecin #${item.doctorId}`}
                </Text>
                <Text style={styles.recordDate}>
                  {formatDateFr(item.availability?.start)}
                </Text>
              </View>
              <Text style={styles.slotSub}>
                Consultation : {formatTimeRangeFr(item.availability?.start, item.availability?.end)}
              </Text>

              <View style={styles.diagnosticContainer}>
                <Text style={styles.diagnosticLabel}>Diagnostic & Prescriptions :</Text>
                <Text style={styles.diagnosticContent}>
                  {item.medicalRecord?.diagnostic}
                </Text>
              </View>
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
  banner: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  bannerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  recordCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  recordDate: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  slotSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 12,
  },
  diagnosticContainer: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 14,
  },
  diagnosticLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 4,
  },
  diagnosticContent: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
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
    marginTop: 6,
    textAlign: 'center',
  },
});
