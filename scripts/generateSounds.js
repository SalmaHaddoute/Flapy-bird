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
    const value = Math.max(-1, Math.min(1, sample)) * 0.15; // Réduire le volume à 15% au lieu de 30%
    const int16Value = Math.floor(value * 32767);
    view.setInt16(44 + i * 2, int16Value, true);
  }
  
  // Sauvegarder le fichier
  const wavPath = path.join(__dirname, '../assets/sounds', filename);
  fs.writeFileSync(wavPath, Buffer.from(buffer));
  console.log(`Generated: ${wavPath}`);
}

// Générer les différents sons avec volumes ajustés
console.log('Generating game sounds with optimized volumes...');

// Son de battement d'ailes (très court et discret)
generateWavFile(600, 0.08, 'flap.wav'); // 80ms, volume réduit

// Son de pièce (brillant mais pas trop fort)
generateWavFile(1200, 0.12, 'coin.wav'); // 120ms, volume modéré

// Son de collision (impact modéré)
generateWavFile(200, 0.15, 'collision.wav'); // 150ms, volume moyen

// Son de countdown (tic-tac très discret)
generateWavFile(1000, 0.04, 'countdown.wav'); // 40ms, très court et discret

// Son de game over (descendant, pas trop long)
generateWavFile(300, 0.4, 'gameover.wav'); // 400ms, volume modéré

// Son de score (ascendant, court et agréable)
generateWavFile(800, 0.15, 'score.wav'); // 150ms, volume modéré

// Son de power-up shield (grave et court)
generateWavFile(200, 0.15, 'powerup_shield.wav'); // 150ms, volume moyen

// Son de power-up slow (moyen et doux)
generateWavFile(400, 0.2, 'powerup_slow.wav'); // 200ms, volume doux

// Son de power-up magnet (vibrant mais discret)
generateWavFile(500, 0.12, 'powerup_magnet.wav'); // 120ms, volume modéré

console.log('All sounds generated successfully!');
