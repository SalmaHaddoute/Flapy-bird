class SoundGenerator {
  constructor() {
    this.audioContext = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Utiliser l'API Web Audio si disponible (pour web)
      if (typeof window !== 'undefined' && window.AudioContext) {
        this.audioContext = new window.AudioContext();
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn('Sound generator initialization failed:', error);
    }
  }

  // Générer un son simple avec une fréquence et durée spécifiées
  playTone(frequency = 440, duration = 100, type = 'sine') {
    if (!this.audioContext || !this.isInitialized) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      // Enveloppe ADSR simple
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration / 1000);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Tone generation failed:', error);
    }
  }

  // Générer un son de battement d'ailes
  playFlapSound() {
    if (!this.audioContext) return;
    
    try {
      // Son de battement d'ailes - fréquence medium courte
      this.playTone(600, 50, 'sine');
      setTimeout(() => this.playTone(800, 30, 'sine'), 25);
    } catch (error) {
      console.warn('Flap sound failed:', error);
    }
  }

  // Générer un son de pièce
  playCoinSound() {
    if (!this.audioContext) return;
    
    try {
      // Son de pièce - fréquence haute et cristalline
      this.playTone(1200, 100, 'sine');
      setTimeout(() => this.playTone(1600, 150, 'sine'), 50);
    } catch (error) {
      console.warn('Coin sound failed:', error);
    }
  }

  // Générer un son de power-up selon le type
  playPowerUpSound(type) {
    if (!this.audioContext) return;
    
    try {
      switch (type) {
        case 'shield':
          // Son profond et protecteur
          this.playTone(200, 200, 'sawtooth');
          setTimeout(() => this.playTone(150, 150, 'sawtooth'), 100);
          break;
        case 'slow':
          // Son descendant et lent
          this.playTone(800, 300, 'sine');
          setTimeout(() => this.playTone(400, 300, 'sine'), 150);
          break;
        case 'magnet':
          // Son magnétique vibrant
          this.playTone(300, 100, 'square');
          setTimeout(() => this.playTone(400, 100, 'square'), 50);
          setTimeout(() => this.playTone(500, 100, 'square'), 100);
          break;
        default:
          // Son de power-up générique
          this.playTone(600, 150, 'sine');
          setTimeout(() => this.playTone(800, 150, 'sine'), 75);
      }
    } catch (error) {
      console.warn('Power-up sound failed:', error);
    }
  }

  // Générer un son de collision
  playCollisionSound() {
    if (!this.audioContext) return;
    
    try {
      // Son d'impact - bruit blanc et fréquence basse
      this.playTone(100, 200, 'sawtooth');
      setTimeout(() => this.playTone(80, 150, 'square'), 50);
    } catch (error) {
      console.warn('Collision sound failed:', error);
    }
  }

  // Générer une mélodie de fond simple
  createBackgroundMelody(levelId = 1) {
    if (!this.audioContext) return;

    try {
      // Définir les gammes selon le niveau
      const scales = {
        1: [220, 247, 262, 294, 330], // A3, B3, C4, D4, E4 - calme et simple
        2: [247, 262, 294, 330, 349, 392], // B3, C4, D4, E4, F4, G4 - un peu plus complexe
        3: [262, 294, 330, 349, 392, 440, 494], // C4, D4, E4, F4, G4, A4, B4 - modéré
        4: [294, 330, 349, 392, 440, 494, 523, 587], // D4, E4, F4, G4, A4, B4, C5, D5 - énergique
        5: [330, 349, 392, 440, 494, 523, 587, 659, 698], // E4, F4, G4, A4, B4, C5, D5, E5, F5 - intense
      };

      const scale = scales[levelId] || scales[1];
      const tempo = Math.max(120 - (levelId * 15), 45); // BPM plus rapide avec les niveaux
      const noteDuration = 60000 / tempo / 4; // Double croches

      let noteIndex = 0;
      
      const playNextNote = () => {
        if (!this.audioContext || !this.isInitialized) return;
        
        const frequency = scale[noteIndex % scale.length];
        this.playTone(frequency, noteDuration * 0.8, 'sine');
        
        noteIndex++;
        
        // Créer une mélodie plus intéressante avec des variations
        const nextDelay = noteIndex % 4 === 0 ? noteDuration * 2 : noteDuration;
        
        this.melodyTimeout = setTimeout(playNextNote, nextDelay);
      };

      playNextNote();
    } catch (error) {
      console.warn('Background melody creation failed:', error);
    }
  }

  // Arrêter la mélodie de fond
  stopBackgroundMelody() {
    if (this.melodyTimeout) {
      clearTimeout(this.melodyTimeout);
      this.melodyTimeout = null;
    }
  }

  // Générer un son de countdown
  playCountdownSound() {
    if (!this.audioContext) return;
    
    try {
      // Son de tic-tac
      this.playTone(1000, 50, 'sine');
    } catch (error) {
      console.warn('Countdown sound failed:', error);
    }
  }

  // Générer un son de game over
  playGameOverSound() {
    if (!this.audioContext) return;
    
    try {
      // Son descendant de game over
      this.playTone(440, 200, 'sine');
      setTimeout(() => this.playTone(330, 200, 'sine'), 200);
      setTimeout(() => this.playTone(220, 300, 'sine'), 400);
    } catch (error) {
      console.warn('Game over sound failed:', error);
    }
  }

  // Générer un son de score
  playScoreSound() {
    if (!this.audioContext) return;
    
    try {
      // Son positif de score
      this.playTone(523, 100, 'sine'); // C5
      setTimeout(() => this.playTone(659, 150, 'sine'), 100); // E5
    } catch (error) {
      console.warn('Score sound failed:', error);
    }
  }

  cleanup() {
    this.stopBackgroundMelody();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.isInitialized = false;
  }
}

// Singleton
const soundGenerator = new SoundGenerator();

export default soundGenerator;
