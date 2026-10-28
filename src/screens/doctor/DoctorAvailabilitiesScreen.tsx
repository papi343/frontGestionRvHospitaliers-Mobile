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
import { Availability } from '../../types';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDateFr, formatTimeRangeFr } from '../../utils/dateFormat';

export default function DoctorAvailabilitiesScreen() {
  const { user } = useAuthStore();
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [mode, setMode] = useState<'SINGLE' | 'BULK'>('SINGLE');
  const [dateStr, setDateStr] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [endDateStr, setEndDateStr] = useState(
    new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('12:00');
  const [durationMinutes, setDurationMinutes] = useState('30');
  const [submitting, setSubmitting] = useState(false);

  const doctorId = user?.doctorId || 1;

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    const list = await hospitalApi.getAvailabilities({ doctorId });
    setSlots(list);
    setLoading(false);
  };

  const handleCreateSlot = async () => {
    setSubmitting(true);
    try {
      if (mode === 'SINGLE') {
        const startIso = new Date(`${dateStr}T${startTime}:00`).toISOString();
        const endIso = new Date(`${dateStr}T${endTime}:00`).toISOString();
        await hospitalApi.createAvailability({
          doctorId,
          start: startIso,
          end: endIso,
        });
        Alert.alert('Créneau ajouté ✅', 'Votre disponibilité a été publiée.');
      } else {
        const res = await hospitalApi.createBulkAvailability({
          doctorId,
          startDate: new Date(`${dateStr}T00:00:00`).toISOString(),
          endDate: new Date(`${endDateStr}T23:59:59`).toISOString(),
          startTime,
          endTime,
          slotDurationMinutes: parseInt(durationMinutes, 10) || 30,
        });
        Alert.alert(
          'Planning généré ✅',
          `${res.createdCount} créneaux horaires ont été générés automatiquement.`
        );
      }
      setShowAddModal(false);
      loadSlots();
    } catch (err: any) {
      Alert.alert(
        'Erreur',
        err.response?.data?.message || err.message || 'Impossible de créer la disponibilité.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = (slot: Availability) => {
    if (slot.appointment) {
      Alert.alert(
        'Créneau réservé',
        'Ce créneau est déjà associé à un rendez-vous patient.'
      );
      return;
    }
    Alert.alert('Supprimer ce créneau', 'Voulez-vous retirer cette plage horaire ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await hospitalApi.deleteAvailability(slot.id);
          loadSlots();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBanner}>
        <View style={{ flex: 1 }}>
          <Text style={styles.bannerTitle}>🗓️ Mes Disponibilités</Text>
          <Text style={styles.bannerSub}>
            Gérez vos plages horaires ouvertes à la réservation
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addBtnText}>+ Ajouter</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          onRefresh={loadSlots}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucune disponibilité</Text>
              <Text style={styles.emptySub}>
                Appuyez sur "+ Ajouter" pour ouvrir des créneaux de consultation.
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            const isBooked = !!item.appointment;
            return (
              <View style={styles.slotCard}>
                <View>
                  <Text style={styles.slotDate}>{formatDateFr(item.start)}</Text>
                  <Text style={styles.slotTime}>
                    🕒 {formatTimeRangeFr(item.start, item.end)}
                  </Text>
                </View>

                <View style={styles.rightActions}>
                  <View
                    style={[
                      styles.statusPill,
                      isBooked ? styles.bookedPill : styles.freePill,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusPillText,
                        isBooked ? styles.bookedPillText : styles.freePillText,
                      ]}
                    >
                      {isBooked ? 'Réservé' : 'Libre'}
                    </Text>
                  </View>

                  {!isBooked && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDeleteSlot(item)}
                    >
                      <Text style={styles.deleteBtnText}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Modal création créneau simple ou en masse */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nouvelle Disponibilité</Text>

            <View style={styles.modeSwitch}>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'SINGLE' && styles.modeTabActive]}
                onPress={() => setMode('SINGLE')}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    mode === 'SINGLE' && styles.modeTabTextActive,
                  ]}
                >
                  Créneau unique
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modeTab, mode === 'BULK' && styles.modeTabActive]}
                onPress={() => setMode('BULK')}
              >
                <Text
                  style={[
                    styles.modeTabText,
                    mode === 'BULK' && styles.modeTabTextActive,
                  ]}
                >
                  Génération en série
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>
              {mode === 'SINGLE' ? 'Date (AAAA-MM-JJ)' : 'Date de début (AAAA-MM-JJ)'}
            </Text>
            <TextInput
              style={styles.input}
              value={dateStr}
              onChangeText={setDateStr}
              placeholder="2026-10-30"
            />

            {mode === 'BULK' && (
              <>
                <Text style={styles.label}>Date de fin (AAAA-MM-JJ)</Text>
                <TextInput
                  style={styles.input}
                  value={endDateStr}
                  onChangeText={setEndDateStr}
                  placeholder="2026-11-05"
                />
              </>
            )}

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Heure début (HH:mm)</Text>
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="09:00"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Heure fin (HH:mm)</Text>
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="12:00"
                />
              </View>
            </View>

            {mode === 'BULK' && (
              <>
                <Text style={styles.label}>Durée par consultation (minutes)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={durationMinutes}
                  onChangeText={setDurationMinutes}
                  placeholder="30"
                />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleCreateSlot}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Publier</Text>
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
  topBanner: {
    backgroundColor: COLORS.surface,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  bannerSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  addBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    gap: 10,
  },
  slotCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotDate: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  slotTime: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  freePill: {
    backgroundColor: COLORS.successLight,
  },
  bookedPill: {
    backgroundColor: COLORS.warningLight,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  freePillText: {
    color: COLORS.success,
  },
  bookedPillText: {
    color: COLORS.warning,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: 16,
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
    marginBottom: 12,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderRadius: 10,
    padding: 4,
    marginBottom: 14,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: COLORS.secondary,
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 6,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
