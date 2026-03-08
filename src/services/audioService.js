import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import audioBufferGenerator from '../utils/audioBufferGenerator';
import backgroundMusicGenerator from '../utils/backgroundMusicGenerator';

class AudioService {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isInitialized = false;
    this.soundEnabled = true;
    this.hapticEnabled = true;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Pré-générer les buffers audio
      await this.preloadSounds();
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  // Pré-charger tous les sons
  async preloadSounds() {
    try {
      // Générer les buffers audio
      this.audioBuffers = {
        flap: audioBufferGenerator.generateFlapSound(),
        coin: audioBufferGenerator.generateCoinSound(),
        collision: audioBufferGenerator.generateCollisionSound(),
        countdown: audioBufferGenerator.generateCountdownSound(),
        gameOver: audioBufferGenerator.generateGameOverSound(),
        score: audioBufferGenerator.generateScoreSound(),
      };
      
      // Créer les objets sonores
      for (const [key, buffer] of Object.entries(this.audioBuffers)) {
        const dataURI = audioBufferGenerator.createAudioDataURI(buffer);
        const soundObject = new Audio.Sound();
        
        try {
          await soundObject.loadAsync({ uri: dataURI });
          this.sounds[key] = soundObject;
        } catch (error) {
          console.warn(`Failed to load ${key} sound:`, error);
        }
      }
      
      console.log('🎵 All sounds preloaded successfully');
    } catch (error) {
      console.warn('Sound preloading failed:', error);
    }
  }

  // Effets sonores
  async playFlap() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de battement d'ailes
      if (this.sounds.flap) {
        await this.sounds.flap.replayAsync();
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('🎵 Flap sound played');
    } catch (error) {
      console.warn('Flap sound failed:', error);
    }
  }

  async playCoin() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de pièce
      if (this.sounds.coin) {
        await this.sounds.coin.replayAsync();
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('🎵 Coin sound played');
    } catch (error) {
      console.warn('Coin sound failed:', error);
    }
  }

  async playPowerUp(type) {
    if (!this.soundEnabled) return;
    
    try {
      // Générer et jouer le son de power-up
      const buffer = audioBufferGenerator.generatePowerUpSound(type);
      const dataURI = audioBufferGenerator.createAudioDataURI(buffer);
      
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: dataURI });
      await soundObject.playAsync();
      
      // Nettoyer après la lecture
      setTimeout(() => {
        soundObject.unloadAsync();
      }, 1000);
      
      switch (type) {
        case 'shield':
          await Haptics.heavyAsync();
          console.log('🎵 Shield power-up sound played');
          break;
        case 'slow':
          await Haptics.mediumAsync();
          console.log('🎵 Slow power-up sound played');
          break;
        case 'magnet':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          console.log('🎵 Magnet power-up sound played');
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('🎵 Generic power-up sound played');
      }
    } catch (error) {
      console.warn('Power-up sound failed:', error);
    }
  }

  async playCollision() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de collision
      if (this.sounds.collision) {
        await this.sounds.collision.replayAsync();
      }
      await Haptics.heavyAsync();
      console.log('🎵 Collision sound played');
    } catch (error) {
      console.warn('Collision sound failed:', error);
    }
  }

  async playScore() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de score
      if (this.sounds.score) {
        await this.sounds.score.replayAsync();
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('🎵 Score sound played');
    } catch (error) {
      console.warn('Score sound failed:', error);
    }
  }

  async playLevelComplete() {
    if (!this.soundEnabled) return;
    
    try {
      // Son de niveau complété - célébration
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('🎵 Level complete sound - fanfare!');
    } catch (error) {
      console.warn('Level complete sound failed:', error);
    }
  }

  async playGameOver() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de game over
      if (this.sounds.gameOver) {
        await this.sounds.gameOver.replayAsync();
      }
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('🎵 Game over sound played');
    } catch (error) {
      console.warn('Game over sound failed:', error);
    }
  }

  async playCountdown() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de countdown
      if (this.sounds.countdown) {
        await this.sounds.countdown.replayAsync();
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('🎵 Countdown sound played');
    } catch (error) {
      console.warn('Countdown sound failed:', error);
    }
  }

  // Musique de fond
  async playBackgroundMusic(levelId = 1) {
    if (!this.soundEnabled) return;
    
    try {
      // Arrêter la musique existante
      await this.stopBackgroundMusic();
      
      console.log(`🎵 Starting real background music for level ${levelId}`);
      
      // Démarrer la musique de fond avec le générateur
      backgroundMusicGenerator.startBackgroundMusic(levelId, (frequency) => {
        // Callback quand une note est jouée (pour debug)
        console.log(`🎵 Playing note: ${frequency}Hz`);
      });
      
    } catch (error) {
      console.warn('Background music failed:', error);
    }
  }

  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusicInterval) {
        clearInterval(this.backgroundMusicInterval);
        this.backgroundMusicInterval = null;
      }
      
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      }
      
      // Arrêter la musique de fond
      backgroundMusicGenerator.stopBackgroundMusic();
      
      console.log('🎵 Background music stopped');
    } catch (error) {
      console.warn('Stop background music failed:', error);
    }
  }

  // Voix off (simulées avec des logs pour l'instant)
  async playVoiceOver(type) {
    if (!this.soundEnabled) return;
    
    try {
      switch (type) {
        case 'powerup_activated':
          console.log('🗣️ Voice: "Power-up activé!"');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'level_unlocked':
          console.log('🗣️ Voice: "Niveau débloqué!"');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'best_score':
          console.log('🗣️ Voice: "Meilleur score!"');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'game_over':
          console.log('🗣️ Voice: "Game Over!"');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'level_complete':
          console.log('🗣️ Voice: "Niveau terminé!"');
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        default:
          console.log('🗣️ Voice: Generic message');
      }
    } catch (error) {
      console.warn('Voice over failed:', error);
    }
  }

  // Contrôles
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    if (!this.soundEnabled) {
      this.stopBackgroundMusic();
    }
    return this.soundEnabled;
  }

  toggleHaptic() {
    this.hapticEnabled = !this.hapticEnabled;
    return this.hapticEnabled;
  }

  async cleanup() {
    await this.stopBackgroundMusic();
    
    // Nettoyer tous les sons préchargés
    for (const [key, sound] of Object.entries(this.sounds)) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn(`Failed to unload ${key} sound:`, error);
      }
    }
    
    this.sounds = {};
    this.audioBuffers = {};
    this.isInitialized = false;
  }
}

// Singleton pour une utilisation facile
const audioService = new AudioService();

export default audioService;
