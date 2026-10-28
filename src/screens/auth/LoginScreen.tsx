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
  onNavigateRegister: () => void;
}

export default function LoginScreen({ onNavigateRegister }: Props) {
  const { login, loading, error, clearError, apiUrl, updateServerUrl } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showServerConfig, setShowServerConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(apiUrl);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    await login(email.trim(), password);
  };

  const handleQuickDemo = async (role: 'PATIENT' | 'DOCTOR') => {
    clearError();
    if (role === 'PATIENT') {
      setEmail('amadou.diallo@patient.fr');
      setPassword('patient123');
      await login('amadou.diallo@patient.fr', 'patient123');
    } else {
      setEmail('jean.dupont@hopital.fr');
      setPassword('doctor123');
      await login('jean.dupont@hopital.fr', 'doctor123');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🏥</Text>
          </View>
          <Text style={styles.title}>RvHospi Mobile</Text>
          <Text style={styles.subtitle}>
            Portail de gestion des rendez-vous hospitaliers
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Connexion</Text>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Adresse Email</Text>
          <TextInput
            style={styles.input}
            placeholder="exemple@hopital.fr"
            placeholderTextColor={COLORS.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              clearError();
              setEmail(text);
            }}
          />

          <Text style={styles.label}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor={COLORS.textMuted}
            secureTextEntry
            value={password}
            onChangeText={(text) => {
              clearError();
              setPassword(text);
            }}
          />

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Accès rapide démo</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.demoRow}>
            <TouchableOpacity
              style={[styles.demoButton, styles.patientDemo]}
              onPress={() => handleQuickDemo('PATIENT')}
            >
              <Text style={styles.demoButtonTitle}>👤 Espace Patient</Text>
              <Text style={styles.demoButtonSub}>Prendre & suivre RDV</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.demoButton, styles.doctorDemo]}
              onPress={() => handleQuickDemo('DOCTOR')}
            >
              <Text style={styles.demoButtonTitle}>🩺 Espace Médecin</Text>
              <Text style={styles.demoButtonSub}>Planning & diagnostics</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.registerLink} onPress={onNavigateRegister}>
            <Text style={styles.registerLinkText}>
              Nouveau patient ?{' '}
              <Text style={styles.registerLinkHighlight}>Créer un compte</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.serverToggle}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Text style={styles.serverToggleText}>
            ⚙️ Serveur API NestJS : {apiUrl}
          </Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverCard}>
            <Text style={styles.label}>URL de l'API Backend (ex: http://192.168.1.15:3000)</Text>
            <View style={styles.serverInputRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
                value={customUrl}
                onChangeText={setCustomUrl}
                autoCapitalize="none"
              />
              <TouchableOpacity
                style={styles.saveServerBtn}
                onPress={() => {
                  updateServerUrl(customUrl.trim());
                  setShowServerConfig(false);
                }}
              >
                <Text style={styles.saveServerBtnText}>Appliquer</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 34,
  },
  title: {
    fontSize: 26,
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
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 16,
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
    marginTop: 4,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  demoRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  patientDemo: {
    backgroundColor: COLORS.primaryLight,
    borderColor: '#BAE6FD',
  },
  doctorDemo: {
    backgroundColor: COLORS.secondaryLight,
    borderColor: '#99F6E4',
  },
  demoButtonTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  demoButtonSub: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  registerLink: {
    marginTop: 18,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLinkHighlight: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  serverToggle: {
    marginTop: 16,
    alignItems: 'center',
  },
  serverToggleText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  serverCard: {
    marginTop: 10,
    backgroundColor: COLORS.surface,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  serverInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveServerBtn: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveServerBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});
