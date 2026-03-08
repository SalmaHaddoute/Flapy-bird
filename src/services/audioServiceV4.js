import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioServiceV4 {
  constructor() {
    this.sounds = {};
    this.backgroundMusic = null;
    this.isInitialized = false;
    this.soundEnabled = true;
    this.hapticEnabled = false; // Désactiver les vibrations par défaut
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
      
      // Charger tous les fichiers audio
      await this.loadSounds();
      
      this.isInitialized = true;
      console.log('🎵 Audio service V4 initialized with real sounds');
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  async loadSounds() {
    try {
      const soundFiles = {
        flap: require('../../assets/sounds/flap.wav'),
        coin: require('../../assets/sounds/coin.wav'),
        collision: require('../../assets/sounds/collision.wav'),
        countdown: require('../../assets/sounds/countdown.wav'),
        gameover: require('../../assets/sounds/gameover.wav'),
        score: require('../../assets/sounds/score.wav'),
        powerup_shield: require('../../assets/sounds/powerup_shield.wav'),
        powerup_slow: require('../../assets/sounds/powerup_slow.wav'),
        powerup_magnet: require('../../assets/sounds/powerup_magnet.wav'),
      };

      for (const [key, soundFile] of Object.entries(soundFiles)) {
        try {
          const { sound } = await Audio.Sound.createAsync(soundFile);
          // Ajuster le volume pour chaque son
          await sound.setVolumeAsync(0.3); // Volume réduit à 30%
          this.sounds[key] = sound;
          console.log(`🎵 Loaded ${key} sound with reduced volume`);
        } catch (error) {
          console.warn(`Failed to load ${key} sound:`, error);
        }
      }
      
      console.log('🎵 All sounds loaded successfully with optimized volumes');
    } catch (error) {
      console.warn('Sound loading failed:', error);
    }
  }

  async playSound(soundKey) {
    if (!this.soundEnabled) return;
    
    try {
      const sound = this.sounds[soundKey];
      if (sound) {
        await sound.replayAsync();
        console.log(`🎵 Playing ${soundKey} sound`);
        return true;
      } else {
        console.warn(`Sound ${soundKey} not found`);
        return false;
      }
    } catch (error) {
      console.warn(`Failed to play ${soundKey} sound:`, error);
      return false;
    }
  }

  async playHaptic(hapticType = 'light') {
    if (!this.hapticEnabled) return;
    
    try {
      switch (hapticType) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.warn('Haptic failed:', error);
    }
  }

  // Effets sonores sans vibrations
  async playFlap() {
    await this.playSound('flap');
  }

  async playCoin() {
    await this.playSound('coin');
  }

  async playPowerUp(type) {
    const soundKey = `powerup_${type}`;
    await this.playSound(soundKey);
    console.log(`🎵 ${type} power-up sound played (audio only)`);
  }

  async playCollision() {
    await this.playSound('collision');
  }

  async playScore() {
    await this.playSound('score');
  }

  async playCountdown() {
    await this.playSound('countdown');
  }

  async playGameOver() {
    await this.playSound('gameover');
  }

  // Musique de fond sans haptics
  async playBackgroundMusic(levelId = 1) {
    if (!this.soundEnabled) return;
    
    try {
      await this.stopBackgroundMusic();
      
      console.log(`🎵 Starting background music for level ${levelId}`);
      
      // Créer une musique de fond simple avec des sons
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
          // Jouer un son de note simple
          await this.playSimpleNote(notes[noteIndex % notes.length], noteDuration * 0.8);
          noteIndex++;
        }
      }, noteDuration);
      
    } catch (error) {
      console.warn('Background music failed:', error);
    }
  }

  async playSimpleNote(frequency, duration) {
    try {
      // Pour l'instant, pas de musique de fond pour éviter les sons parasites
      // Vous pouvez activer cette fonctionnalité plus tard si vous voulez
      return;
    } catch (error) {
      console.warn('Note playback failed:', error);
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
          await this.playHaptic('success');
          break;
        case 'level_unlocked':
          console.log('🗣️ Voice: "Niveau débloqué!"');
          await this.playHaptic('success');
          break;
        case 'best_score':
          console.log('🗣️ Voice: "Meilleur score!"');
          await this.playHaptic('success');
          break;
        case 'game_over':
          console.log('🗣️ Voice: "Game Over!"');
          await this.playHaptic('error');
          break;
        case 'level_complete':
          console.log('🗣️ Voice: "Niveau terminé!"');
          await this.playHaptic('success');
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
const audioServiceV4 = new AudioServiceV4();

export default audioServiceV4;
