import { useState, useEffect, useRef, useCallback } from "react";
import { SCREEN, BIRD, PIPE, GROUND, LEVELS } from "../constants/gameConfig";

const PIPE_START_X = SCREEN.WIDTH + 100;

const createPipe = (level) => {
  const minTop = 80;
  const maxTop = SCREEN.HEIGHT - GROUND.HEIGHT - level.pipeGap - 80;
  const topHeight = Math.random() * (maxTop - minTop) + minTop;
  return {
    id: Date.now() + Math.random(),
    x: PIPE_START_X,
    topHeight,
    bottomY: topHeight + level.pipeGap,
    passed: false,
  };
};

export const useGameEngine = (level, onGameOver, onScoreUpdate) => {
  const [birdY, setBirdY] = useState(SCREEN.HEIGHT / 2 - 50);
  const [birdRotation, setBirdRotation] = useState(0);
  const [pipes, setPipes] = useState([]);
  const [score, setScore] = useState(0);
  const [isAlive, setIsAlive] = useState(true);
  const [particles, setParticles] = useState([]);

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
          if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) return true;
        }
      }
      return false;
    },
    []
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

    const updatedPipes = pipesRef.current.map((pipe) => ({
      ...pipe,
      x: pipe.x - level.pipeSpeed,
    }));

    const filtered = updatedPipes.filter((p) => p.x > -PIPE.WIDTH - 10);

    let newScore = scoreRef.current;
    const scoredPipes = filtered.map((pipe) => {
      if (!pipe.passed && pipe.x + PIPE.WIDTH < BIRD.X) {
        newScore += 1;
        return { ...pipe, passed: true };
      }
      return pipe;
    });

    if (newScore !== scoreRef.current) {
      scoreRef.current = newScore;
      setScore(newScore);
      onScoreUpdate(newScore);
    }

    pipesRef.current = scoredPipes;

    if (checkCollision(newBirdY, scoredPipes)) {
      isAliveRef.current = false;
      setIsAlive(false);
      onGameOver(scoreRef.current);
      return;
    }

    setBirdY(newBirdY);
    setPipes([...scoredPipes]);

    frameRef.current = requestAnimationFrame(gameLoop);
  }, [level, checkCollision, onGameOver, onScoreUpdate]);

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

  return { birdY, birdRotation, pipes, score, isAlive, particles, flap, startGame };
};
