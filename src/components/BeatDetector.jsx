import React, { useEffect, useRef, useState } from 'react';

import Meyda from 'meyda';

const BeatDetector = () => {
  const [isListening, setIsListening] = useState(false);
  const [beatDetected, setBeatDetected] = useState(false);
  const [energy, setEnergy] = useState(null);
  const audioContextRef = useRef(null);
  const micRef = useRef(null);
  const analyzerRef = useRef(null);
  const lastBeatTimeRef = useRef(0);

  useEffect(() => {
    if (isListening) {
      startListening();
    } else {
      stopListening();
    }
    // Cleanup on component unmount
    return () => stopListening();
  }, [isListening]);

  const startListening = async () => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    micRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContextRef.current.createMediaStreamSource(micRef.current);
    analyzerRef.current = Meyda.createMeydaAnalyzer({
      audioContext: audioContextRef.current,
      source: source,
      bufferSize: 512,
      featureExtractors: ['energy'],
      callback: features => {
        const currentEnergy = features.energy;
        setEnergy(currentEnergy);
        const currentTime = audioContextRef.current.currentTime;
        const timeDiff = currentTime - lastBeatTimeRef.current;
        if (timeDiff > 0.5 && currentEnergy > 0.1) { // 假设0.5秒为一个节拍，能量阈值为0.1
          setBeatDetected(true);
          setTimeout(() => setBeatDetected(false), 100); // 短暂显示节拍检测
          lastBeatTimeRef.current = currentTime;
        }
      }
    });
    analyzerRef.current.start();
  };

  const stopListening = () => {
    if (micRef.current) {
      micRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (analyzerRef.current) {
      analyzerRef.current.stop();
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={() => setIsListening(!isListening)}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        {isListening ? 'Stop Listening' : 'Start Listening'}
      </button>
      <div className="mt-4">
        {isListening ? (beatDetected ? 'Beat Detected!' : 'Listening...') : 'Not Listening'}
      </div>
      {energy && (
        <div className="mt-2">
          Energy: {energy.toFixed(2)}
        </div>
      )}
    </div>
  );
};

export default BeatDetector;
