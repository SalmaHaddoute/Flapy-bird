import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioServiceV3 {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isInitialized = false;
    this.soundEnabled = true;
    this.hapticEnabled = true;
    this.backgroundMusicInterval = null;
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
      
      // Créer des sons de base qui fonctionnent
      await this.createBaseSounds();
      
      this.isInitialized = true;
      console.log('🎵 Audio service V3 initialized');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  // Créer des sons de base qui fonctionnent sur mobile
  async createBaseSounds() {
    try {
      // Pour l'instant, nous allons utiliser une approche plus simple
      // Les sons seront créés à la volée quand nécessaires
      
      console.log('🎵 Base sounds system ready');
    } catch (error) {
      console.warn('Base sounds creation failed:', error);
    }
  }

  // Jouer un son avec l'API Audio simple
  async playSimpleSound(frequency = 440, duration = 100) {
    try {
      // Essayer de créer un son simple avec expo-audio
      if (typeof window !== 'undefined' && window.AudioContext) {
        // Web version
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
      } else {
        // Mobile version - utiliser une approche différente
        // Pour l'instant, retourner false pour utiliser les haptics
        return false;
      }
    } catch (error) {
      console.warn('Simple sound failed:', error);
      return false;
    }
  }

  // Effets sonores avec fallback haptic
  async playFlap() {
    if (!this.soundEnabled) return;
    
    try {
      // Essayer de jouer un son
      const soundPlayed = await this.playSimpleSound(600, 100);
      
      // Toujours jouer les haptics
      if (this.hapticEnabled) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.warn('Haptics failed:', error);
        }
      }
      
      console.log(`🎵 Flap sound played ${soundPlayed ? '(audio)' : '(haptic only)'}`);
    } catch (error) {
      console.warn('Flap sound failed:', error);
    }
  }

  async playCoin() {
    if (!this.soundEnabled) return;
    
    try {
      const soundPlayed = await this.playSimpleSound(1200, 150);
      
      if (this.hapticEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.warn('Haptics failed:', error);
        }
      }
      
      console.log(`🎵 Coin sound played ${soundPlayed ? '(audio)' : '(haptic only)'}`);
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
      
      const soundPlayed = await this.playSimpleSound(frequency, duration);
      
      if (this.hapticEnabled) {
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
      }
      
      console.log(`🎵 ${type} power-up sound played ${soundPlayed ? '(audio)' : '(haptic only)'}`);
    } catch (error) {
      console.warn('Power-up sound failed:', error);
    }
  }

  async playCollision() {
    if (!this.soundEnabled) return;
    
    try {
      const soundPlayed = await this.playSimpleSound(200, 200);
      
      if (this.hapticEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
          console.warn('Haptics failed:', error);
        }
      }
      
      console.log(`🎵 Collision sound played ${soundPlayed ? '(audio)' : '(haptic only)'}`);
    } catch (error) {
      console.warn('Collision sound failed:', error);
    }
  }

  async playScore() {
    if (!this.soundEnabled) return;
    
    try {
      const soundPlayed = await this.playSimpleSound(800, 200);
      
      if (this.hapticEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error) {
          console.warn('Haptics failed:', error);
        }
      }
      
      console.log(`🎵 Score sound played ${soundPlayed ? '(audio)' : '(haptic only)'}`);
    } catch (error) {
      console.warn('Score sound failed:', error);
    }
  }

  async playCountdown() {
    if (!this.soundEnabled) return;
    
    try {
      const soundPlayed = await this.playSimpleSound(1000, 50);
      
      if (this.hapticEnabled) {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (error) {
          console.warn('Haptics failed:', error);
        }
      }
      
      console.log(`🎵 Countdown sound played ${soundPlayed ? '(audio)' : '(haptic only)'}`);
    } catch (error) {
      console.warn('Countdown sound failed:', error);
    }
  }

  async playGameOver() {
    if (!this.soundEnabled) return;
    
    try {
      const soundPlayed = await this.playSimpleSound(300, 500);
      
      if (this.hapticEnabled) {
        try {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        } catch (error) {
          console.warn('Haptics failed:', error);
        }
      }
      
      console.log(`🎵 Game over sound played ${soundPlayed ? '(audio)' : '(haptic only)'}`);
    } catch (error) {
      console.warn('Game over sound failed:', error);
    }
  }

  // Musique de fond avec haptics
  async playBackgroundMusic(levelId = 1) {
    if (!this.soundEnabled) return;
    
    try {
      await this.stopBackgroundMusic();
      
      console.log(`🎵 Starting background music for level ${levelId}`);
      
      // Créer une musique de fond avec des haptics
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
          const soundPlayed = await this.playSimpleSound(frequency, noteDuration * 0.8);
          
          // Haptics léger pour le rythme
          if (this.hapticEnabled && noteIndex % 4 === 0) {
            try {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } catch (error) {
              console.warn('Background haptic failed:', error);
            }
          }
          
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
          if (this.hapticEnabled) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.warn('Haptics failed:', error);
            }
          }
          break;
        case 'level_unlocked':
          console.log('🗣️ Voice: "Niveau débloqué!"');
          if (this.hapticEnabled) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.warn('Haptics failed:', error);
            }
          }
          break;
        case 'best_score':
          console.log('🗣️ Voice: "Meilleur score!"');
          if (this.hapticEnabled) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.warn('Haptics failed:', error);
            }
          }
          break;
        case 'game_over':
          console.log('🗣️ Voice: "Game Over!"');
          if (this.hapticEnabled) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            } catch (error) {
              console.warn('Haptics failed:', error);
            }
          }
          break;
        case 'level_complete':
          console.log('🗣️ Voice: "Niveau terminé!"');
          if (this.hapticEnabled) {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              console.warn('Haptics failed:', error);
            }
          }
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
const audioServiceV3 = new AudioServiceV3();

export default audioServiceV3;
