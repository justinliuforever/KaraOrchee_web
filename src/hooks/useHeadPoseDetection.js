import { useEffect, useRef, useState } from 'react';

import config from '../config';

const useHeadPoseDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('initializing');
  const [pitch, setPitch] = useState(null);
  const [yaw, setYaw] = useState(null);
  const [roll, setRoll] = useState(null);
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
            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result;
              const bytes = new Uint8Array(arrayBuffer);
              const hexString = Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
              ws.send(JSON.stringify({ frame: hexString }));
            };
            reader.readAsArrayBuffer(blob);
          }
        }, 'image/jpeg', 0.5);
      }
    };

    const interval = setInterval(sendFrame, 150); // Adjust the interval as needed

    return () => {
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  useEffect(() => {
    const connectWebSocket = () => {
      const websocket = new WebSocket(`${config.ws}/head-pose`);
      websocket.binaryType = 'arraybuffer';

      websocket.onopen = () => {
        console.log('WebSocket connection established');
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setStatus(data.pitch !== null ? 'detected' : 'no face');
        setPitch(data.pitch);
        setYaw(data.yaw);
        setRoll(data.roll);

        const frameHex = data.frame;
        const frameBuffer = new Uint8Array(frameHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
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
        console.log('WebSocket connection closed');
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

  return { videoRef, canvasRef, status, pitch, yaw, roll };
};

export default useHeadPoseDetection;
