# 🚀 Guide de Déploiement de Sky Bird Adventure

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Configuration de l'Environnement](#configuration-de-lenvironnement)
3. [Déploiement de Développement](#déploiement-de-développement)
4. [Build pour Production](#build-pour-production)
5. [Publication sur les Stores](#publication-sur-les-stores)
6. [Monitoring et Maintenance](#monitoring-et-maintenance)
7. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### 📱 Outils Requis

#### Node.js et npm
```bash
# Vérifier les versions
node --version  # >= 18.0.0
npm --version   # >= 8.0.0

# Installation si nécessaire
# Installer depuis https://nodejs.org
```

#### Expo CLI
```bash
# Installation globale
npm install -g @expo/cli

# Vérifier la version
expo --version  # >= 6.0.0
```

#### Outils Mobiles
- **Android** : Android Studio + Android SDK
- **iOS** : Xcode (macOS uniquement)
- **Expo Go** : Application mobile pour tests rapides

### 📋 Comptes Requis

#### Expo Account
```bash
# Se connecter
expo login

# Créer un compte si nécessaire
expo register
```

#### Store Developer Accounts
- **Google Play Console** : $25 (une fois)
- **Apple Developer Program** : $99/an

---

## ⚙️ Configuration de l'Environnement

### 📁 Structure du Projet

```
sky-bird-adventure/
├── assets/              # Images et sons
├── docs/                # Documentation
├── scripts/             # Scripts de build
├── src/                 # Code source
├── app.json             # Configuration Expo
├── package.json         # Dépendances
├── babel.config.js      # Configuration Babel
└── eas.json            # Configuration EAS Build
```

### 🔧 Configuration Expo

#### app.json
```json
{
  "expo": {
    "name": "Sky Bird Adventure",
    "slug": "sky-bird-adventure",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "newArchEnabled": true,
    "splash": {
      "resizeMode": "contain",
      "backgroundColor": "#050510"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.yourname.skybirdadventure",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#050510"
      },
      "package": "com.yourname.skybirdadventure",
      "versionCode": 1
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      "expo-asset"
    ]
  }
}
```

#### eas.json (Configuration EAS Build)
```json
{
  "cli": {
    "version": ">= 3.13.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "buildType": "archive"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

### 📱 Installation des Dépendances

```bash
# Cloner le projet
git clone https://github.com/SalmaHaddoute/Flapy-bird.git
cd flappy-nova/flappy-nova

# Installer les dépendances
npm install

# Générer les fichiers audio
node scripts/generateSounds.js

# Vérifier l'installation
npx expo doctor
```

---

## 🛠️ Déploiement de Développement

### 🚀 Démarrage en Mode Développement

```bash
# Démarrer le serveur de développement
npx expo start

# Options disponibles
npx expo start --clear      # Nettoyer le cache
npx expo start --tunnel     # Tunnel pour accès externe
npx expo start --web        # Interface web
```

### 📱 Test sur Appareil

#### Avec Expo Go (Recommandé pour début)
```bash
# Scanner le QR code avec Expo Go
# L'application se charge automatiquement
```

#### Avec Build de Développement
```bash
# Build pour test interne
npx eas build --platform android --profile development
npx eas build --platform ios --profile development

# Installation sur l'appareil
npx eas install --platform android
npx eas install --platform ios
```

### 🌐 Test Web
```bash
# Lancer le serveur web
npx expo start --web

# Accéder via le navigateur
# http://localhost:8081
```

---

## 🏗️ Build pour Production

### 📦 Configuration EAS Build

#### Installation d'EAS CLI
```bash
npm install -g eas-cli
eas build:configure
```

#### Configuration des Variables d'Environnement
```bash
# Créer .env (ne pas commiter)
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_ENVIRONMENT=production
```

### 🤖 Build Android

#### APK (pour distribution directe)
```bash
# Build APK
npx eas build --platform android --profile production

# Télécharger le build
# Lien disponible dans la console Expo
```

#### AAB (pour Google Play)
```bash
# Modifier eas.json pour AAB
{
  "build": {
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}

# Build AAB
npx eas build --platform android --profile production
```

### 🍎 Build iOS

#### Archive (pour App Store)
```bash
# Build iOS (nécessite macOS et Xcode)
npx eas build --platform ios --profile production

# Configuration requise dans eas.json
{
  "build": {
    "production": {
      "ios": {
        "buildType": "archive"
      }
    }
  }
}
```

#### IPA (pour TestFlight)
```bash
# Build pour distribution interne
npx eas build --platform ios --profile preview
```

### 📊 Monitoring des Builds

```bash
# Voir l'état des builds
eas build:list

# Voir les détails d'un build
eas build:view [BUILD_ID]

# Annuler un build
eas build:cancel [BUILD_ID]
```

---

## 📱 Publication sur les Stores

### 🤖 Google Play Store

#### Préparation
1. **Créer un compte** sur [Google Play Console](https://play.google.com/console)
2. **Payer les frais** ($25 une fois)
3. **Créer une application** avec le nom "Sky Bird Adventure"

#### Configuration du Store
```bash
# Package ID utilisé
com.yourname.skybirdadventure

# Remplacer 'yourname' par votre identifiant
```

#### Éléments Requis
- **Icones** : Multiple tailles (512x512, 192x192, etc.)
- **Screenshots** : Minimum 2, maximum 8
- **Description** : Texte de présentation
- **Catégorie** : Jeu / Casual
- **Classification** : Tout public

#### Soumission
```bash
# Build AAB pour Play Store
npx eas build --platform android --profile production

# Soumettre via EAS Submit
npx eas submit --platform android --profile production
```

### 🍎 Apple App Store

#### Préparation
1. **Compte développeur** Apple ($99/an)
2. **Xcode** installé sur macOS
3. **Certificats** de développement et distribution

#### Configuration App Store Connect
1. **Créer l'application** dans App Store Connect
2. **Configurer les métadonnées**
3. **Uploader les captures d'écran**
4. **Remplir la description**

#### Build et Soumission
```bash
# Build iOS pour App Store
npx eas build --platform ios --profile production

# Soumettre via EAS Submit
npx eas submit --platform ios --profile production
```

---

## 📊 Monitoring et Maintenance

### 📈 Analytics avec Expo

#### Configuration
```bash
# Installer Expo Analytics
npm install expo-analytics

# Configuration dans app.json
{
  "expo": {
    "plugins": [
      ["expo-analytics", {
        "enabled": true
      }]
    ]
  }
}
```

#### Utilisation
```javascript
import Analytics from 'expo-analytics';

const analytics = new Analytics('UA-XXXXXXX-X');

// Track events
analytics.event('game_start', { level: 1 });
analytics.event('game_over', { score: 25, level: 1 });
```

### 🐛 Gestion des Crashes

#### Installation de Sentry
```bash
npm install @sentry/react-native
npx @sentry/wizard -i react-native
```

#### Configuration
```javascript
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
});
```

### 📊 Performance Monitoring

#### Métriques à Surveiller
- **Temps de chargement** de l'application
- **Performance** du jeu (FPS)
- **Taux de crash** par version
- **Utilisation** des fonctionnalités
- **Rétention** des utilisateurs

---

## 🔧 Dépannage

### 🚫 Problèmes Communs

#### Build Échoué
```bash
# Nettoyer le cache
npx expo start --clear

# Réinitialiser le projet
npx expo install --fix

# Vérifier les dépendances
npx expo doctor
```

#### Erreur de Signature iOS
```bash
# Réinitialiser les certificats
eas credentials:clear --platform ios

# Recréer les credentials
eas credentials:manage --platform ios
```

#### Problème de Version Android
```bash
# Mettre à jour versionCode dans app.json
{
  "expo": {
    "android": {
      "versionCode": 2  // Incrémenter
    }
  }
}
```

#### Build Trop Lent
```bash
# Utiliser le cache EAS
eas build --platform android --profile production --cache

# Optimiser les assets
npx expo optimize
```

### 📱 Problèmes Spécifiques

#### Audio ne Fonctionne Pas
```javascript
// Vérifier l'initialisation
await audioServiceV4.initialize();

// Vérifier les permissions
const { status } = await Audio.requestPermissionsAsync();
if (status !== 'granted') {
  console.log('Audio permissions denied');
}
```

#### Stockage Ne Fonctionne Pas
```javascript
// Vérifier AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

try {
  await AsyncStorage.setItem('test', 'value');
  const value = await AsyncStorage.getItem('test');
  console.log('Storage working:', value);
} catch (error) {
  console.error('Storage error:', error);
}
```

#### Performance Faible
```javascript
// Monitorer les FPS
import { Performance } from 'react-native';

Performance.observe(list => {
  list.forEach(entry => {
    console.log('Performance:', entry);
  });
});
```

### 📞 Support et Ressources

#### Documentation Officielle
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)

#### Communauté
- [Expo Discord](https://discord.gg/expo)
- [React Native Forums](https://forums.reactnative.dev/)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native)

#### Outils de Debug
```bash
# React Native Debugger
npm install -g react-native-debugger

# Flipper pour inspection
npm install -g flipper
```

---

## 📝 Checklist de Déploiement

### ✅ Pré-Déploiement
- [ ] Code review terminée
- [ ] Tests passés (unitaires et E2E)
- [ ] Documentation mise à jour
- [ ] Version incrémentée
- [ ] Changelog créé

### ✅ Build
- [ ] Build de développement testé
- [ ] Build de production réussi
- [ ] Signature des apps configurée
- [ ] Assets optimisés

### ✅ Publication
- [ ] Métadonnées des stores complètes
- [ ] Screenshots prêtes
- [ ] Description rédigée
- [ ] Catégorie appropriée

### ✅ Post-Déploiement
- [ ] Monitoring configuré
- [ ] Analytics activés
- [ ] Crash reporting setup
- [ ] Feedback utilisateur mis en place

---

## 🚀 Bonnes Pratiques

### 📦 Gestion des Versions
```javascript
// Semantic Versioning
{
  "version": "1.0.0",  // MAJOR.MINOR.PATCH
}

// Règles de version
// MAJOR : Changements cassants
// MINOR : Nouvelles fonctionnalités
// PATCH : Corrections de bugs
```

### 🔒 Sécurité
```bash
# Scanner les dépendances
npm audit

# Mettre à jour les packages vulnérables
npm update

# Utiliser .env pour les secrets
EXPO_PUBLIC_API_KEY=your_api_key
```

### 📱 Performance
```javascript
// Optimiser les images
npx expo optimize

// Utiliser le lazy loading
const LazyComponent = React.lazy(() => import('./Component'));

// Monitorer la mémoire
if (__DEV__) {
  import('react-native').then(({ NativeModules }) => {
    console.log('Memory usage:', NativeModules.Performance);
  });
}
```

---

## 📈 Évolution du Déploiement

### 🔄 CI/CD (Futur)
```yaml
# .github/workflows/build.yml
name: Build and Deploy
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npx eas build --platform all --profile production
```

### 🤖 Automatisation (Futur)
```bash
# Script de déploiement automatisé
#!/bin/bash
npm test
npm run build
npx eas build --platform all
npx eas submit --platform all
```

---

## 📞 Support Technique

Pour toute question sur le déploiement :

1. **Consulter la documentation** officielle
2. **Vérifier les logs** d'erreur
3. **Tester sur différents appareils**
4. **Contacter la communauté** Expo/React Native

---

*Guide de déploiement mis à jour : Mars 2026*
