import audioBufferGenerator from './audioBufferGenerator';

class BackgroundMusicGenerator {
  constructor() {
    this.currentMusic = null;
    this.musicInterval = null;
    this.currentNoteIndex = 0;
  }

  // Générer une mélodie de fond selon le niveau
  generateBackgroundMelody(levelId = 1) {
    // Définir les gammes selon le niveau
    const scales = {
      1: {
        notes: [220, 247, 262, 294, 330], // A3, B3, C4, D4, E4
        tempo: 90, // BPM lent et calme
        pattern: [0, 1, 2, 1, 3, 2, 4, 3], // Pattern simple
        rhythm: [1, 0.5, 1, 0.5, 1, 0.5, 2, 0.5] // Durées relatives
      },
      2: {
        notes: [247, 262, 294, 330, 349, 392], // B3, C4, D4, E4, F4, G4
        tempo: 100, // BPM un peu plus rapide
        pattern: [0, 2, 4, 3, 2, 1, 3, 5, 4, 2], // Pattern plus complexe
        rhythm: [1, 0.5, 0.5, 1, 0.5, 0.5, 1, 0.5, 1, 0.5]
      },
      3: {
        notes: [262, 294, 330, 349, 392, 440, 494], // C4, D4, E4, F4, G4, A4, B4
        tempo: 110, // BPM modéré
        pattern: [0, 2, 4, 5, 4, 2, 0, 3, 5, 6, 5, 3], // Pattern mélodique
        rhythm: [0.75, 0.25, 0.75, 0.25, 0.5, 0.5, 1, 0.5, 0.75, 0.25, 0.75, 0.25]
      },
      4: {
        notes: [294, 330, 349, 392, 440, 494, 523, 587], // D4, E4, F4, G4, A4, B4, C5, D5
        tempo: 120, // BPM énergique
        pattern: [0, 4, 2, 5, 3, 6, 4, 7, 5, 3, 1, 0], // Pattern ascendant/descendant
        rhythm: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1, 0.5, 0.5, 1]
      },
      5: {
        notes: [330, 349, 392, 440, 494, 523, 587, 659, 698], // E4, F4, G4, A4, B4, C5, D5, E5, F5
        tempo: 130, // BPM intense
        pattern: [0, 2, 4, 7, 5, 3, 1, 0, 2, 4, 6, 8, 7, 5, 3], // Pattern très complexe
        rhythm: [0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25, 0.5, 0.25, 0.25, 0.25, 0.25, 0.5, 0.25, 0.25]
      }
    };

    return scales[levelId] || scales[1];
  }

  // Créer un buffer audio pour une note spécifique
  createNoteBuffer(frequency, duration, waveform = 'sine') {
    let buffer;
    switch (waveform) {
      case 'square':
        buffer = audioBufferGenerator.generateSquareWave(frequency, duration);
        break;
      case 'sawtooth':
        buffer = audioBufferGenerator.generateSawtoothWave(frequency, duration);
        break;
      default:
        buffer = audioBufferGenerator.generateSineWave(frequency, duration);
    }
    
    // Appliquer une enveloppe douce pour la musique de fond
    return audioBufferGenerator.applyEnvelope(buffer, 0.05, 0.1, 0.6, 0.2);
  }

  // Générer une séquence musicale complète
  generateMusicSequence(levelId = 1) {
    const scale = this.generateBackgroundMelody(levelId);
    const sequence = [];
    let currentTime = 0;
    const beatDuration = 60 / scale.tempo; // Durée d'un temps en secondes

    scale.pattern.forEach((noteIndex, patternIndex) => {
      const frequency = scale.notes[noteIndex];
      const rhythmMultiplier = scale.rhythm[patternIndex];
      const duration = beatDuration * rhythmMultiplier;
      
      sequence.push({
        frequency,
        startTime: currentTime,
        duration,
        waveform: levelId >= 4 ? 'square' : 'sine' // Sons plus intenses dans les niveaux élevés
      });
      
      currentTime += duration;
    });

    return sequence;
  }

  // Démarrer la musique de fond
  async startBackgroundMusic(levelId = 1, onNotePlayed = null) {
    this.stopBackgroundMusic();
    
    try {
      const sequence = this.generateMusicSequence(levelId);
      const scale = this.generateBackgroundMelody(levelId);
      const beatDuration = 60 / scale.tempo * 1000; // Convertir en millisecondes
      
      console.log(`🎵 Starting background music for level ${levelId} - Tempo: ${scale.tempo} BPM`);
      
      // Jouer la séquence en boucle
      this.musicInterval = setInterval(() => {
        if (this.currentNoteIndex >= sequence.length) {
          this.currentNoteIndex = 0; // Boucler la mélodie
        }
        
        const note = sequence[this.currentNoteIndex];
        this.playNote(note, onNotePlayed);
        
        this.currentNoteIndex++;
      }, beatDuration * 0.5); // Jouer des double-croches pour plus de dynamique
      
    } catch (error) {
      console.warn('Background music failed:', error);
    }
  }

  // Jouer une note individuelle
  async playNote(note, onNotePlayed = null) {
    try {
      const buffer = this.createNoteBuffer(note.frequency, note.duration, note.waveform);
      const dataURI = audioBufferGenerator.createAudioDataURI(buffer);
      
      // Créer un objet sonore temporaire
      const { Audio } = require('expo-av');
      const soundObject = new Audio.Sound();
      
      await soundObject.loadAsync({ uri: dataURI });
      await soundObject.playAsync();
      
      // Nettoyer après la lecture
      setTimeout(() => {
        soundObject.unloadAsync();
      }, note.duration * 1000 + 100);
      
      if (onNotePlayed) {
        onNotePlayed(note.frequency);
      }
      
    } catch (error) {
      console.warn('Note playback failed:', error);
    }
  }

  // Arrêter la musique de fond
  stopBackgroundMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    
    this.currentNoteIndex = 0;
    console.log('🎵 Background music stopped');
  }

  // Créer une variation de la mélodie pour plus de variété
  createMelodyVariation(levelId = 1) {
    const baseScale = this.generateBackgroundMelody(levelId);
    
    // Créer une variation en changeant le pattern et le rythme
    const variation = {
      ...baseScale,
      pattern: this.shuffleArray([...baseScale.pattern]),
      rhythm: baseScale.rhythm.map(r => r * (0.8 + Math.random() * 0.4)) // ±20% variation
    };
    
    return variation;
  }

  // Utilitaire pour mélanger un tableau
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Obtenir des informations sur la musique actuelle
  getCurrentMusicInfo() {
    return {
      isPlaying: this.musicInterval !== null,
      currentNoteIndex: this.currentNoteIndex,
      tempo: this.currentScale?.tempo || null
    };
  }
}

// Singleton
const backgroundMusicGenerator = new BackgroundMusicGenerator();

export default backgroundMusicGenerator;
