import { useEffect, useRef, useState } from 'react';

import config from '../config';

const useHeadPoseDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const [status, setStatus] = useState('initializing');
  const [pitch, setPitch] = useState(null);
  const [yaw, setYaw] = useState(null);
  const [roll, setRoll] = useState(null);

  useEffect(() => {
    let isComponentMounted = true;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    let frameInterval;

    const initialize = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isComponentMounted) return;
        
        video.srcObject = stream;
        
        await new Promise((resolve) => {
          video.addEventListener('loadeddata', () => {
            video.play().catch(console.error);
            resolve();
          }, { once: true });
        });

        if (!isComponentMounted) return;
        
        const websocket = new WebSocket(`${config.ws}/head-pose`);
        websocket.binaryType = 'arraybuffer';

        websocket.onopen = () => {
          if (!isComponentMounted) {
            websocket.close();
            return;
          }
          console.log('WebSocket connection established');
        };

        websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          setStatus(data.pitch !== null ? 'detected' : 'no face');
          setPitch(data.pitch);
          setYaw(data.yaw);
          setRoll(data.roll);
        };

        websocket.onclose = () => {
          console.log('WebSocket connection closed');
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        wsRef.current = websocket;

        const sendFrame = () => {
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(blob => {
              if (blob && isComponentMounted) {
                const reader = new FileReader();
                reader.onload = () => {
                  if (wsRef.current?.readyState === WebSocket.OPEN && isComponentMounted) {
                    const arrayBuffer = reader.result;
                    const bytes = new Uint8Array(arrayBuffer);
                    const hexString = Array.from(bytes)
                      .map(byte => byte.toString(16).padStart(2, '0'))
                      .join('');
                    wsRef.current.send(JSON.stringify({ frame: hexString }));
                  }
                };
                reader.readAsArrayBuffer(blob);
              }
            }, 'image/jpeg', 0.5);
          }
        };

        frameInterval = setInterval(sendFrame, 150);
      } catch (err) {
        console.error("Error initializing:", err);
      }
    };

    initialize();

    return () => {
      isComponentMounted = false;
      clearInterval(frameInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (video.srcObject) {
        video.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return { videoRef, canvasRef, status, pitch, yaw, roll };
};

export default useHeadPoseDetection;
