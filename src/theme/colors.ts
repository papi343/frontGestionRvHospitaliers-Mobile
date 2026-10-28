export const COLORS = {
  primary: '#0284C7',      // Sky Blue 600 - Hospital Primary
  primaryDark: '#0369A1',  // Sky Blue 700
  primaryLight: '#E0F2FE', // Sky Blue 100
  secondary: '#0D9488',    // Teal 600 - Medical Accent
  secondaryLight: '#CCFBF1',
  background: '#F8FAFC',   // Slate 50
  surface: '#FFFFFF',
  text: '#0F172A',         // Slate 900
  textSecondary: '#475569',// Slate 600
  textMuted: '#94A3B8',    // Slate 400
  border: '#E2E8F0',       // Slate 200
  success: '#16A34A',      // Green 600
  successLight: '#DCFCE7',
  warning: '#D97706',      // Amber 600
  warningLight: '#FEF3C7',
  danger: '#DC2626',       // Red 600
  dangerLight: '#FEE2E2',
  info: '#2563EB',         // Blue 600
  infoLight: '#DBEAFE',
};

export const STATUS_CONFIG = {
  PENDING: {
    label: 'En attente',
    color: COLORS.warning,
    bg: COLORS.warningLight,
  },
  CONFIRMED: {
    label: 'Confirmé',
    color: COLORS.info,
    bg: COLORS.infoLight,
  },
  COMPLETED: {
    label: 'Terminé',
    color: COLORS.success,
    bg: COLORS.successLight,
  },
  CANCELLED: {
    label: 'Annulé',
    color: COLORS.danger,
    bg: COLORS.dangerLight,
  },
};
