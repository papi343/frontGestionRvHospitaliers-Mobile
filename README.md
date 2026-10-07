# 🏥 RvHospi Mobile

> Application mobile de gestion et de prise de rendez-vous hospitaliers / médicaux, conçue avec React Native et Expo.

[![Expo](https://img.shields.io/badge/Expo-~57.0.26-000020.svg?style=flat-square&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.86.3-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://reactnative.dev)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB.svg?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-~6.0.3-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 📌 Présentation

**RvHospi Mobile** est la déclinaison mobile de la plateforme **RvHospi**, visant à simplifier et fluidifier l'expérience de prise et de suivi des rendez-vous en milieu hospitalier pour les patients et le personnel médical :

- 📅 **Prise de rendez-vous intuitive** par spécialité, médecin ou établissement.
- 🔔 **Notifications & rappels en temps réel** pour réduire l'absentéisme.
- 📋 **Suivi des consultations & historique médical**.
- 💬 **Communication et mises à jour en direct** via WebSockets (`socket.io`).

---

## 🛠️ Stack Technique & Dépendances

| Catégorie | Outils / Bibliothèques |
| :--- | :--- |
| **Framework Mobile** | [Expo](https://expo.dev) (SDK 57) / [React Native](https://reactnative.dev) 0.86 |
| **Langage** | [TypeScript](https://www.typescriptlang.org/) / [React 19](https://react.dev) |
| **Navigation** | [React Navigation 7](https://reactnavigation.org/) (Native Stack, Bottom Tabs) |
| **Gestion d'état** | [Zustand](https://github.com/pmndrs/zustand) |
| **Réseau & API** | [Axios](https://axios-http.com/) |
| **Temps Réel** | [Socket.IO Client](https://socket.io/) |

---

## 📁 Structure du Projet

```text
RvHospi-mobile/
├── assets/              # Images, icônes adaptatives et logos
├── App.tsx              # Composant racine de l'application
├── index.ts             # Point d'entrée Expo (registerRootComponent)
├── app.json             # Configuration du projet Expo & métadonnées
├── package.json         # Dépendances et scripts npm
├── tsconfig.json        # Configuration TypeScript
└── README.md            # Documentation du projet
```

---

## 🚀 Démarrage Rapide

### Prérequis

- [Node.js](https://nodejs.org/) (version LTS recommandée)
- [npm](https://www.npmjs.com/) ou [yarn](https://yarnpkg.com/)
- Application **Expo Go** installée sur votre smartphone (iOS ou Android) ou un émulateur / simulateur configuré.

### 1. Installation des dépendances

```bash
npm install
```

### 2. Lancement du serveur de développement

```bash
npm run start
# ou
npx expo start
```

### 3. Exécution sur un appareil ou simulateur

- **Android** : Appuyez sur `a` dans le terminal ou exécutez `npm run android`
- **iOS** (macOS uniquement) : Appuyez sur `i` dans le terminal ou exécutez `npm run ios`
- **Web** : Appuyez sur `w` dans le terminal ou exécutez `npm run web`
- **Appareil physique** : Scannez le QR Code affiché dans le terminal avec l'application **Expo Go** (Android) ou l'application **Appareil Photo** (iOS).

---

## 📜 Scripts Disponibles

| Commande | Description |
| :--- | :--- |
| `npm run start` | Démarre le serveur Metro Bundler Expo |
| `npm run android` | Démarre l'application directement sur un émulateur / appareil Android |
| `npm run ios` | Démarre l'application sur le simulateur iOS |
| `npm run web` | Démarre la version Web locale |
| `npx tsc --noEmit` | Vérifie la conformité des types TypeScript |

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](file:///c:/Mes%20project%20react/RvHospi-mobile/LICENSE) pour plus de détails.
