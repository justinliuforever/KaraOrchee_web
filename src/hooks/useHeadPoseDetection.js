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
  const [mediaStream, setMediaStream] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    const startVideo = () => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
          video.srcObject = stream;
          setMediaStream(stream);
          video.addEventListener('loadeddata', () => {
            video.play().catch(error => {
              console.error("Error playing video: ", error);
            });
          });
        })
        .catch(err => {
          console.error("Error accessing webcam and microphone: ", err);
        });
    };

    startVideo();

    const sendFrame = () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              const arrayBuffer = reader.result;
              const bytes = new Uint8Array(arrayBuffer);
              const hexString = Array.from(bytes).map(byte => byte.toString(16).padStart(2, '0')).join('');
              wsRef.current.send(JSON.stringify({ frame: hexString }));
            };
            reader.readAsArrayBuffer(blob);
          }
        }, 'image/jpeg', 0.5);
      }
    };

    const interval = setInterval(sendFrame, 150);

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
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
    };

    websocket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current = websocket;

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { videoRef, canvasRef, status, pitch, yaw, roll, mediaStream };
};

export default useHeadPoseDetection;
