import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

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
      this.isInitialized = true;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  // Créer des sons synthétiques car nous n'avons pas de fichiers audio
  async createSound(frequency = 440, duration = 100) {
    try {
      // Créer un son simple avec l'API Web Audio (simulation)
      const soundObject = new Audio.Sound();
      return soundObject;
    } catch (error) {
      console.warn('Sound creation failed:', error);
      return null;
    }
  }

  // Effets sonores
  async playFlap() {
    if (!this.soundEnabled) return;
    
    try {
      // Son de battement d'ailes - fréquence medium courte
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // Simulation sonore - dans une vraie app, vous chargeriez un fichier audio
      console.log('🎵 Flap sound');
    } catch (error) {
      console.warn('Flap sound failed:', error);
    }
  }

  async playCoin() {
    if (!this.soundEnabled) return;
    
    try {
      // Son de pièce - fréquence haute, son cristallin
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('🎵 Coin sound - ting!');
    } catch (error) {
      console.warn('Coin sound failed:', error);
    }
  }

  async playPowerUp(type) {
    if (!this.soundEnabled) return;
    
    try {
      // Son de power-up - selon le type
      switch (type) {
        case 'shield':
          await Haptics.heavyAsync();
          console.log('🎵 Shield power-up sound - deep tone');
          break;
        case 'slow':
          await Haptics.mediumAsync();
          console.log('🎵 Slow power-up sound - descending tone');
          break;
        case 'magnet':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          console.log('🎵 Magnet power-up sound - magnetic buzz');
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('🎵 Generic power-up sound');
      }
    } catch (error) {
      console.warn('Power-up sound failed:', error);
    }
  }

  async playCollision() {
    if (!this.soundEnabled) return;
    
    try {
      // Son de collision - impact lourd
      await Haptics.heavyAsync();
      console.log('🎵 Collision sound - boom!');
    } catch (error) {
      console.warn('Collision sound failed:', error);
    }
  }

  async playScore() {
    if (!this.soundEnabled) return;
    
    try {
      // Son de score - notification positive
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('🎵 Score sound - success!');
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
      // Son de game over - son descendant
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      console.log('🎵 Game over sound - descending tone');
    } catch (error) {
      console.warn('Game over sound failed:', error);
    }
  }

  async playCountdown() {
    if (!this.soundEnabled) return;
    
    try {
      // Son de countdown - tic-tac
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      console.log('🎵 Countdown sound - tick!');
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
      
      // Dans une vraie app, vous chargeriez des fichiers MP3 différents par niveau
      // Pour l'instant, nous simulons avec des logs
      console.log(`🎵 Playing background music for level ${levelId}`);
      
      // Simulation de musique de fond avec différentes "temporisations" par niveau
      const tempo = Math.max(1000 - (levelId * 100), 300); // Plus rapide avec les niveaux
      
      // Créer une boucle de musique simulée
      this.backgroundMusicInterval = setInterval(() => {
        console.log(`🎵 Background beat - tempo: ${tempo}ms`);
      }, tempo);
      
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
    
    // Nettoyer tous les sons chargés
    Object.values(this.sounds).forEach(async (sound) => {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn('Sound cleanup failed:', error);
      }
    });
    
    this.sounds = {};
    this.isInitialized = false;
  }
}

// Singleton pour une utilisation facile
const audioService = new AudioService();

export default audioService;
