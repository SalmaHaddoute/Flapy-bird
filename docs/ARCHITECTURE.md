# 🏗️ Architecture Technique de Sky Bird Adventure

## 📋 Vue d'Ensemble de l'Architecture

L'architecture de Sky Bird Adventure est basée sur les principes modernes de React Native avec une séparation claire des responsabilités, une scalabilité et une maintenabilité optimales.

---

## 🏛️ Structure Architecturale

### 📱 Architecture en Couches

```
┌─────────────────────────────────────────┐
│           Présentation (UI)              │
├─────────────────────────────────────────┤
│  Screens  │  Components  │  Navigation    │
├─────────────────────────────────────────┤
│              Logique Métier               │
├─────────────────────────────────────────┤
│    Hooks    │   Services   │   Utils     │
├─────────────────────────────────────────┤
│                Données                    │
├─────────────────────────────────────────┤
│  Storage  │  Constants  │  Config       │
└─────────────────────────────────────────┘
```

### 🔄 Flux de Données Unidirectionnel

```
User Input → Components → Hooks → Services → Storage
     ↑                                                    ↓
UI Update ← State ← Business Logic ← Data Processing
```

---

## 📁 Détail de l'Architecture

### 🎨 Couche Présentation

#### `/src/screens/`
**Responsabilité** : Gestion des écrans et navigation

**Composants principaux** :
- **MenuScreen** : Menu principal, sélection de niveaux, statistiques
- **GameScreen** : Interface de jeu, contrôles, affichage
- **StatsScreen** : Tableau de bord des statistiques

**Principes** :
- Un écran = une responsabilité
- Gestion d'état local avec hooks
- Navigation déclarative avec React Navigation

#### `/src/components/`
**Responsabilité** : Composants UI réutilisables

**Composants** :
- **Bird** : Oiseau animé avec physique
- **Pipe** : Tuyaux obstacles avec collision
- **Coin** : Pièces collectibles avec animation
- **PowerUp** : Power-ups avec effets visuels

**Principes** :
- Composants purs quand possible
- Props typées et documentées
- Styles séparés et réutilisables

---

### 🧠 Couche Logique Métier

#### `/src/hooks/`
**Responsabilité** : Logique métier et état partagé

**Hooks principaux** :
- **useGameEngine** : Cœur du moteur de jeu
  - Physique et collision
  - Gestion des scores
  - Boucle de jeu (requestAnimationFrame)
  - Power-ups et pièces

**Principes** :
- Hooks personnalisés pour la logique complexe
- Séparation des préoccupations
- Performance avec useCallback et useMemo

#### `/src/services/`
**Responsabilité** : Services métier et opérations asynchrones

**Services** :
- **audioServiceV4** : Gestion audio complète
  - Chargement des fichiers WAV
  - Gestion du volume
  - Contrôle de la lecture
- **databaseService** : Service de données (préparé pour SQLite)

**Principes** :
- Services singleton pour l'état global
- API asynchrone cohérente
- Gestion d'erreurs robuste

---

### 💾 Couche Données

#### `/src/utils/`
**Responsabilité** : Utilitaires et helpers

**Modules** :
- **storageV3** : Interface de stockage (AsyncStorage)
  - Sauvegarde/chargement des scores
  - Persistance des préférences
  - Gestion des erreurs
- **audioBufferGenerator** : Génération audio (héritage)

**Principes** :
- Fonctions pures et testables
- Interface unifiée pour le stockage
- Fallbacks et gestion d'erreurs

#### `/src/constants/`
**Responsabilité** : Configuration et constantes

**Fichiers** :
- **gameConfig.js** : Configuration principale du jeu
  - Définition des niveaux
  - Constantes physiques
  - Configuration des power-ups
  - Couleurs et thèmes

**Principes** :
- Single source of truth
- Configuration centralisée
- Facile à modifier et étendre

---

## 🔄 Patterns Architecturels

### 🎯 Singleton Pattern
**Utilisation** : Services globaux
```javascript
// audioServiceV4.js
class AudioServiceV4 {
  // ... implémentation
}
const audioServiceV4 = new AudioServiceV4();
export default audioServiceV4;
```

**Avantages** :
- Instance unique partagée
- État global cohérent
- Performance optimisée

### 🎣 Custom Hooks Pattern
**Utilisation** : Logique réutilisable
```javascript
// useGameEngine.js
const useGameEngine = (level, onGameOver, onScoreUpdate) => {
  // Logique complexe encapsulée
  return { birdY, birdRotation, pipes, score, isAlive };
};
```

**Avantages** :
- Logique réutilisable
- Séparation des préoccupations
- Tests facilités

### 📦 Provider Pattern (Préparé)
**Utilisation future** : Gestion d'état global
```javascript
// Préparation pour Redux/Context
const GameProvider = ({ children }) => {
  // État global du jeu
  return <GameContext.Provider>{children}</GameContext.Provider>;
};
```

---

## 🎮 Architecture du Moteur de Jeu

### 🔄 Game Loop Architecture

```
┌─────────────────┐
│  requestAnimationFrame  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Physics Update │  ←→  useGameEngine Hook
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│ Collision Detect │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   Score Update  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│   State Update  │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐
│     Render      │
└─────────────────┘
```

### 🎯 Composants du Moteur

#### Physique
```javascript
// Gravité et mouvement
const newBirdY = birdYRef.current + BIRD.GRAVITY;
const newBirdRotation = isAliveRef.current ? 
  Math.min(Math.max((newBirdY - BIRD.Y) * 0.5, -30), 90) : 90;
```

#### Collision
```javascript
// Détection précise
const checkCollision = (birdY, pipes) => {
  // Logique de collision avec tuyaux et sol
  return collision;
};
```

#### Scoring
```javascript
// Calcul des scores
if (pipe.x + PIPE.WIDTH < BIRD.X && !pipe.passed) {
  newScore++;
  pipe.passed = true;
}
```

---

## 🎵 Architecture Audio

### 📁 Système Audio en Couches

```
┌─────────────────────────────────┐
│        Interface Audio           │
├─────────────────────────────────┤
│  playFlap() │ playCoin() │ ...  │
├─────────────────────────────────┤
│        AudioServiceV4           │
├─────────────────────────────────┤
│  Sound Loading │ Volume Control │
├─────────────────────────────────┤
│         Expo Audio              │
├─────────────────────────────────┤
│      Fichiers WAV               │
└─────────────────────────────────┘
```

### 🎛️ Gestion des Ressources Audio

#### Chargement
```javascript
// Chargement optimisé des sons
const { sound } = await Audio.Sound.createAsync(soundFile);
await sound.setVolumeAsync(0.3); // Volume contrôlé
this.sounds[key] = sound;
```

#### Lecture
```javascript
// Lecture avec gestion d'erreurs
async playSound(soundKey) {
  try {
    const sound = this.sounds[soundKey];
    if (sound) {
      await sound.replayAsync();
      return true;
    }
  } catch (error) {
    console.warn(`Failed to play ${soundKey}:`, error);
    return false;
  }
}
```

---

## 💾 Architecture de Stockage

### 📊 Interface de Stockage Unifiée

```javascript
// storageV3.js - Interface abstraite
export const saveScore = async (level, score, coins, birdColor) => {
  // Implémentation AsyncStorage
};

export const loadGameData = async () => {
  // Chargement avec fallbacks
};
```

### 🗄️ Structure des Données

#### Modèle de Données
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

#### Persistance
```javascript
// Clés de stockage structurées
const KEYS = {
  BEST_SCORES: "skybird_best_scores",
  TOTAL_SCORE: "skybird_total_score",
  BEST_LEVEL: "skybird_best_level",
  SELECTED_BIRD: "skybird_selected_bird",
  GAMES_PLAYED: "skybird_games_played",
  TOTAL_COINS: "skybird_total_coins",
};
```

---

## 🎨 Architecture des Composants

### 📦 Structure des Composants

#### Composant de Base (Bird)
```javascript
const Bird = ({ color, y, rotation, size }) => {
  // Logique de rendu pure
  // Props typées
  // Styles optimisés
};
```

#### Composant avec État (GameScreen)
```javascript
const GameScreen = ({ route, navigation }) => {
  // Gestion d'état local
  // Effets secondaires
  // Logique de navigation
};
```

### 🎯 Patterns de Composants

#### Composition sur Héritage
```javascript
// Composition de composants réutilisables
const GameElement = ({ children, position, style }) => (
  <View style={[styles.base, position, style]}>
    {children}
  </View>
);
```

#### Props Drilling Évité
```javascript
// Context ou hooks pour éviter le props drilling
const useGameData = () => {
  // Hook personnalisé pour les données du jeu
};
```

---

## 🔧 Architecture de Configuration

### 📋 Configuration Centralisée

```javascript
// gameConfig.js - Single Source of Truth
export const SCREEN = {
  WIDTH: Dimensions.get('window').width,
  HEIGHT: Dimensions.get('window').height,
};

export const BIRD = {
  X: 100,
  WIDTH: 44,
  HEIGHT: 32,
  GRAVITY: 0.6,
  JUMP_STRENGTH: -10,
};

export const LEVELS = [
  {
    id: 1,
    name: "Beginner",
    pipeGap: 150,
    pipeSpeed: 1.5,
    scoreToAdvance: 5,
  },
  // ...
];
```

### 🎨 Thèmes et Styles

#### Système de Thèmes
```javascript
const COLORS = {
  PRIMARY: '#1a5490',
  SECONDARY: '#87CEEB',
  SUCCESS: '#4CAF50',
  DANGER: '#F44336',
  WARNING: '#FF9800',
};
```

#### Styles Réutilisables
```javascript
const baseStyles = {
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
};
```

---

## 🚀 Performance Architecture

### ⚡ Optimisations

#### React Performance
```javascript
// useCallback pour éviter les re-renders
const handleScoreUpdate = useCallback((score) => {
  setCurrentScore(score);
  audioServiceV4.playScore();
}, []);

// useMemo pour les calculs coûteux
const pipePositions = useMemo(() => {
  return pipes.map(pipe => calculatePipePosition(pipe));
}, [pipes]);
```

#### Animation Performance
```javascript
// useNativeDriver pour les animations
Animated.timing(value, {
  toValue: 1,
  duration: 200,
  useNativeDriver: true, // Performance native
}).start();
```

#### Memory Management
```javascript
// Cleanup des ressources
useEffect(() => {
  return () => {
    // Nettoyage des animations
    // Arrêt des timers
    // Libération des ressources audio
  };
}, []);
```

---

## 🔄 Évolutivité Architecturelle

### 📈 Scalabilité

#### Ajout de Niveaux
```javascript
// Extension facile dans gameConfig.js
export const LEVELS = [
  ...existingLevels,
  {
    id: 6,
    name: "Expert",
    // Configuration du nouveau niveau
  },
];
```

#### Ajout de Power-ups
```javascript
// Extension du système de power-ups
export const POWERUP = {
  ...existingPowerUps,
  newPowerUp: {
    duration: 5000,
    effect: (gameState) => { /* logique */ },
  },
};
```

#### Migration vers TypeScript
```javascript
// Préparation pour TypeScript
interface GameState {
  birdY: number;
  birdRotation: number;
  pipes: Pipe[];
  score: number;
  isAlive: boolean;
}
```

### 🧪 Testabilité

#### Tests Unitaires
```javascript
// Tests des hooks
describe('useGameEngine', () => {
  it('should update bird position correctly', () => {
    // Test de la logique
  });
});
```

#### Tests d'Intégration
```javascript
// Tests des composants
describe('GameScreen', () => {
  it('should render game elements correctly', () => {
    // Test du rendu
  });
});
```

---

## 📊 Monitoring et Debugging

### 🔍 Outils de Debug

#### Logs Structurés
```javascript
// Logs avec contexte
console.log('🎵 Playing sound:', soundKey, {
  timestamp: Date.now(),
  level: currentLevel,
  gameState: currentState,
});
```

#### Performance Monitoring
```javascript
// Monitoring des performances
console.time('gameLoop');
// ... logique du jeu
console.timeEnd('gameLoop');
```

#### Error Boundaries
```javascript
// Gestion des erreurs
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Game Error:', error, errorInfo);
  }
}
```

---

## 🔮 Évolution Future

### 🚀 Architecture Cible

#### État Global (Context/Redux)
```javascript
// Migration prévue vers un état global
const GameContext = createContext();
const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useReducer(gameReducer, initialState);
  return (
    <GameContext.Provider value={{ gameState, setGameState }}>
      {children}
    </GameContext.Provider>
  );
};
```

#### Microservices Architecture
```javascript
// Services découplés
const GameService = {
  physics: new PhysicsService(),
  audio: new AudioService(),
  storage: new StorageService(),
  analytics: new AnalyticsService(),
};
```

#### Server-Side Features
```javascript
// Préparation pour les fonctionnalités en ligne
const OnlineService = {
  leaderboards: new LeaderboardService(),
  multiplayer: new MultiplayerService(),
  achievements: new AchievementService(),
};
```

---

## 📚 Références Architecturelles

### 📖 Patterns Utilisés
- **Singleton Pattern** : Services globaux
- **Custom Hooks Pattern** : Logique réutilisable
- **Composition Pattern** : Composants UI
- **Observer Pattern** : Game events
- **Strategy Pattern** : Power-ups

### 🎯 Principes SOLID
- **S**ingle Responsibility : Un composant = une responsabilité
- **O**pen/Closed : Extensible sans modification
- **L**iskov Substitution : Composants interchangeables
- **I**nterface Segregation : Interfaces spécifiques
- **D**ependency Inversion : Abstractions sur implémentations

---

## 📝 Conclusion

L'architecture de Sky Bird Adventure est conçue pour être :

- **Maintenable** : Code clair et bien structuré
- **Scalable** : Facile à étendre avec de nouvelles fonctionnalités
- **Performant** : Optimisé pour les appareils mobiles
- **Testable** : Logique découplée et testable
- **Robust** : Gestion d'erreurs et fallbacks

Cette architecture permet une évolution continue tout en maintenant une base de code saine et performante.

---

*Document mis à jour : Mars 2026*
