import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { hospitalApi } from '../../api/services';
import { Appointment, AppointmentStatus } from '../../types';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import StatusBadge from '../../components/StatusBadge';
import { formatDateFr, formatTimeRangeFr } from '../../utils/dateFormat';

export default function DoctorAppointmentsScreen() {
  const { user } = useAuthStore();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AppointmentStatus | 'ALL'>('ALL');

  // Medical record modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [diagnosticText, setDiagnosticText] = useState('');
  const [savingDiagnostic, setSavingDiagnostic] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    setLoading(true);
    const list = await hospitalApi.getAppointments({
      doctorId: user?.doctorId || 1,
    });
    setAppointments(list);
    setLoading(false);
  };

  const handleStatusChange = async (appointment: Appointment, newStatus: AppointmentStatus) => {
    try {
      await hospitalApi.updateAppointmentStatus(appointment.id, newStatus);
      loadAppointments();
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible de mettre à jour le statut.');
    }
  };

  const openDiagnosticModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setDiagnosticText(appointment.medicalRecord?.diagnostic || '');
  };

  const handleSaveDiagnostic = async () => {
    if (!selectedAppointment || !diagnosticText.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir un diagnostic médical.');
      return;
    }
    setSavingDiagnostic(true);
    try {
      if (selectedAppointment.medicalRecord?.id) {
        await hospitalApi.updateMedicalRecord(
          selectedAppointment.medicalRecord.id,
          diagnosticText.trim()
        );
      } else {
        await hospitalApi.createMedicalRecord(
          selectedAppointment.id,
          diagnosticText.trim()
        );
        if (selectedAppointment.statut !== 'COMPLETED') {
          await hospitalApi.updateAppointmentStatus(selectedAppointment.id, 'COMPLETED');
        }
      }
      setSelectedAppointment(null);
      loadAppointments();
      Alert.alert('Diagnostic enregistré ✅', 'Le dossier médical du patient a été mis à jour.');
    } catch (err: any) {
      Alert.alert(
        'Erreur',
        err.response?.data?.message || err.message || "Erreur lors de l'enregistrement."
      );
    } finally {
      setSavingDiagnostic(false);
    }
  };

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.statut === 'PENDING').length,
    confirmed: appointments.filter((a) => a.statut === 'CONFIRMED').length,
    completed: appointments.filter((a) => a.statut === 'COMPLETED').length,
  };

  const filtered = appointments.filter((a) =>
    filterStatus === 'ALL' ? true : a.statut === filterStatus
  );

  return (
    <View style={styles.container}>
      <View style={styles.statsHeader}>
        <Text style={styles.doctorWelcome}>🩺 Espace Praticien — {user?.nom}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total RDV</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#FDE047' }]}>{stats.pending}</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#93C5FD' }]}>{stats.confirmed}</Text>
            <Text style={styles.statLabel}>Confirmés</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: '#86EFAC' }]}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Terminés</Text>
          </View>
        </View>
      </View>

      <View style={styles.filterRow}>
        {(['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'] as const).map((status) => {
          const active = filterStatus === status;
          const labels: Record<string, string> = {
            ALL: 'Tous',
            PENDING: 'En attente',
            CONFIRMED: 'Confirmés',
            COMPLETED: 'Terminés',
            CANCELLED: 'Annulés',
          };
          return (
            <TouchableOpacity
              key={status}
              style={[styles.filterChip, active && styles.filterChipActive]}
              onPress={() => setFilterStatus(status)}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                {labels[status]}
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
              <Text style={styles.emptyTitle}>Aucun rendez-vous patient</Text>
              <Text style={styles.emptySub}>
                Aucune consultation ne correspond à ce filtre.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.patientName}>
                    👤 {item.patient?.nom || `Patient #${item.patientId}`}
                  </Text>
                  {item.patient?.dateNaissance ? (
                    <Text style={styles.patientDob}>
                      Né(e) le : {formatDateFr(item.patient.dateNaissance)}
                    </Text>
                  ) : null}
                </View>
                <StatusBadge status={item.statut} />
              </View>

              <View style={styles.slotBox}>
                <Text style={styles.slotDate}>📅 {formatDateFr(item.availability?.start)}</Text>
                <Text style={styles.slotTime}>
                  🕒 {formatTimeRangeFr(item.availability?.start, item.availability?.end)}
                </Text>
              </View>

              {item.medicalRecord ? (
                <View style={styles.recordPreview}>
                  <Text style={styles.recordPreviewLabel}>📋 Diagnostic enregistré :</Text>
                  <Text style={styles.recordPreviewText}>{item.medicalRecord.diagnostic}</Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                {item.statut === 'PENDING' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.confirmBtn]}
                    onPress={() => handleStatusChange(item, 'CONFIRMED')}
                  >
                    <Text style={styles.actionBtnText}>✓ Confirmer</Text>
                  </TouchableOpacity>
                )}

                {item.statut !== 'CANCELLED' && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.diagnosticBtn]}
                    onPress={() => openDiagnosticModal(item)}
                  >
                    <Text style={styles.actionBtnText}>
                      {item.medicalRecord ? '✏️ Modifier Diagnostic' : '📋 Rédiger Diagnostic'}
                    </Text>
                  </TouchableOpacity>
                )}

                {(item.statut === 'PENDING' || item.statut === 'CONFIRMED') && (
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.cancelBtn]}
                    onPress={() => handleStatusChange(item, 'CANCELLED')}
                  >
                    <Text style={[styles.actionBtnText, { color: COLORS.danger }]}>✕ Annuler</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* Modal Diagnostic médical */}
      <Modal
        visible={!!selectedAppointment}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedAppointment(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Compte-rendu & Diagnostic</Text>
            <Text style={styles.modalSub}>
              Patient : {selectedAppointment?.patient?.nom || `#${selectedAppointment?.patientId}`}
            </Text>

            <TextInput
              style={styles.textArea}
              placeholder="Saisissez le diagnostic clinique, les observations et les prescriptions..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              value={diagnosticText}
              onChangeText={setDiagnosticText}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => setSelectedAppointment(null)}
              >
                <Text style={styles.modalCancelText}>Fermer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSave}
                onPress={handleSaveDiagnostic}
                disabled={savingDiagnostic}
              >
                {savingDiagnostic ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>Enregistrer & Terminer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  statsHeader: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  doctorWelcome: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#CCFBF1',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
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
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  patientDob: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  slotBox: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  slotDate: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  slotTime: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  recordPreview: {
    marginTop: 10,
    backgroundColor: COLORS.primaryLight,
    padding: 10,
    borderRadius: 10,
  },
  recordPreviewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  recordPreviewText: {
    fontSize: 13,
    color: COLORS.text,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmBtn: {
    backgroundColor: COLORS.info,
  },
  diagnosticBtn: {
    backgroundColor: COLORS.secondary,
    flex: 1,
  },
  cancelBtn: {
    backgroundColor: COLORS.dangerLight,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 14,
  },
  textArea: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: COLORS.text,
    minHeight: 110,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  modalCancel: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  modalSave: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  modalSaveText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
