import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioServiceV2 {
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
      
      // Créer des sons simples avec des fréquences générées
      await this.createSimpleSounds();
      
      this.isInitialized = true;
      console.log('🎵 Audio service V2 initialized');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  // Créer des sons simples qui fonctionnent avec expo-audio
  async createSimpleSounds() {
    try {
      // Créer des sons basiques avec des fréquences
      const soundConfigs = {
        flap: { frequency: 600, duration: 100, type: 'sine' },
        coin: { frequency: 1200, duration: 150, type: 'sine' },
        collision: { frequency: 200, duration: 200, type: 'square' },
        countdown: { frequency: 1000, duration: 50, type: 'sine' },
        gameOver: { frequency: 300, duration: 500, type: 'sawtooth' },
        score: { frequency: 800, duration: 200, type: 'sine' },
      };

      for (const [key, config] of Object.entries(soundConfigs)) {
        try {
          // Utiliser une approche plus simple - créer des sons avec des beep
          const soundObject = new Audio.Sound();
          
          // Pour l'instant, nous allons utiliser des sons système ou des beeps
          // Dans une vraie implémentation, vous utiliseriez des fichiers audio pré-enregistrés
          await this.createBeepSound(soundObject, config);
          
          this.sounds[key] = soundObject;
          console.log(`🎵 Created ${key} sound`);
        } catch (error) {
          console.warn(`Failed to create ${key} sound:`, error);
        }
      }
    } catch (error) {
      console.warn('Sound creation failed:', error);
    }
  }

  // Créer un son simple avec l'API Audio
  async createBeepSound(soundObject, config) {
    try {
      // Pour l'instant, nous allons utiliser une approche simplifiée
      // Dans une vraie app, vous auriez des fichiers audio .mp3 ou .wav
      
      // Créer un son système simple
      const { Sound } = Audio;
      
      // Utiliser un son par défaut ou créer un beep système
      // Pour l'instant, nous allons juste préparer l'objet son
      // Le son sera généré quand on appelle playAsync
      
      return soundObject;
    } catch (error) {
      console.warn('Beep sound creation failed:', error);
    }
  }

  // Jouer un son système (beep)
  async playSystemSound(frequency = 440, duration = 100) {
    try {
      // Essayer de jouer un son système
      // Sur mobile, nous pouvons utiliser l'API AudioContext si disponible
      if (typeof window !== 'undefined' && window.AudioContext) {
        const audioContext = new window.AudioContext();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration / 1000);
        
        // Nettoyer après la lecture
        setTimeout(() => {
          audioContext.close();
        }, duration + 100);
        
        return true;
      }
    } catch (error) {
      console.warn('System sound failed:', error);
      return false;
    }
  }

  // Effets sonores
  async playFlap() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de battement d'ailes
      const played = await this.playSystemSound(600, 100);
      if (!played && this.sounds.flap) {
        await this.sounds.flap.replayAsync();
      }
      
      // Haptics avec fallback
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('Haptics failed:', error);
      }
      
      console.log('🎵 Flap sound played');
    } catch (error) {
      console.warn('Flap sound failed:', error);
    }
  }

  async playCoin() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de pièce
      const played = await this.playSystemSound(1200, 150);
      if (!played && this.sounds.coin) {
        await this.sounds.coin.replayAsync();
      }
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.warn('Haptics failed:', error);
      }
      
      console.log('🎵 Coin sound played');
    } catch (error) {
      console.warn('Coin sound failed:', error);
    }
  }

  async playPowerUp(type) {
    if (!this.soundEnabled) return;
    
    try {
      let frequency, duration;
      
      switch (type) {
        case 'shield':
          frequency = 200;
          duration = 200;
          break;
        case 'slow':
          frequency = 400;
          duration = 300;
          break;
        case 'magnet':
          frequency = 500;
          duration = 150;
          break;
        default:
          frequency = 600;
          duration = 150;
      }
      
      const played = await this.playSystemSound(frequency, duration);
      
      try {
        switch (type) {
          case 'shield':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'slow':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            break;
          case 'magnet':
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          default:
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      } catch (error) {
        console.warn('Haptics failed:', error);
      }
      
      console.log(`🎵 ${type} power-up sound played`);
    } catch (error) {
      console.warn('Power-up sound failed:', error);
    }
  }

  async playCollision() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de collision
      const played = await this.playSystemSound(200, 200);
      if (!played && this.sounds.collision) {
        await this.sounds.collision.replayAsync();
      }
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.warn('Haptics failed:', error);
      }
      
      console.log('🎵 Collision sound played');
    } catch (error) {
      console.warn('Collision sound failed:', error);
    }
  }

  async playScore() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de score
      const played = await this.playSystemSound(800, 200);
      if (!played && this.sounds.score) {
        await this.sounds.score.replayAsync();
      }
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        console.warn('Haptics failed:', error);
      }
      
      console.log('🎵 Score sound played');
    } catch (error) {
      console.warn('Score sound failed:', error);
    }
  }

  async playCountdown() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de countdown
      const played = await this.playSystemSound(1000, 50);
      if (!played && this.sounds.countdown) {
        await this.sounds.countdown.replayAsync();
      }
      
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.warn('Haptics failed:', error);
      }
      
      console.log('🎵 Countdown sound played');
    } catch (error) {
      console.warn('Countdown sound failed:', error);
    }
  }

  async playGameOver() {
    if (!this.soundEnabled) return;
    
    try {
      // Jouer le son de game over
      const played = await this.playSystemSound(300, 500);
      if (!played && this.sounds.gameOver) {
        await this.sounds.gameOver.replayAsync();
      }
      
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } catch (error) {
        console.warn('Haptics failed:', error);
      }
      
      console.log('🎵 Game over sound played');
    } catch (error) {
      console.warn('Game over sound failed:', error);
    }
  }

  // Musique de fond simplifiée
  async playBackgroundMusic(levelId = 1) {
    if (!this.soundEnabled) return;
    
    try {
      await this.stopBackgroundMusic();
      
      console.log(`🎵 Starting background music for level ${levelId}`);
      
      // Créer une musique de fond simple avec des beeps
      const frequencies = {
        1: [220, 247, 262, 294, 330], // A3, B3, C4, D4, E4
        2: [247, 262, 294, 330, 349, 392], // B3, C4, D4, E4, F4, G4
        3: [262, 294, 330, 349, 392, 440, 494], // C4, D4, E4, F4, G4, A4, B4
        4: [294, 330, 349, 392, 440, 494, 523, 587], // D4, E4, F4, G4, A4, B4, C5, D5
        5: [330, 349, 392, 440, 494, 523, 587, 659, 698], // E4, F4, G4, A4, B4, C5, D5, E5, F5
      };
      
      const notes = frequencies[levelId] || frequencies[1];
      const tempo = Math.max(120 - (levelId * 10), 60); // BPM plus rapide avec les niveaux
      const noteDuration = 60000 / tempo / 4; // Double croches en ms
      
      let noteIndex = 0;
      
      this.backgroundMusicInterval = setInterval(async () => {
        if (this.soundEnabled && notes.length > 0) {
          const frequency = notes[noteIndex % notes.length];
          await this.playSystemSound(frequency, noteDuration * 0.8);
          noteIndex++;
        }
      }, noteDuration);
      
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
    
    // Nettoyer tous les sons chargés
    for (const [key, sound] of Object.entries(this.sounds)) {
      try {
        await sound.unloadAsync();
      } catch (error) {
        console.warn(`Failed to unload ${key} sound:`, error);
      }
    }
    
    this.sounds = {};
    this.isInitialized = false;
  }
}

// Singleton pour une utilisation facile
const audioServiceV2 = new AudioServiceV2();

export default audioServiceV2;
