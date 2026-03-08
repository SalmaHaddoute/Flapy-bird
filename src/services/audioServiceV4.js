import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioServiceV4 {
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
          this.sounds[key] = sound;
          console.log(`🎵 Loaded ${key} sound`);
        } catch (error) {
          console.warn(`Failed to load ${key} sound:`, error);
        }
      }
      
      console.log('🎵 All sounds loaded successfully');
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

  // Effets sonores avec vrais fichiers audio
  async playFlap() {
    await this.playSound('flap');
    await this.playHaptic('light');
  }

  async playCoin() {
    await this.playSound('coin');
    await this.playHaptic('success');
  }

  async playPowerUp(type) {
    const soundKey = `powerup_${type}`;
    const played = await this.playSound(soundKey);
    
    switch (type) {
      case 'shield':
        await this.playHaptic('heavy');
        break;
      case 'slow':
        await this.playHaptic('medium');
        break;
      case 'magnet':
        await this.playHaptic('warning');
        break;
      default:
        await this.playHaptic('medium');
    }
    
    console.log(`🎵 ${type} power-up sound played ${played ? '(audio)' : '(haptic only)'}`);
  }

  async playCollision() {
    await this.playSound('collision');
    await this.playHaptic('heavy');
  }

  async playScore() {
    await this.playSound('score');
    await this.playHaptic('success');
  }

  async playCountdown() {
    await this.playSound('countdown');
    await this.playHaptic('light');
  }

  async playGameOver() {
    await this.playSound('gameover');
    await this.playHaptic('error');
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
          // Jouer un son de note simple
          await this.playSimpleNote(notes[noteIndex % notes.length], noteDuration * 0.8);
          
          // Haptics léger pour le rythme
          if (this.hapticEnabled && noteIndex % 4 === 0) {
            await this.playHaptic('light');
          }
          
          noteIndex++;
        }
      }, noteDuration);
      
    } catch (error) {
      console.warn('Background music failed:', error);
    }
  }

  async playSimpleNote(frequency, duration) {
    try {
      // Utiliser le son de score comme note de base avec une fréquence différente
      // Pour l'instant, nous allons juste jouer le son de score
      // Dans une vraie implémentation, vous pourriez avoir des fichiers audio pour chaque note
      if (this.sounds.score) {
        await this.sounds.score.replayAsync();
      }
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
