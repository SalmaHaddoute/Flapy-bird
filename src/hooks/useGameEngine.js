import { useState, useEffect, useRef, useCallback } from "react";
import { SCREEN, BIRD, PIPE, GROUND, LEVELS, COIN, POWERUP } from "../constants/gameConfig";
import audioService from "../services/audioService";

const PIPE_START_X = SCREEN.WIDTH + 100;

const createPipe = (level) => {
  const minTop = 80;
  const maxTop = SCREEN.HEIGHT - GROUND.HEIGHT - level.pipeGap - 80;
  const topHeight = Math.random() * (maxTop - minTop) + minTop;
  
  // Créer une pièce avec une probabilité
  const coin = Math.random() < COIN.SPAWN_CHANCE ? {
    id: Date.now() + Math.random() + 0.1,
    x: PIPE_START_X + PIPE.WIDTH / 2 - COIN.WIDTH / 2,
    y: topHeight + level.pipeGap / 2 - COIN.HEIGHT / 2,
    collected: false,
  } : null;
  
  // Créer un power-up avec une probabilité
  const powerUpTypes = Object.keys(POWERUP.TYPES);
  const randomPowerUp = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  const powerUp = Math.random() < POWERUP.SPAWN_CHANCE ? {
    id: Date.now() + Math.random() + 0.2,
    x: PIPE_START_X + PIPE.WIDTH / 2 - POWERUP.WIDTH / 2,
    y: topHeight + level.pipeGap / 2 - POWERUP.HEIGHT / 2 + 40,
    type: randomPowerUp,
    collected: false,
  } : null;
  
  return {
    id: Date.now() + Math.random(),
    x: PIPE_START_X,
    topHeight,
    bottomY: topHeight + level.pipeGap,
    passed: false,
    coin,
    powerUp,
  };
};

export const useGameEngine = (level, onGameOver, onScoreUpdate) => {
  const [birdY, setBirdY] = useState(SCREEN.HEIGHT / 2 - 50);
  const [birdRotation, setBirdRotation] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isAlive, setIsAlive] = useState(true);
  const [particles, setParticles] = useState([]);
  const [coins, setCoins] = useState(0);
  const [activePowerUp, setActivePowerUp] = useState(null);
  const [powerUpTimer, setPowerUpTimer] = useState(null);

  const velocityRef = useRef(0);
  const birdYRef = useRef(SCREEN.HEIGHT / 2 - 50);
  const pipesRef = useRef([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(null);
  const pipeTimerRef = useRef(null);
  const isAliveRef = useRef(true);

  const spawnParticles = useCallback((x, y) => {
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      life: 1,
    }));
    setParticles((p) => [...p, ...newParticles]);
    setTimeout(() => {
      setParticles((p) => p.filter((pt) => !newParticles.find((np) => np.id === pt.id)));
    }, 600);
  }, []);

  const flap = useCallback(() => {
    if (!isAliveRef.current) return;
    velocityRef.current = level.flapForce;
    spawnParticles(BIRD.X + BIRD.WIDTH / 2, birdYRef.current + BIRD.HEIGHT / 2);
  }, [level, spawnParticles]);

  const checkCollision = useCallback(
    (birdY, pipes) => {
      const birdLeft = BIRD.X + 6;
      const birdRight = BIRD.X + BIRD.WIDTH - 6;
      const birdTop = birdY + 4;
      const birdBottom = birdY + BIRD.HEIGHT - 4;

      if (birdBottom >= SCREEN.HEIGHT - GROUND.HEIGHT || birdTop <= 0) return true;

      for (const pipe of pipes) {
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE.WIDTH;
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
          // Vérifier le bouclier
          if (activePowerUp !== 'shield') {
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) return true;
          }
        }
      }
      return false;
    },
    [activePowerUp]
  );

  const gameLoop = useCallback(() => {
    if (!isAliveRef.current) return;

    velocityRef.current = Math.min(
      velocityRef.current + level.gravity,
      BIRD.MAX_FALL_SPEED
    );
    velocityRef.current = Math.max(velocityRef.current, BIRD.MAX_RISE_SPEED);

    const newBirdY = birdYRef.current + velocityRef.current;
    birdYRef.current = newBirdY;

    const rotation = Math.min(Math.max(velocityRef.current * 4, -30), 90);
    setBirdRotation(rotation);

    // Appliquer le ralentissement si power-up actif
    const pipeSpeed = activePowerUp === 'slow' ? level.pipeSpeed * 0.5 : level.pipeSpeed;

    const updatedPipes = pipesRef.current.map((pipe) => ({
      ...pipe,
      x: pipe.x - pipeSpeed,
    }));

    const filtered = updatedPipes.filter((p) => p.x > -PIPE.WIDTH - 10);

    let newScore = scoreRef.current;
    let newCoins = coins;
    
    const scoredPipes = filtered.map((pipe) => {
      if (!pipe.passed && pipe.x + PIPE.WIDTH < BIRD.X) {
        newScore += 1;
        return { ...pipe, passed: true };
      }
      return pipe;
    });

    // Vérifier les collisions avec les pièces
    const pipesWithCoins = scoredPipes.map((pipe) => {
      if (pipe.coin && !pipe.coin.collected) {
        const birdCenterX = BIRD.X + BIRD.WIDTH / 2;
        const birdCenterY = newBirdY + BIRD.HEIGHT / 2;
        const coinCenterX = pipe.coin.x + COIN.WIDTH / 2;
        const coinCenterY = pipe.coin.y + COIN.HEIGHT / 2;
        
        const distance = Math.sqrt(
          Math.pow(birdCenterX - coinCenterX, 2) + 
          Math.pow(birdCenterY - coinCenterY, 2)
        );
        
        // Effet aimant si power-up actif
        const magnetRange = activePowerUp === 'magnet' ? 100 : 30;
        if (distance < magnetRange) {
          newCoins += COIN.VALUE;
          // Son de pièce collectée
          audioService.playCoin();
          return { ...pipe, coin: { ...pipe.coin, collected: true } };
        }
      }
      return pipe;
    });

    // Vérifier les collisions avec les power-ups
    const pipesWithPowerUps = pipesWithCoins.map((pipe) => {
      if (pipe.powerUp && !pipe.powerUp.collected) {
        const birdCenterX = BIRD.X + BIRD.WIDTH / 2;
        const birdCenterY = newBirdY + BIRD.HEIGHT / 2;
        const powerUpCenterX = pipe.powerUp.x + POWERUP.WIDTH / 2;
        const powerUpCenterY = pipe.powerUp.y + POWERUP.HEIGHT / 2;
        
        const distance = Math.sqrt(
          Math.pow(birdCenterX - powerUpCenterX, 2) + 
          Math.pow(birdCenterY - powerUpCenterY, 2)
        );
        
        if (distance < 30) {
          setActivePowerUp(pipe.powerUp.type);
          setPowerUpTimer(POWERUP.DURATION);
          // Son de power-up activé
          audioService.playPowerUp(pipe.powerUp.type);
          audioService.playVoiceOver('powerup_activated');
          setTimeout(() => {
            setActivePowerUp(null);
            setPowerUpTimer(null);
          }, POWERUP.DURATION);
          return { ...pipe, powerUp: { ...pipe.powerUp, collected: true } };
        }
      }
      return pipe;
    });

    if (newScore !== scoreRef.current) {
      scoreRef.current = newScore;
      setScore(newScore);
      onScoreUpdate(newScore);
    }
    
    if (newCoins !== coins) {
      setCoins(newCoins);
    }

    pipesRef.current = pipesWithPowerUps;

    if (checkCollision(newBirdY, pipesWithPowerUps)) {
      isAliveRef.current = false;
      setIsAlive(false);
      // Son de collision
      audioService.playCollision();
      onGameOver(scoreRef.current, coins);
      return;
    }

    setBirdY(newBirdY);
    setPipes([...pipesWithPowerUps]);

    frameRef.current = requestAnimationFrame(gameLoop);
  }, [level, checkCollision, onGameOver, onScoreUpdate, coins, activePowerUp]);

  const startPipeSpawner = useCallback(() => {
    const spawn = () => {
      if (!isAliveRef.current) return;
      const newPipe = createPipe(level);
      pipesRef.current = [...pipesRef.current, newPipe];
      pipeTimerRef.current = setTimeout(spawn, level.pipeInterval);
    };
    pipeTimerRef.current = setTimeout(spawn, level.pipeInterval);
  }, [level]);

  const startGame = useCallback(() => {
    birdYRef.current = SCREEN.HEIGHT / 2 - 50;
    velocityRef.current = 0;
    pipesRef.current = [];
    scoreRef.current = 0;
    isAliveRef.current = true;

    setBirdY(SCREEN.HEIGHT / 2 - 50);
    setPipes([]);
    setScore(0);
    setIsAlive(true);
    setBirdRotation(0);
    setCoins(0);
    setActivePowerUp(null);
    setPowerUpTimer(null);

    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    if (pipeTimerRef.current) clearTimeout(pipeTimerRef.current);

    frameRef.current = requestAnimationFrame(gameLoop);
    startPipeSpawner();
  }, [gameLoop, startPipeSpawner]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      if (pipeTimerRef.current) clearTimeout(pipeTimerRef.current);
    };
  }, []);

  return { 
    birdY, 
    birdRotation, 
    pipes, 
    score, 
    isAlive, 
    particles, 
    coins, 
    activePowerUp, 
    powerUpTimer,
    flap, 
    startGame 
  };
};
