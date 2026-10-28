import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';

export default function ProfileScreen() {
  const { user, apiUrl, updateServerUrl, logout } = useAuthStore();
  const [urlInput, setUrlInput] = useState(apiUrl);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveUrl = () => {
    if (!urlInput.trim()) return;
    updateServerUrl(urlInput.trim());
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>
            {user?.role === 'DOCTOR' ? '🩺' : '👤'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.nom}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>
            {user?.role === 'DOCTOR' ? 'MÉDECIN PRATICIEN' : 'PATIENT'}
          </Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Informations du Compte</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Identifiant Utilisateur</Text>
          <Text style={styles.infoValue}>#{user?.id}</Text>
        </View>
        {user?.role === 'PATIENT' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>N° Dossier Patient</Text>
            <Text style={styles.infoValue}>#{user?.patientId ?? 1}</Text>
          </View>
        )}
        {user?.role === 'DOCTOR' && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Identifiant Praticien</Text>
            <Text style={styles.infoValue}>#{user?.doctorId ?? 1}</Text>
          </View>
        )}
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Configuration Serveur NestJS</Text>
        <Text style={styles.sectionSub}>
          URL de connexion vers le backend hopital-rdv (REST + WebSocket)
        </Text>
        <TextInput
          style={styles.input}
          value={urlInput}
          onChangeText={setUrlInput}
          autoCapitalize="none"
          placeholder="http://localhost:3000"
        />
        <TouchableOpacity style={styles.saveBtn} onPress={handleSaveUrl}>
          <Text style={styles.saveBtnText}>
            {savedNotice ? '✓ URL Mise à jour' : 'Mettre à jour le serveur'}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>🚪 Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    gap: 14,
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarIcon: {
    fontSize: 34,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    backgroundColor: COLORS.secondaryLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
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
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  logoutBtn: {
    backgroundColor: COLORS.dangerLight,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  logoutBtnText: {
    color: COLORS.danger,
    fontWeight: '800',
    fontSize: 15,
  },
});
