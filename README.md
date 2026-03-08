# 🐦 Sky Bird Adventure — React Native Game

A feature-rich Sky Bird Adventure game built with **React Native + Expo 52**.

## ✅ Compatible
- Windows, Mac, Linux
- Node.js 18+ et 20+
- Expo Go (iOS & Android)

---

## 🚀 Installation & Lancement

```bash
# 1. Aller dans le dossier
cd flappy-nova

# 2. Installer les dépendances
npm install

# 3. Lancer Expo
npx expo start
```

Scanne le QR code avec l'app **Expo Go** sur ton téléphone.

### Lancer sur simulateur
```bash
npx expo start --android   # Android Studio requis
npx expo start --ios       # Mac + Xcode requis
```

---

## 🎮 Fonctionnalités

### Gameplay
- Tape l'écran pour faire battre les ailes
- Évite les tuyaux (haut et bas)
- Compte à rebours 3-2-1 avant chaque partie
- Particules au battement d'ailes
- Score en temps réel avec animation

### 🏆 5 Niveaux progressifs
| # | Nom | Vitesse | Écart | Score requis |
|---|-----|---------|-------|--------------|
| 1 | 🌱 NOVICE | 2.8 | 195px | 10 |
| 2 | 🐣 FLEDGLING | 3.4 | 178px | 25 |
| 3 | 🦅 AVIATOR | 4.0 | 162px | 45 |
| 4 | ✈️ ACE PILOT | 4.8 | 148px | 70 |
| 5 | 👑 LEGEND | 5.8 | 132px | ∞ |

Les niveaux se débloquent progressivement en atteignant le score cible.

### 🐦 5 Skins d'oiseaux
- 🟡 Classic (jaune), 🔵 Ice (bleu), 🔴 Fire (rouge), 🟢 Forest (vert), 🟣 Royal (violet)

### 💾 Sauvegarde persistante (AsyncStorage)
- Meilleur score par niveau
- Total de points accumulés
- Nombre de parties jouées
- Meilleur niveau atteint
- Skin sélectionné

---

## 📁 Structure du projet

```
flappy-nova/
├── App.js                          ← Navigation (Stack)
├── app.json                        ← Config Expo
├── package.json
├── babel.config.js
└── src/
    ├── constants/
    │   └── gameConfig.js           ← Niveaux, vitesses, couleurs
    ├── hooks/
    │   └── useGameEngine.js        ← Boucle de jeu (rAF + physique)
    ├── components/
    │   ├── Bird.js                 ← Oiseau animé avec ailes battantes
    │   └── Pipe.js                 ← Tuyaux haut/bas
    ├── screens/
    │   ├── MenuScreen.js           ← Menu (Levels / Birds / Records)
    │   └── GameScreen.js           ← Écran de jeu
    └── utils/
        └── storage.js              ← Lecture/écriture AsyncStorage
```

---

## ⚙️ Personnalisation

Édite `src/constants/gameConfig.js` pour :
- Changer la vitesse, l'écart, la gravité par niveau
- Ajouter de nouveaux niveaux
- Ajouter de nouveaux skins d'oiseaux
