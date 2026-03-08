# 🐦 Sky Bird Adventure - Documentation Complète

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Fonctionnalités du Jeu](#fonctionnalités-du-jeu)
5. [Système Audio](#système-audio)
6. [Stockage de Données](#stockage-de-données)
7. [Configuration et Déploiement](#configuration-et-déploiement)
8. [Guide de Développement](#guide-de-développement)

---

## 🎮 Vue d'Ensemble

**Sky Bird Adventure** est un jeu mobile React Native inspiré de Flappy Bird avec des fonctionnalités avancées, une bande-son complète et un système de progression sophistiqué.

### 🎯 Objectifs du Projet
- Créer un jeu mobile engageant avec une expérience utilisateur fluide
- Implémenter des fonctionnalités avancées (power-ups, niveaux, statistiques)
- Utiliser les meilleures pratiques React Native et Expo
- Fournir une architecture extensible et maintenable

### 🚀 Caractéristiques Principales
- **5 niveaux progressifs** avec difficulté croissante
- **Système de power-ups** (bouclier, ralenti, aimant)
- **Audio professionnel** avec vrais fichiers WAV
- **Statistiques détaillées** avec tableau de bord
- **Personnalisation** avec différents oiseaux colorés
- **Stockage persistant** des scores et progression

---

## 🏗️ Architecture Technique

### 📱 Stack Technologique
- **Frontend** : React Native 0.81.5
- **Framework** : Expo SDK 54
- **Navigation** : React Navigation Native Stack
- **Stockage** : AsyncStorage (fiable sur mobile)
- **Audio** : Expo Audio avec fichiers WAV
- **Haptics** : Expo Haptics (désactivé par défaut)

### 🎨 Architecture des Composants
```
src/
├── components/          # Composants UI réutilisables
│   ├── Bird.js         # Oiseau animé
│   ├── Pipe.js         # Tuyaux obstacles
│   ├── Coin.js         # Pièces collectibles
│   └── PowerUp.js      # Power-ups animés
├── screens/            # Écrans de l'application
│   ├── MenuScreen.js   # Menu principal
│   ├── GameScreen.js   # Écran de jeu
│   └── StatsScreen.js  # Statistiques
├── hooks/              # Hooks personnalisés
│   └── useGameEngine.js # Logique du jeu
├── services/           # Services métier
│   ├── audioServiceV4.js  # Système audio
│   └── databaseService.js # Service de données
├── utils/              # Utilitaires
│   ├── storageV3.js    # Gestion du stockage
│   └── audioBufferGenerator.js # Génération audio
└── constants/           # Constantes du jeu
    └── gameConfig.js   # Configuration principale
```

### 🔄 Flux de Données
1. **GameScreen** → **useGameEngine** → Logique de jeu
2. **useGameEngine** → **AudioServiceV4** → Effets sonores
3. **GameScreen** → **StorageV3** → Persistance des données
4. **MenuScreen** → **StatsScreen** → Affichage des statistiques

---

## 📁 Structure du Projet

### 📂 Dossiers Principaux

#### `/src/components/`
Composants visuels réutilisables avec animations et styles.

#### `/src/screens/`
Écrans principaux de l'application avec logique et gestion d'état.

#### `/src/hooks/`
Hooks personnalisés pour la logique métier et la gestion du jeu.

#### `/src/services/`
Services pour l'audio, le stockage et les opérations asynchrones.

#### `/src/utils/`
Fonctions utilitaires et helpers.

#### `/src/constants/`
Configuration du jeu, définitions et constantes partagées.

#### `/assets/sounds/`
Fichiers audio WAV générés pour les effets sonores.

#### `/scripts/`
Scripts de génération et de maintenance du projet.

---

## 🎮 Fonctionnalités du Jeu

### 🎯 Gameplay Principal
- **Contrôle simple** : Tap pour voler, gravité automatique
- **Collision detection** : Précise avec tuyaux et obstacles
- **Score system** : Points par tuyau passé, pièces bonus
- **Level progression** : 5 niveaux avec difficulté croissante

### ⚡ Power-ups
1. **🛡️ Bouclier (Shield)** : Protection contre une collision
2. **⏱️ Ralenti (Slow)** : Réduit la vitesse du jeu
3. **🧲 Aimant (Magnet)** : Attire les pièces automatiquement

### 🪙 Système de Pièces
- **Collectibles** : Pièces placées près des tuyaux
- **Bonus scoring** : Points supplémentaires
- **Effet aimant** : Interaction avec power-up magnet

### 🏆 Progression et Niveaux
- **Niveau 1** : Débutant, espaces larges, vitesse lente
- **Niveau 2** : Facile, espaces moyens, vitesse modérée
- **Niveau 3** : Intermédiaire, espaces réduits, vitesse normale
- **Niveau 4** : Difficile, espaces serrés, vitesse rapide
- **Niveau 5** : Expert, espaces très serrés, vitesse très rapide

---

## 🎵 Système Audio

### 📁 Fichiers Audio
- **flap.wav** : Battement d'ailes (600Hz, 80ms)
- **coin.wav** : Collection de pièces (1200Hz, 120ms)
- **collision.wav** : Impact (200Hz, 150ms)
- **countdown.wav** : Compte à rebours (1000Hz, 40ms)
- **gameover.wav** : Fin de partie (300Hz, 400ms)
- **score.wav** : Célébration (800Hz, 150ms)
- **powerup_*.wav** : Power-ups spécifiques

### 🔧 AudioServiceV4
```javascript
// Initialisation
await audioServiceV4.initialize();

// Lecture des sons
await audioServiceV4.playFlap();
await audioServiceV4.playCoin();
await audioServiceV4.playPowerUp('shield');
await audioServiceV4.playCollision();
await audioServiceV4.playGameOver();
await audioServiceV4.playScore();
```

### 🎛️ Configuration Audio
- **Volume** : 15% du maximum (confortable)
- **Format** : WAV 16-bit, 44.1kHz
- **Haptics** : Désactivés par défaut
- **Mode audio** : `playsInSilentModeIOS: true`

---

## 💾 Stockage de Données

### 📊 AsyncStorage (StorageV3)
```javascript
// Sauvegarde
await saveScore(levelId, score, coins, birdColor);

// Chargement
const gameData = await loadGameData();

// Oiseau sélectionné
await saveSelectedBird('yellow');
```

### 🗄️ Structure des Données
```javascript
{
  bestScores: { 1: 15, 2: 23, 3: 31 },  // Meilleurs scores par niveau
  totalScore: 1250,                     // Score total cumulé
  totalCoins: 45,                        // Total de pièces collectées
  gamesPlayed: 23,                      // Nombre de parties jouées
  bestLevel: 3,                         // Meilleur niveau atteint
  selectedBird: 'yellow',                // Oiseau sélectionné
  unlockedLevels: [1, 2, 3]             // Niveaux débloqués
}
```

### 📈 Statistiques Avancées
- **Historique des parties** : Scores, dates, oiseaux utilisés
- **Power-ups collectés** : Types, fréquences, contexte
- **Progression par niveau** : Moyennes, maximums, tentatives
- **Analyse de performance** : Taux de réussite, amélioration

---

## ⚙️ Configuration et Déploiement

### 📱 Configuration Expo
```json
{
  "expo": {
    "name": "Sky Bird Adventure",
    "slug": "sky-bird-adventure",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "ios": {
      "bundleIdentifier": "com.yourname.skybirdadventure"
    },
    "android": {
      "package": "com.yourname.skybirdadventure"
    }
  }
}
```

### 🚀 Déploiement
```bash
# Développement
npx expo start

# Build iOS
npx expo build:ios

# Build Android
npx expo build:android

# Publication
npx expo publish
```

### 📋 Dépendances Principales
```json
{
  "expo": "^54.0.0",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "expo-av": "^16.0.8",
  "expo-audio": "^55.0.8",
  "expo-haptics": "^55.0.8",
  "@react-navigation/native": "^6.1.9",
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

---

## 👨‍💻 Guide de Développement

### 🛠️ Installation
```bash
# Clone du projet
git clone https://github.com/SalmaHaddoute/Flapy-bird.git
cd flappy-nova/flappy-nova

# Installation des dépendances
npm install

# Génération des sons
node scripts/generateSounds.js

# Démarrage du développement
npx expo start
```

### 🔧 Personnalisation

#### Ajouter un Nouveau Niveau
```javascript
// Dans src/constants/gameConfig.js
export const LEVELS = [
  // ... niveaux existants
  {
    id: 6,
    name: "Master",
    emoji: "🔥",
    subtitle: "Ultimate Challenge",
    color: "#FF1744",
    pipeGap: 80,
    pipeSpeed: 4,
    scoreToAdvance: Infinity,
    backgroundColor: "#1a0000",
    groundColor: "#8B0000"
  }
];
```

#### Ajouter un Nouveau Power-up
```javascript
// Dans src/constants/gameConfig.js
export const POWERUP = {
  // ... power-ups existants
  newPowerUp: {
    duration: 5000,
    color: "#00FF00",
    emoji: "⭐",
    probability: 0.05
  }
};
```

#### Créer un Nouveau Son
```javascript
// Dans scripts/generateSounds.js
generateWavFile(800, 0.2, 'new_sound.wav');

// Dans src/services/audioServiceV4.js
async playNewSound() {
  await this.playSound('new_sound');
}
```

### 🐛 Débogage

#### Logs Audio
```javascript
// Activer les logs audio
console.log('🎵 Audio service initialized');
console.log('🎵 Playing sound:', soundKey);
```

#### Performance
```javascript
// Monitoring des performances
console.time('gameLoop');
// ... logique du jeu
console.timeEnd('gameLoop');
```

#### Tests
```bash
# Tests unitaires
npm test

# Tests E2E
npx detox test
```

### 📝 Bonnes Pratiques

#### Code Style
- Utiliser des composants fonctionnels avec hooks
- Séparer la logique métier des composants UI
- Utiliser TypeScript pour les nouveaux projets
- Documenter les fonctions complexes

#### Performance
- Éviter les re-renders inutiles avec `useCallback` et `useMemo`
- Optimiser les images et assets
- Utiliser `FlatList` pour les listes longues
- Monitorer la mémoire sur les appareils mobiles

#### Sécurité
- Valider les entrées utilisateur
- Ne pas stocker de données sensibles en clair
- Utiliser HTTPS pour les appels API
- Implémenter une gestion d'erreurs robuste

---

## 📞 Support et Maintenance

### 🔄 Mises à Jour
- Suivre les versions d'Expo et React Native
- Mettre à jour les dépendances régulièrement
- Tester sur différentes versions d'iOS/Android

### 🐛 Rapports de Bugs
- Utiliser GitHub Issues pour les rapports
- Inclure les logs, captures d'écran et étapes de reproduction
- Spécifier la plateforme et version du système

### 🤝 Contribution
- Forker le projet
- Créer des branches pour les nouvelles fonctionnalités
- Soumettre des pull requests avec description claire
- Respecter le style de code existant

---

## 📈 Évolution Future

### 🚀 Fonctionnalités Planifiées
- **Mode multijoueur** : Compétitions en temps réel
- **Niveaux personnalisés** : Éditeur de niveaux
- **Thèmes visuels** : Différents styles graphiques
- **Classements en ligne** : Leaderboards mondiaux
- **Réseaux sociaux** : Partage de scores et achievements

### 🎯 Objectifs Techniques
- **Migration vers TypeScript** : Meilleure sécurité du type
- **Tests automatisés** : Couverture de code complète
- **CI/CD** : Intégration et déploiement continus
- **Monitoring** : Analytics et performance tracking

---

## 📚 Ressources Externes

### 📖 Documentation
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

### 🎨 Design
- [Expo Design System](https://design.expo.dev/)
- [React Native Elements](https://reactnativeelements.com/)

### 🔧 Outils
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli)
- [Reactotron](https://github.com/infinitered/reactotron)
- [Flipper](https://fbflipper.com/)

---

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.

---

**Sky Bird Adventure** - Créé avec ❤️ et React Native

*Version 1.0.0 | Dernière mise à jour : Mars 2026*
