const fs = require('fs');
const path = require('path');

// Générer un fichier audio WAV simple
function generateWavFile(frequency, duration, filename) {
  const sampleRate = 44100;
  const numSamples = Math.floor(duration * sampleRate);
  const bytesPerSample = 2;
  const numChannels = 1;
  
  // Créer le buffer pour les données audio
  const buffer = new ArrayBuffer(44 + numSamples * bytesPerSample);
  const view = new DataView(buffer);
  
  // En-tête WAV
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  // RIFF header
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + numSamples * bytesPerSample, true);
  writeString(8, 'WAVE');
  
  // fmt subchunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample * numChannels, true);
  view.setUint16(32, bytesPerSample * numChannels, true);
  view.setUint16(34, 16, true); // bits per sample
  
  // data subchunk
  writeString(36, 'data');
  view.setUint32(40, numSamples * bytesPerSample, true);
  
  // Générer les données audio (onde sinusoïdale)
  for (let i = 0; i < numSamples; i++) {
    const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate);
    const value = Math.max(-1, Math.min(1, sample)) * 0.3; // Limiter à 30% du volume
    const int16Value = Math.floor(value * 32767);
    view.setInt16(44 + i * 2, int16Value, true);
  }
  
  // Sauvegarder le fichier
  const wavPath = path.join(__dirname, '../assets/sounds', filename);
  fs.writeFileSync(wavPath, Buffer.from(buffer));
  console.log(`Generated: ${wavPath}`);
}

// Générer les différents sons
console.log('Generating game sounds...');

// Son de battement d'ailes (court et aigu)
generateWavFile(600, 0.1, 'flap.wav');

// Son de pièce (brillant et court)
generateWavFile(1200, 0.15, 'coin.wav');

// Son de collision (grave et court)
generateWavFile(200, 0.2, 'collision.wav');

// Son de countdown (tic-tac)
generateWavFile(1000, 0.05, 'countdown.wav');

// Son de game over (descendant)
generateWavFile(300, 0.5, 'gameover.wav');

// Son de score (ascendant)
generateWavFile(800, 0.2, 'score.wav');

// Son de power-up shield (grave)
generateWavFile(200, 0.2, 'powerup_shield.wav');

// Son de power-up slow (moyen)
generateWavFile(400, 0.3, 'powerup_slow.wav');

// Son de power-up magnet (vibrant)
generateWavFile(500, 0.15, 'powerup_magnet.wav');

console.log('All sounds generated successfully!');
