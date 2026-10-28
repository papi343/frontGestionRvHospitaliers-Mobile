import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { hospitalApi } from '../../api/services';
import { Availability, Doctor, Specialty } from '../../types';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';
import { formatDateFr, formatTimeRangeFr } from '../../utils/dateFormat';

export default function PatientDirectoryScreen() {
  const { user, fetchNotifications } = useAuthStore();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Booking modal state
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [slots, setSlots] = useState<Availability[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingSlotId, setBookingSlotId] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [docs, specs] = await Promise.all([
      hospitalApi.getDoctors(),
      hospitalApi.getSpecialties(),
    ]);
    setDoctors(docs);
    setSpecialties(specs);
    setLoading(false);
  };

  const openBookingModal = async (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setLoadingSlots(true);
    const availableSlots = await hospitalApi.getAvailabilities({
      doctorId: doctor.id,
      isBooked: false,
    });
    setSlots(availableSlots.filter((s) => !s.appointment));
    setLoadingSlots(false);
  };

  const handleBookSlot = async (slot: Availability) => {
    if (!user || !selectedDoctor) return;
    const patientId = user.patientId || 1;
    setBookingSlotId(slot.id);
    try {
      await hospitalApi.createAppointment({
        patientId,
        doctorId: selectedDoctor.id,
        availabilityId: slot.id,
      });
      await fetchNotifications();
      Alert.alert(
        'Rendez-vous réservé ✅',
        `Votre demande de rendez-vous avec ${selectedDoctor.nom} le ${formatDateFr(
          slot.start
        )} (${formatTimeRangeFr(slot.start, slot.end)}) a bien été enregistrée.`
      );
      setSelectedDoctor(null);
    } catch (err: any) {
      Alert.alert(
        'Erreur de réservation',
        err.response?.data?.message || err.message || 'Impossible de réserver ce créneau.'
      );
    } finally {
      setBookingSlotId(null);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.licence.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      selectedSpecialtyId === null ||
      doc.specialties?.some((s) => s.specialtyId === selectedSpecialtyId || s.specialty?.id === selectedSpecialtyId);
    return matchesSearch && matchesSpecialty;
  });

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.greeting}>Bonjour, {user?.nom} 👋</Text>
        <Text style={styles.heroSub}>
          Trouvez un spécialiste et réservez votre consultation en quelques secondes
        </Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un médecin ou numéro de licence..."
          placeholderTextColor={COLORS.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
          <TouchableOpacity
            style={[styles.chip, selectedSpecialtyId === null && styles.chipActive]}
            onPress={() => setSelectedSpecialtyId(null)}
          >
            <Text style={[styles.chipText, selectedSpecialtyId === null && styles.chipTextActive]}>
              Toutes spécialités
            </Text>
          </TouchableOpacity>
          {specialties.map((spec) => {
            const active = selectedSpecialtyId === spec.id;
            return (
              <TouchableOpacity
                key={spec.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setSelectedSpecialtyId(active ? null : spec.id)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{spec.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredDoctors}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          onRefresh={loadData}
          refreshing={loading}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyTitle}>Aucun praticien trouvé</Text>
              <Text style={styles.emptySub}>Essayez de modifier vos filtres de recherche.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.doctorCard}>
              <View style={styles.doctorRow}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>🩺</Text>
                </View>
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{item.nom}</Text>
                  <Text style={styles.licenceText}>N° Licence : {item.licence}</Text>
                  <View style={styles.specialtyTags}>
                    {item.specialties && item.specialties.length > 0 ? (
                      item.specialties.map((sp, idx) => (
                        <View key={idx} style={styles.specBadge}>
                          <Text style={styles.specBadgeText}>{sp.specialty?.name || 'Spécialiste'}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.specBadge}>
                        <Text style={styles.specBadgeText}>Médecine Générale</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.bookBtn} onPress={() => openBookingModal(item)}>
                <Text style={styles.bookBtnText}>📅 Voir les créneaux disponibles</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      {/* Modal de prise de RDV */}
      <Modal
        visible={!!selectedDoctor}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedDoctor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Prendre Rendez-vous</Text>
                <Text style={styles.modalSub}>{selectedDoctor?.nom}</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedDoctor(null)}
              >
                <Text style={styles.closeBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            {loadingSlots ? (
              <View style={styles.centeredModal}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Chargement des disponibilités...</Text>
              </View>
            ) : slots.length === 0 ? (
              <View style={styles.centeredModal}>
                <Text style={styles.emptyTitle}>Aucun créneau libre</Text>
                <Text style={styles.emptySub}>
                  Ce médecin n'a pas de disponibilité ouverte pour le moment.
                </Text>
              </View>
            ) : (
              <FlatList
                data={slots}
                keyExtractor={(s) => String(s.id)}
                contentContainerStyle={{ paddingVertical: 8 }}
                renderItem={({ item: slot }) => {
                  const isBooking = bookingSlotId === slot.id;
                  return (
                    <View style={styles.slotRow}>
                      <View>
                        <Text style={styles.slotDate}>{formatDateFr(slot.start)}</Text>
                        <Text style={styles.slotTime}>
                          🕒 {formatTimeRangeFr(slot.start, slot.end)}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={styles.confirmSlotBtn}
                        onPress={() => handleBookSlot(slot)}
                        disabled={isBooking}
                      >
                        {isBooking ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <Text style={styles.confirmSlotText}>Réserver</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                }}
              />
            )}
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
  heroCard: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  greeting: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroSub: {
    fontSize: 13,
    color: '#E0F2FE',
    marginTop: 4,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: COLORS.text,
  },
  filterContainer: {
    marginTop: 12,
    marginBottom: 4,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  licenceText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  specialtyTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  specBadge: {
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
  },
  specBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  bookBtn: {
    marginTop: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyBox: {
    padding: 32,
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
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  modalSub: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  centeredModal: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.background,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
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
  confirmSlotBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  confirmSlotText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
