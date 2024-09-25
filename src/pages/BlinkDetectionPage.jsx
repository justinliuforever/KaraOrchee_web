import { useEffect, useRef, useState } from 'react';

import config from '../config';

const EyeStateDetectionPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('Eyes Open');
  const [earValue, setEarValue] = useState(0);
  const [ws, setWs] = useState(null);

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

    const sendFrame = () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            blob.arrayBuffer().then(buffer => {
              ws.send(buffer);
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
  }, [ws]);

  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket(`${config.ws}/eye-state-detection`);
      websocket.binaryType = 'arraybuffer';

      websocket.onopen = () => {
        console.log('WebSocket connection established for eye state detection');
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("Received data:", data);
        setStatus(data.status);
        
        // Extract EAR value from the status string
        const earMatch = data.status.match(/EAR: (\d+\.\d+)/);
        if (earMatch) {
          setEarValue(parseFloat(earMatch[1]));
        }

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
      };

      websocket.onclose = () => {
        console.log('WebSocket connection closed for eye state detection');
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      setWs(websocket);
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Eye State Detection</h1>
      <video ref={videoRef} width="640" height="480" className="border"></video>
      <canvas ref={canvasRef} width="640" height="480" className="border"></canvas>
      <div className="mt-4 text-2xl">Status: {status}</div>
      <div className="mt-2 text-xl">EAR Value: {earValue.toFixed(2)}</div>
    </div>
  );
};

export default EyeStateDetectionPage;
