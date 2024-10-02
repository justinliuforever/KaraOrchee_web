import React, { useEffect, useRef } from 'react';

import useHeadPoseDetection from '../hooks/useHeadPoseDetection';

const AudioPlayerWithCV = () => {
  const { videoRef, canvasRef, status, pitch } = useHeadPoseDetection();
  const pointCanvasRef = useRef(null);
  const audioRef = useRef(null);
  const requestRef = useRef();

  const draw = () => {
    const canvas = pointCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Clear the canvas
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate point position based on pitch
    const y = canvasHeight / 2 - (pitch || 0) * 5;

    // Clamp the point within canvas boundaries
    const clampedY = Math.max(0, Math.min(canvasHeight, y));

    // Draw the point
    context.beginPath();
    context.arc(canvasWidth / 2, clampedY, 10, 0, 2 * Math.PI, false);
    context.fillStyle = 'blue';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.stroke();

    // Request next frame
    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    if (pointCanvasRef.current) {
      requestRef.current = requestAnimationFrame(draw);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [pitch]);

  useEffect(() => {
    if (audioRef.current && pitch !== null) {
      if (pitch >= 10) {
        // Play the music when pitch reaches threshold
        audioRef.current.play();
      } else {
        // Pause the music
        audioRef.current.pause();
      }
    }
  }, [pitch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Audio Player with CV Control</h1>
      <audio
        ref={audioRef}
        src="https://firebasestorage.googleapis.com/v0/b/musicinformaudiostream.appspot.com/o/audios%2F1712787441931_i-allegronontroppemoltomaestoso-backing.mp3?alt=media&token=d9d3333e-b90a-4a43-982e-23ce1318882b"
        controls
        className="mb-4"
      ></audio>
      {/* Hidden video and canvas elements required for head pose detection */}
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      ></video>
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
        width="640"
        height="480"
      ></canvas>
      {/* pointCanvasRef canvas */}
      <canvas
        ref={pointCanvasRef}
        width="300"
        height="300"
        className="border mt-8"
      ></canvas>
    </div>
  );
};

export default AudioPlayerWithCV;
