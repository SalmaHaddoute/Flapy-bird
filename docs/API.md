# 📚 Documentation API de Sky Bird Adventure

## 📋 Table des Matières

1. [Audio Service API](#audio-service-api)
2. [Storage API](#storage-api)
3. [Game Engine API](#game-engine-api)
4. [Configuration API](#configuration-api)
5. [Navigation API](#navigation-api)

---

## 🎵 Audio Service API (AudioServiceV4)

### 📖 Vue d'Ensemble
Le service audio gère tous les effets sonores du jeu avec des vrais fichiers WAV.

### 🔧 Initialisation

```javascript
import audioServiceV4 from '../services/audioServiceV4';

// Initialiser le service audio
await audioServiceV4.initialize();
```

### 🎛️ Méthodes Principales

#### `playFlap()`
Joue le son de battement d'ailes.

```javascript
await audioServiceV4.playFlap();
```

**Retour** : `Promise<boolean>` - `true` si succès, `false` si échec

#### `playCoin()`
Joue le son de collection de pièce.

```javascript
await audioServiceV4.playCoin();
```

**Retour** : `Promise<boolean>`

#### `playCollision()`
Joue le son de collision.

```javascript
await audioServiceV4.playCollision();
```

**Retour** : `Promise<boolean>`

#### `playPowerUp(type)`
Joue le son spécifique au power-up.

```javascript
await audioServiceV4.playPowerUp('shield');  // 'shield' | 'slow' | 'magnet'
```

**Paramètres** :
- `type` (string) : Type de power-up

**Retour** : `Promise<boolean>`

#### `playScore()`
Joue le son de célébration de score.

```javascript
await audioServiceV4.playScore();
```

**Retour** : `Promise<boolean>`

#### `playCountdown()`
Joue le son de compte à rebours.

```javascript
await audioServiceV4.playCountdown();
```

**Retour** : `Promise<boolean>`

#### `playGameOver()`
Joue le son de fin de partie.

```javascript
await audioServiceV4.playGameOver();
```

**Retour** : `Promise<boolean>`

#### `playVoiceOver(type)`
Joue une voix off simulée.

```javascript
await audioServiceV4.playVoiceOver('game_over');  // 'game_over' | 'best_score' | 'level_unlocked'
```

**Paramètres** :
- `type` (string) : Type de message

**Retour** : `Promise<void>`

### 🎵 Musique de Fond

#### `playBackgroundMusic(levelId)`
Démarre la musique de fond pour un niveau.

```javascript
await audioServiceV4.playBackgroundMusic(1);  // 1-5
```

**Paramètres** :
- `levelId` (number) : ID du niveau

**Retour** : `Promise<void>`

#### `stopBackgroundMusic()`
Arrête la musique de fond.

```javascript
await audioServiceV4.stopBackgroundMusic();
```

**Retour** : `Promise<void>`

### ⚙️ Contrôles

#### `toggleSound()`
Active/désactive les sons.

```javascript
const newState = audioServiceV4.toggleSound();  // boolean
```

**Retour** : `boolean` - Nouvel état des sons

#### `toggleHaptic()`
Active/désactive les haptics.

```javascript
const newState = audioServiceV4.toggleHaptic();  // boolean
```

**Retour** : `boolean` - Nouvel état des haptics

### 📊 Propriétés

```javascript
// État actuel
audioServiceV4.soundEnabled;   // boolean
audioServiceV4.hapticEnabled;  // boolean
audioServiceV4.isInitialized;  // boolean
```

### 🧹 Nettoyage

#### `cleanup()`
Nettoie toutes les ressources audio.

```javascript
await audioServiceV4.cleanup();
```

**Retour** : `Promise<void>`

---

## 💾 Storage API (StorageV3)

### 📖 Vue d'Ensemble
API de stockage basée sur AsyncStorage pour la persistance des données du jeu.

### 🔧 Import

```javascript
import {
  saveScore,
  loadGameData,
  saveSelectedBird,
  savePowerUpCollected,
  getDetailedStats,
  resetGameData,
  initializeDatabase
} from '../utils/storageV3';
```

### 💾 Méthodes de Sauvegarde

#### `saveScore(level, score, coins, birdColor)`
Sauvegarde un score de partie.

```javascript
const success = await saveScore(1, 25, 5, 'yellow');
```

**Paramètres** :
- `level` (number) : ID du niveau
- `score` (number) : Score obtenu
- `coins` (number, optionnel) : Pièces collectées
- `birdColor` (string, optionnel) : Couleur de l'oiseau

**Retour** : `Promise<boolean>` - `true` si succès

#### `saveSelectedBird(birdColor)`
Sauvegarde l'oiseau sélectionné.

```javascript
const success = await saveSelectedBird('blue');
```

**Paramètres** :
- `birdColor` (string) : Couleur de l'oiseau

**Retour** : `Promise<boolean>`

#### `savePowerUpCollected(type, levelId, gameScore)`
Enregistre un power-up collecté.

```javascript
const success = await savePowerUpCollected('shield', 2, 15);
```

**Paramètres** :
- `type` (string) : Type de power-up
- `levelId` (number) : Niveau actuel
- `gameScore` (number) : Score au moment de la collecte

**Retour** : `Promise<boolean>`

### 📊 Méthodes de Chargement

#### `loadGameData()`
Charge toutes les données du jeu.

```javascript
const gameData = await loadGameData();
```

**Retour** : `Promise<GameData>`

```javascript
interface GameData {
  bestScores: Record<number, number>;
  totalScore: number;
  totalCoins: number;
  gamesPlayed: number;
  bestLevel: number;
  selectedBird: string;
  unlockedLevels: number[];
}
```

#### `getDetailedStats()`
Charge les statistiques détaillées.

```javascript
const stats = await getDetailedStats();
```

**Retour** : `Promise<DetailedStats>`

```javascript
interface DetailedStats {
  globalStats: {
    total_score: number;
    total_coins: number;
    games_played: number;
    best_level: number;
    current_bird: string;
  };
  topScores: Array<{
    level_id: number;
    best_score: number;
    best_coins: number;
    bird_color: string;
  }>;
  recentGames: Array<any>;
  popularPowerUps: Array<any>;
  levelProgression: Array<{
    level_id: number;
    games_played: number;
    avg_score: number;
    max_score: number;
  }>;
}
```

### 🔧 Méthodes Utilitaires

#### `initializeDatabase()`
Initialise le système de stockage.

```javascript
const success = await initializeDatabase();
```

**Retour** : `Promise<boolean>`

#### `resetGameData()`
Réinitialise toutes les données du jeu.

```javascript
const success = await resetGameData();
```

**Retour** : `Promise<boolean>`

---

## 🎮 Game Engine API (useGameEngine)

### 📖 Vue d'Ensemble
Hook personnalisé qui contient toute la logique du moteur de jeu.

### 🔧 Import

```javascript
import { useGameEngine } from '../hooks/useGameEngine';
```

### 🎯 Utilisation

```javascript
const {
  birdY,
  birdRotation,
  pipes,
  score,
  isAlive,
  particles,
  coins,
  activePowerUp,
  powerUpTimer,
  flap,
  startGame
} = useGameEngine(level, handleGameOver, handleScoreUpdate);
```

### 📋 Paramètres

- `level` (LevelConfig) : Configuration du niveau actuel
- `onGameOver` (function) : Callback appelé quand le jeu se termine
- `onScoreUpdate` (function) : Callback appelé quand le score change

### 🔄 Retours

#### `birdY` (number)
Position Y actuelle de l'oiseau.

#### `birdRotation` (number)
Angle de rotation de l'oiseau en degrés.

#### `pipes` (Pipe[])
Tableau des tuyaux actuels.

```javascript
interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
  coin?: Coin;
  powerUp?: PowerUp;
}
```

#### `score` (number)
Score actuel de la partie.

#### `isAlive` (boolean)
État de vie de l'oiseau.

#### `particles` (Particle[])
Particules d'effets visuels.

#### `coins` (number)
Nombre de pièces collectées dans la partie.

#### `activePowerUp` (string | null)
Power-up actuellement actif.

#### `powerUpTimer` (number | null)
Temps restant pour le power-up actif.

### 🎮 Méthodes

#### `flap()`
Fait sauter l'oiseau.

```javascript
flap();  // Appelé lors du tap/touch
```

#### `startGame()`
Démarre une nouvelle partie.

```javascript
startGame();  // Appelé après le countdown
```

---

## ⚙️ Configuration API (gameConfig)

### 📖 Vue d'Ensemble
Constantes et configuration du jeu.

### 🔧 Import

```javascript
import {
  SCREEN,
  BIRD,
  PIPE,
  GROUND,
  LEVELS,
  COIN,
  POWERUP
} from '../constants/gameConfig';
```

### 📱 Dimensions Écran

```javascript
SCREEN = {
  WIDTH: number,    // Largeur de l'écran
  HEIGHT: number,   // Hauteur de l'écran
}
```

### 🐦 Configuration Oiseau

```javascript
BIRD = {
  X: number,           // Position X fixe
  WIDTH: number,       // Largeur
  HEIGHT: number,      // Hauteur
  GRAVITY: number,     // Force de gravité
  JUMP_STRENGTH: number,  // Force de saut
  MAX_ROTATION: number,    // Rotation max
}
```

### 🔧 Configuration Tuyaux

```javascript
PIPE = {
  WIDTH: number,        // Largeur
  GAP: number,          // Espacement vertical
  SPEED: number,        // Vitesse de déplacement
  SPAWN_INTERVAL: number,  // Intervalle d'apparition
}
```

### 🎯 Niveaux

```javascript
LEVELS = [
  {
    id: number,
    name: string,
    emoji: string,
    subtitle: string,
    color: string,
    pipeGap: number,
    pipeSpeed: number,
    scoreToAdvance: number,
    backgroundColor: string,
    groundColor: string,
    birdColors: string[],
  }
  // ... 5 niveaux
]
```

### 🪙 Configuration Pièces

```javascript
COIN = {
  VALUE: number,        // Valeur en points
  SIZE: number,          // Taille
  SPAWN_CHANCE: number,  // Probabilité d'apparition (0-1)
  MAGNET_RANGE: number,  // Portée de l'aimant
}
```

### ⚡ Configuration Power-ups

```javascript
POWERUP = {
  DURATION: number,      // Durée en ms
  SPAWN_CHANCE: number, // Probabilité d'apparition
  SIZE: number,          // Taille
  EFFECTS: {
    shield: {
      color: string,
      emoji: string,
    },
    slow: {
      color: string,
      emoji: string,
      speedMultiplier: number,
    },
    magnet: {
      color: string,
      emoji: string,
      range: number,
    }
  }
}
```

---

## 🧭 Navigation API

### 📖 Vue d'Ensemble
API de navigation entre les écrans.

### 🔧 Import

```javascript
import { useNavigation } from '@react-navigation/native';
```

### 🎯 Utilisation

```javascript
const navigation = useNavigation();

// Navigation vers un écran
navigation.navigate('ScreenName', { params });

// Retour à l'écran précédent
navigation.goBack();

// Remplacement (pas de retour possible)
navigation.replace('ScreenName', { params });
```

### 📱 Écrans Disponibles

#### `Menu`
Écran principal du jeu.

```javascript
navigation.navigate('Menu');
```

#### `Game`
Écran de jeu.

```javascript
navigation.navigate('Game', {
  levelId: 1,
  selectedBird: 'yellow',
  bestScores: { 1: 15, 2: 23 }
});
```

**Paramètres** :
- `levelId` (number) : ID du niveau
- `selectedBird` (string) : Oiseau sélectionné
- `bestScores` (Record<number, number>) : Meilleurs scores

#### `Stats`
Écran des statistiques.

```javascript
navigation.navigate('Stats');
```

---

## 🔧 Hooks Personnalisés

### 🎯 useGameEngine
Déjà documenté dans la section Game Engine API.

### 📊 useGameData (Futur)
Hook pour accéder aux données du jeu.

```javascript
// Préparation future
const { gameData, isLoading, error } = useGameData();
```

### 🎨 useTheme (Futur)
Hook pour accéder au thème de l'application.

```javascript
// Préparation future
const { colors, fonts, spacing } = useTheme();
```

---

## 🎨 Composants API

### 🐦 Bird
Composant oiseau animé.

```javascript
<Bird
  color="yellow"
  y={birdY}
  rotation={birdRotation}
  size={44}
/>
```

**Props** :
- `color` (string) : Couleur de l'oiseau
- `y` (number) : Position Y
- `rotation` (number) : Angle de rotation
- `size` (number) : Taille

### 🔧 Pipe
Composant tuyau obstacle.

```javascript
<Pipe
  x={pipe.x}
  topHeight={pipe.topHeight}
  bottomY={pipe.bottomY}
  color={level.color}
/>
```

**Props** :
- `x` (number) : Position X
- `topHeight` (number) : Hauteur du tuyau supérieur
- `bottomY` (number) : Position Y du tuyau inférieur
- `color` (string) : Couleur du tuyau

### 🪙 Coin
Composant pièce collectible.

```javascript
<Coin
  x={coin.x}
  y={coin.y}
  collected={coin.collected}
  size={20}
/>
```

**Props** :
- `x` (number) : Position X
- `y` (number) : Position Y
- `collected` (boolean) : État de collection
- `size` (number) : Taille

### ⚡ PowerUp
Composant power-up.

```javascript
<PowerUp
  x={powerUp.x}
  y={powerUp.y}
  type={powerUp.type}
  collected={powerUp.collected}
  size={30}
/>
```

**Props** :
- `x` (number) : Position X
- `y` (number) : Position Y
- `type` (string) : Type de power-up
- `collected` (boolean) : État de collection
- `size` (number) : Taille

---

## 📊 Types et Interfaces

### 🎮 GameState
État global du jeu.

```typescript
interface GameState {
  birdY: number;
  birdRotation: number;
  pipes: Pipe[];
  score: number;
  isAlive: boolean;
  particles: Particle[];
  coins: number;
  activePowerUp: string | null;
  powerUpTimer: number | null;
}
```

### 🎯 LevelConfig
Configuration d'un niveau.

```typescript
interface LevelConfig {
  id: number;
  name: string;
  emoji: string;
  subtitle: string;
  color: string;
  pipeGap: number;
  pipeSpeed: number;
  scoreToAdvance: number;
  backgroundColor: string;
  groundColor: string;
  birdColors: string[];
}
```

### 🔧 Pipe
Structure d'un tuyau.

```typescript
interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
  coin?: Coin;
  powerUp?: PowerUp;
}
```

### 🪙 Coin
Structure d'une pièce.

```typescript
interface Coin {
  x: number;
  y: number;
  collected: boolean;
}
```

### ⚡ PowerUp
Structure d'un power-up.

```typescript
interface PowerUp {
  x: number;
  y: number;
  type: 'shield' | 'slow' | 'magnet';
  collected: boolean;
}
```

---

## 🚀 Exemples d'Utilisation

### 🎮 Démarrer une Partie

```javascript
import React from 'react';
import { useGameEngine } from '../hooks/useGameEngine';
import audioServiceV4 from '../services/audioServiceV4';

const GameComponent = ({ level }) => {
  const handleGameOver = (score, coins) => {
    console.log('Game Over:', score, coins);
  };

  const handleScoreUpdate = (score) => {
    console.log('Score:', score);
  };

  const {
    birdY,
    birdRotation,
    pipes,
    score,
    isAlive,
    flap,
    startGame
  } = useGameEngine(level, handleGameOver, handleScoreUpdate);

  const handleTap = () => {
    if (isAlive) {
      flap();
      audioServiceV4.playFlap();
    }
  };

  return (
    <View onTouchStart={handleTap}>
      {/* Rendu du jeu */}
    </View>
  );
};
```

### 💾 Sauvegarder des Données

```javascript
import { saveScore, loadGameData } from '../utils/storageV3';

const GameLogic = async () => {
  // Sauvegarder un score
  const success = await saveScore(1, 25, 5, 'yellow');
  
  if (success) {
    // Charger les données mises à jour
    const gameData = await loadGameData();
    console.log('Meilleur score niveau 1:', gameData.bestScores[1]);
  }
};
```

### 🎵 Utiliser l'Audio

```javascript
import audioServiceV4 from '../services/audioServiceV4';

const AudioExample = async () => {
  // Initialiser l'audio
  await audioServiceV4.initialize();
  
  // Jouer différents sons
  await audioServiceV4.playFlap();
  await audioServiceV4.playCoin();
  await audioServiceV4.playPowerUp('shield');
  
  // Contrôler l'audio
  const soundEnabled = audioServiceV4.toggleSound();
  console.log('Sons activés:', soundEnabled);
};
```

---

## 📝 Notes d'Implémentation

### 🔧 Bonnes Pratiques

1. **Toujours vérifier les retours des promesses**
2. **Gérer les erreurs avec try/catch**
3. **Utiliser les callbacks pour les événements du jeu**
4. **Nettoyer les ressources dans useEffect cleanup**

### ⚡ Performance

1. **Utiliser useCallback pour les callbacks**
2. **Éviter les re-renders inutiles**
3. **Utiliser useNativeDriver pour les animations**
4. **Monitorer la mémoire sur mobile**

### 🐛 Debugging

1. **Utiliser les logs structurés**
2. **Monitorer les performances avec console.time**
3. **Utiliser les React DevTools**
4. **Tester sur différents appareils**

---

## 📞 Support

Pour toute question sur l'API, consultez :
- La documentation du code source
- Les exemples dans le projet
- Les tests unitaires
- La communauté React Native

---

*Documentation API mise à jour : Mars 2026*
