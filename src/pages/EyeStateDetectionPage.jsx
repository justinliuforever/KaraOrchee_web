import { useCallback, useEffect, useRef, useState } from 'react';

import config from '../config';

const EyeStateDetectionPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Eyes Open');
  const [earValue, setEarValue] = useState(0);
  const [ws, setWs] = useState(null);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [fps, setFps] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);
  const [networkLatency, setNetworkLatency] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const frameTimestamps = useRef([]);
  const lastFrameTime = useRef(0);
  const lastSentTime = useRef(0);

  const connectWebSocket = useCallback(() => {
    const websocket = new WebSocket(`${config.ws}/eye-state`);
    websocket.binaryType = 'arraybuffer';

    websocket.onopen = () => {
      console.log('WebSocket connection established for eye state detection');
    };

    websocket.onmessage = (event) => {
      const currentTime = performance.now();
      const data = JSON.parse(event.data);
      setStatus(data.status);
      
      const earMatch = data.status.match(/EAR: (\d+\.\d+)/);
      if (earMatch) {
        setEarValue(parseFloat(earMatch[1]));
      }

      // Calculate processing time and network latency
      const frameProcessingTime = currentTime - lastFrameTime.current;
      setProcessingTime(frameProcessingTime);
      setNetworkLatency(currentTime - lastSentTime.current);

      // Update FPS
      frameTimestamps.current.push(currentTime);
      if (frameTimestamps.current.length > 30) {
        frameTimestamps.current.shift();
      }
      if (frameTimestamps.current.length > 1) {
        const timeElapsed = frameTimestamps.current[frameTimestamps.current.length - 1] - frameTimestamps.current[0];
        setFps(Math.round((frameTimestamps.current.length - 1) / (timeElapsed / 1000)));
      }

      // Update total frames processed
      setTotalFrames(prevTotal => prevTotal + 1);

      const frameBuffer = new Uint8Array(data.frame.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      const blob = new Blob([frameBuffer], { type: 'image/jpeg' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
      };
      img.src = url;

      lastFrameTime.current = currentTime;
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed for eye state detection');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    setWs(websocket);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          video.srcObject = stream;
          video.addEventListener('loadeddata', () => {
            video.play().catch(error => {
              console.error("Error playing video: ", error);
            });
          });
        })
        .catch(err => {
          console.error("Error accessing webcam: ", err);
        });
    };

    startVideo();
    connectWebSocket();

    const sendFrame = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            blob.arrayBuffer().then(buffer => {
              lastSentTime.current = performance.now();
              ws.send(JSON.stringify({
                frame: Array.from(new Uint8Array(buffer)),
                showLandmarks: showLandmarks
              }));
            });
          }
        }, 'image/jpeg');
      }
    };

    const interval = setInterval(sendFrame, 150);

    return () => {
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
    };
  }, [connectWebSocket, showLandmarks]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Eye State Detection</h1>
      <video ref={videoRef} width="640" height="480" className="border"></video>
      <canvas ref={canvasRef} width="640" height="480" className="border"></canvas>
      <div className="mt-4 text-2xl">Status: {status}</div>
      <div className="mt-2 text-xl">EAR Value: {earValue.toFixed(2)}</div>
      <div className="mt-2 text-xl">FPS: {fps}</div>
      <div className="mt-2 text-xl">Processing Time: {processingTime.toFixed(2)} ms</div>
      <div className="mt-2 text-xl">Network Latency: {networkLatency.toFixed(2)} ms</div>
      <div className="mt-2 text-xl">Total Frames Processed: {totalFrames}</div>
      <button
        onClick={() => setShowLandmarks(!showLandmarks)}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        {showLandmarks ? "Hide Landmarks" : "Show Landmarks"}
      </button>
    </div>
  );
};

export default EyeStateDetectionPage;
