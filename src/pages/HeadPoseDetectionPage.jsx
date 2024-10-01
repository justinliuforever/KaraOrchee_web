import useHeadPoseDetection from '../hooks/useHeadPoseDetection';

const HeadPoseDetectionPage = () => {
  const { videoRef, canvasRef, status, pitch, yaw, roll } = useHeadPoseDetection();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold mb-8">Head Pose Detection</h1>
      <video ref={videoRef} width="640" height="480" className="border hidden"></video>
      <canvas ref={canvasRef} width="640" height="480" className="border"></canvas>
      <div className="mt-4 text-2xl">{status}</div>
      {pitch !== null && <div className="mt-2 text-xl">Pitch: {pitch.toFixed(2)}</div>}
      {yaw !== null && <div className="mt-2 text-xl">Yaw: {yaw.toFixed(2)}</div>}
      {roll !== null && <div className="mt-2 text-xl">Roll: {roll.toFixed(2)}</div>}
    </div>
  );
};

export default HeadPoseDetectionPage;
