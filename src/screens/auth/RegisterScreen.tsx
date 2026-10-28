import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { COLORS } from '../../theme/colors';
import { useAuthStore } from '../../store/useAuthStore';

interface Props {
  onNavigateLogin: () => void;
}

export default function RegisterScreen({ onNavigateLogin }: Props) {
  const { register, loading, error, clearError } = useAuthStore();
  const [nom, setNom] = useState('');
  const [email, setEmail] = useState('');
  const [dateNaissance, setDateNaissance] = useState('1995-06-15');
  const [password, setPassword] = useState('');
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLocalValidationError(null);
    if (!nom.trim() || !email.trim() || !password.trim() || !dateNaissance.trim()) {
      setLocalValidationError('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const parsedDate = new Date(dateNaissance);
    if (isNaN(parsedDate.getTime())) {
      setLocalValidationError('Format de date invalide (attendu: AAAA-MM-JJ).');
      return;
    }

    await register({
      nom: nom.trim(),
      email: email.trim(),
      password,
      dateNaissance: parsedDate.toISOString(),
    });
  };

  const displayError = localValidationError || error;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Inscription Patient</Text>
          <Text style={styles.subtitle}>
            Créez votre dossier patient pour réserver vos consultations
          </Text>
        </View>

        <View style={styles.card}>
          {displayError ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Nom complet</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Fatou Ndiaye"
            placeholderTextColor={COLORS.textMuted}
            value={nom}
            onChangeText={(t) => {
              clearError();
              setLocalValidationError(null);
              setNom(t);
            }}
          />

          <Text style={styles.label}>Adresse Email</Text>
          <TextInput
            style={styles.input}
            placeholder="fatou.ndiaye@email.com"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(t) => {
              clearError();
              setLocalValidationError(null);
              setEmail(t);
            }}
          />

          <Text style={styles.label}>Date de naissance (AAAA-MM-JJ)</Text>
          <TextInput
            style={styles.input}
            placeholder="1995-06-15"
            placeholderTextColor={COLORS.textMuted}
            value={dateNaissance}
            onChangeText={(t) => {
              clearError();
              setLocalValidationError(null);
              setDateNaissance(t);
            }}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 caractères"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(t) => {
              clearError();
              setLocalValidationError(null);
              setPassword(t);
            }}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Créer mon compte patient</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={onNavigateLogin}>
            <Text style={styles.backLinkText}>
              Déjà inscrit ? <Text style={styles.backLinkHighlight}>Se connecter</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  errorBox: {
    backgroundColor: COLORS.dangerLight,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 14,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  backLinkHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});
