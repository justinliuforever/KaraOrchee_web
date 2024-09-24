import { Chart, registerables } from 'chart.js';
import React, { useEffect, useRef, useState } from 'react';

import { Line } from 'react-chartjs-2';
import Meyda from 'meyda';

Chart.register(...registerables);

const BeatDetector = () => {
  const [isListening, setIsListening] = useState(false);
  const [beatDetected, setBeatDetected] = useState(false);
  const [energy, setEnergy] = useState(null);
  const [energyData, setEnergyData] = useState([]);
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
        setEnergyData(prevData => [...prevData.slice(-99), currentEnergy]); // 保持数据长度为100
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

  const data = {
    labels: Array.from({ length: energyData.length }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Energy',
        data: energyData,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        display: false,
      },
      y: {
        beginAtZero: true,
      },
    },
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
      <div className="mt-4">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default BeatDetector;
