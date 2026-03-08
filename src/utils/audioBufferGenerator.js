class AudioBufferGenerator {
  constructor() {
    this.sampleRate = 44100; // Taux d'échantillonnage standard
  }

  // Générer un buffer audio pour une onde sinusoïdale
  generateSineWave(frequency, duration, sampleRate = this.sampleRate) {
    const numSamples = Math.floor(duration * sampleRate);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      buffer[i] = Math.sin(2 * Math.PI * frequency * t);
    }
    
    return buffer;
  }

  // Générer un buffer audio pour une onde carrée
  generateSquareWave(frequency, duration, sampleRate = this.sampleRate) {
    const numSamples = Math.floor(duration * sampleRate);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      buffer[i] = Math.sign(Math.sin(2 * Math.PI * frequency * t));
    }
    
    return buffer;
  }

  // Générer un buffer audio pour une onde en dents de scie
  generateSawtoothWave(frequency, duration, sampleRate = this.sampleRate) {
    const numSamples = Math.floor(duration * sampleRate);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      buffer[i] = 2 * ((frequency * t) % 1) - 1;
    }
    
    return buffer;
  }

  // Appliquer une enveloppe ADSR (Attack, Decay, Sustain, Release)
  applyEnvelope(buffer, attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.1, sampleRate = this.sampleRate) {
    const numSamples = buffer.length;
    const attackSamples = Math.floor(attack * sampleRate);
    const decaySamples = Math.floor(decay * sampleRate);
    const releaseSamples = Math.floor(release * sampleRate);
    const sustainSamples = numSamples - attackSamples - decaySamples - releaseSamples;
    
    const envelope = new Float32Array(numSamples);
    
    // Attack phase
    for (let i = 0; i < attackSamples; i++) {
      envelope[i] = i / attackSamples;
    }
    
    // Decay phase
    for (let i = 0; i < decaySamples; i++) {
      envelope[attackSamples + i] = 1 - (1 - sustain) * (i / decaySamples);
    }
    
    // Sustain phase
    for (let i = 0; i < sustainSamples; i++) {
      envelope[attackSamples + decaySamples + i] = sustain;
    }
    
    // Release phase
    for (let i = 0; i < releaseSamples; i++) {
      envelope[attackSamples + decaySamples + sustainSamples + i] = sustain * (1 - i / releaseSamples);
    }
    
    // Appliquer l'enveloppe au buffer
    for (let i = 0; i < numSamples; i++) {
      buffer[i] *= envelope[i];
    }
    
    return buffer;
  }

  // Générer un son de battement d'ailes
  generateFlapSound() {
    const duration = 0.15; // 150ms
    const buffer = new Float32Array(Math.floor(duration * this.sampleRate));
    
    // Créer deux tons pour le son de battement
    const tone1 = this.generateSineWave(600, duration * 0.6);
    const tone2 = this.generateSineWave(800, duration * 0.4);
    
    // Combiner les tons
    const tone1Start = 0;
    const tone2Start = Math.floor(duration * 0.6 * this.sampleRate);
    
    for (let i = 0; i < tone1.length; i++) {
      buffer[tone1Start + i] += tone1[i] * 0.6;
    }
    
    for (let i = 0; i < tone2.length; i++) {
      buffer[tone2Start + i] += tone2[i] * 0.4;
    }
    
    // Appliquer une enveloppe pour un son plus naturel
    return this.applyEnvelope(buffer, 0.01, 0.05, 0.3, 0.1);
  }

  // Générer un son de pièce
  generateCoinSound() {
    const duration = 0.25; // 250ms
    const buffer = new Float32Array(Math.floor(duration * this.sampleRate));
    
    // Créer un son cristallin avec plusieurs harmoniques
    const fundamental = this.generateSineWave(1200, duration);
    const harmonic2 = this.generateSineWave(1600, duration);
    const harmonic3 = this.generateSineWave(2000, duration * 0.8);
    
    // Combiner les harmoniques
    for (let i = 0; i < fundamental.length; i++) {
      buffer[i] = fundamental[i] * 0.5 + harmonic2[i] * 0.3 + harmonic3[i] * 0.2;
    }
    
    // Appliquer une enveloppe rapide et brillante
    return this.applyEnvelope(buffer, 0.001, 0.05, 0.2, 0.15);
  }

  // Générer un son de power-up selon le type
  generatePowerUpSound(type) {
    let duration, frequencies, waveform;
    
    switch (type) {
      case 'shield':
        duration = 0.3;
        frequencies = [200, 150];
        waveform = 'sawtooth';
        break;
      case 'slow':
        duration = 0.4;
        frequencies = [800, 400, 200];
        waveform = 'sine';
        break;
      case 'magnet':
        duration = 0.2;
        frequencies = [300, 400, 500];
        waveform = 'square';
        break;
      default:
        duration = 0.2;
        frequencies = [600, 800];
        waveform = 'sine';
    }
    
    const buffer = new Float32Array(Math.floor(duration * this.sampleRate));
    
    // Générer chaque fréquence
    frequencies.forEach((freq, index) => {
      const freqDuration = duration / frequencies.length;
      let waveBuffer;
      
      switch (waveform) {
        case 'square':
          waveBuffer = this.generateSquareWave(freq, freqDuration);
          break;
        case 'sawtooth':
          waveBuffer = this.generateSawtoothWave(freq, freqDuration);
          break;
        default:
          waveBuffer = this.generateSineWave(freq, freqDuration);
      }
      
      const startSample = Math.floor(index * freqDuration * this.sampleRate);
      for (let i = 0; i < waveBuffer.length; i++) {
        buffer[startSample + i] += waveBuffer[i] / frequencies.length;
      }
    });
    
    return this.applyEnvelope(buffer, 0.02, 0.1, 0.5, 0.2);
  }

  // Générer un son de collision
  generateCollisionSound() {
    const duration = 0.25; // 250ms
    const buffer = new Float32Array(Math.floor(duration * this.sampleRate));
    
    // Créer un bruit d'impact avec des basses fréquences
    const lowFreq = this.generateSineWave(100, duration);
    const noise = this.generateNoise(duration);
    
    for (let i = 0; i < buffer.length; i++) {
      buffer[i] = lowFreq[i] * 0.7 + noise[i] * 0.3;
    }
    
    return this.applyEnvelope(buffer, 0.001, 0.02, 0.1, 0.15);
  }

  // Générer du bruit blanc
  generateNoise(duration) {
    const numSamples = Math.floor(duration * this.sampleRate);
    const buffer = new Float32Array(numSamples);
    
    for (let i = 0; i < numSamples; i++) {
      buffer[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }

  // Générer un son de countdown
  generateCountdownSound() {
    const duration = 0.1; // 100ms
    const buffer = this.generateSineWave(1000, duration);
    return this.applyEnvelope(buffer, 0.001, 0.02, 0.1, 0.05);
  }

  // Générer un son de game over
  generateGameOverSound() {
    const duration = 0.6; // 600ms
    const buffer = new Float32Array(Math.floor(duration * this.sampleRate));
    
    // Séquence descendante
    const notes = [440, 330, 220]; // A4, E4, A3
    const noteDuration = duration / notes.length;
    
    notes.forEach((freq, index) => {
      const noteBuffer = this.generateSineWave(freq, noteDuration);
      const startSample = Math.floor(index * noteDuration * this.sampleRate);
      
      for (let i = 0; i < noteBuffer.length; i++) {
        buffer[startSample + i] += noteBuffer[i];
      }
    });
    
    return this.applyEnvelope(buffer, 0.05, 0.2, 0.3, 0.3);
  }

  // Générer un son de score
  generateScoreSound() {
    const duration = 0.25; // 250ms
    const buffer = new Float32Array(Math.floor(duration * this.sampleRate));
    
    // Séquence ascendante (C5, E5)
    const note1 = this.generateSineWave(523, duration * 0.4); // C5
    const note2 = this.generateSineWave(659, duration * 0.6); // E5
    
    for (let i = 0; i < note1.length; i++) {
      buffer[i] += note1[i] * 0.5;
    }
    
    const note2Start = Math.floor(duration * 0.4 * this.sampleRate);
    for (let i = 0; i < note2.length; i++) {
      buffer[note2Start + i] += note2[i] * 0.5;
    }
    
    return this.applyEnvelope(buffer, 0.01, 0.05, 0.3, 0.2);
  }

  // Convertir le buffer en format compatible avec Expo Audio
  bufferToBase64(buffer) {
    // Convertir Float32Array en Int16Array (16-bit PCM)
    const int16Buffer = new Int16Array(buffer.length);
    for (let i = 0; i < buffer.length; i++) {
      int16Buffer[i] = Math.max(-32768, Math.min(32767, buffer[i] * 32767));
    }
    
    // Convertir en base64
    const bytes = new Uint8Array(int16Buffer.buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  // Créer un data URI audio
  createAudioDataURI(buffer, format = 'audio/wav') {
    const base64Data = this.bufferToBase64(buffer);
    return `data:${format};base64,${base64Data}`;
  }
}

// Singleton
const audioBufferGenerator = new AudioBufferGenerator();

export default audioBufferGenerator;
