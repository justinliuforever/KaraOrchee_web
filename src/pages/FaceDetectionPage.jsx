import React, { useEffect, useRef, useState } from 'react';

import config from '../config';

const FaceDetectionPage = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState('No Face Detected');
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

    const interval = setInterval(sendFrame, 100); // Adjust the interval as needed

    return () => {
      clearInterval(interval);
      if (ws) {
        ws.close();
      }
    };
  }, [ws]);

  useEffect(() => {
    const connectWebSocket = () => {
      //const websocket = new WebSocket('ws://127.0.0.1:8000/ws/video');
      const websocket = new WebSocket(config.ws); 
      websocket.binaryType = 'arraybuffer';

      websocket.onopen = () => {
        console.log('WebSocket connection established');
      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setStatus(data.status);

        const frameBuffer = new Uint8Array(data.frame.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        const blob = new Blob([frameBuffer], { type: 'image/jpeg' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');
          context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Face Detection</h1>
      <video ref={videoRef} width="640" height="480" className="border"></video>
      <canvas ref={canvasRef} width="640" height="480" className="border"></canvas>
      <div className="mt-4 text-2xl">{status}</div>
    </div>
  );
};

export default FaceDetectionPage;
