import React, { useState } from 'react';
import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';
import { COLORS } from '../theme/colors';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Patient screens
import PatientDirectoryScreen from '../screens/patient/PatientDirectoryScreen';
import PatientAppointmentsScreen from '../screens/patient/PatientAppointmentsScreen';
import PatientMedicalRecordsScreen from '../screens/patient/PatientMedicalRecordsScreen';

// Doctor screens
import DoctorAppointmentsScreen from '../screens/doctor/DoctorAppointmentsScreen';
import DoctorAvailabilitiesScreen from '../screens/doctor/DoctorAvailabilitiesScreen';

// Common screens
import NotificationsScreen from '../screens/common/NotificationsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';

const Tab = createBottomTabNavigator();

function PatientTabs() {
  const { notifications } = useAuthStore();
  const unread = notifications.filter((n) => !n.lu).length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { fontWeight: '800', color: COLORS.text },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Directory"
        component={PatientDirectoryScreen}
        options={{
          title: 'Médecins',
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="MyAppointments"
        component={PatientAppointmentsScreen}
        options={{
          title: 'Mes RDV',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📅</Text>,
        }}
      />
      <Tab.Screen
        name="MedicalRecords"
        component={PatientMedicalRecordsScreen}
        options={{
          title: 'Dossier',
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alertes',
          headerShown: false,
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

function DoctorTabs() {
  const { notifications } = useAuthStore();
  const unread = notifications.filter((n) => !n.lu).length;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTitleStyle: { fontWeight: '800', color: COLORS.text },
        tabBarActiveTintColor: COLORS.secondary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="DoctorAppointments"
        component={DoctorAppointmentsScreen}
        options={{
          title: 'Consultations',
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🩺</Text>,
        }}
      />
      <Tab.Screen
        name="DoctorAvailabilities"
        component={DoctorAvailabilitiesScreen}
        options={{
          title: 'Planning',
          headerShown: false,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🗓️</Text>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Alertes',
          headerShown: false,
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>🔔</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: () => <Text style={{ fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuthStore();
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  if (!user) {
    return authView === 'LOGIN' ? (
      <LoginScreen onNavigateRegister={() => setAuthView('REGISTER')} />
    ) : (
      <RegisterScreen onNavigateLogin={() => setAuthView('LOGIN')} />
    );
  }

  return (
    <NavigationContainer>
      {user.role === 'DOCTOR' ? <DoctorTabs /> : <PatientTabs />}
    </NavigationContainer>
  );
}
