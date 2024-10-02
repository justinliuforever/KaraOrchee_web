import React, { useEffect, useRef } from 'react';

import useHeadPoseDetection from '../hooks/useHeadPoseDetection';

const HeadPoseDetectionPage = () => {
  const { videoRef, canvasRef, status, pitch, yaw, roll } = useHeadPoseDetection();
  const pointCanvasRef = useRef(null);
  const requestRef = useRef();

  const draw = () => {
    const canvas = pointCanvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // 清空画布
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    // 根据 pitch 计算点的位置
    const y = canvasHeight / 2 - (pitch || 0) * 5; // 调整系数以控制敏感度

    // 限制点在画布范围内
    const clampedY = Math.max(0, Math.min(canvasHeight, y));

    // 绘制点
    context.beginPath();
    context.arc(canvasWidth / 2, clampedY, 10, 0, 2 * Math.PI, false);
    context.fillStyle = 'blue';
    context.fill();
    context.lineWidth = 2;
    context.strokeStyle = '#003300';
    context.stroke();

    // 请求下一帧
    requestRef.current = requestAnimationFrame(draw);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(requestRef.current);
    // 我们在依赖项中加入了 pitch，这样当 pitch 发生变化时，动画会自动更新
  }, [pitch]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Head Pose Detection</h1>
      <video ref={videoRef} width="640" height="480" className="border hidden"></video>
      <canvas ref={canvasRef} width="640" height="480" className="border"></canvas>
      <div className="mt-4 text-2xl">{status}</div>
      {pitch !== null && <div className="mt-2 text-xl">Pitch: {pitch.toFixed(2)}</div>}
      {yaw !== null && <div className="mt-2 text-xl">Yaw: {yaw.toFixed(2)}</div>}
      {roll !== null && <div className="mt-2 text-xl">Roll: {roll.toFixed(2)}</div>}

      {/* 新增的点移动画布 */}
      <canvas ref={pointCanvasRef} width="300" height="300" className="border mt-8"></canvas>
    </div>
  );
};

export default HeadPoseDetectionPage;
