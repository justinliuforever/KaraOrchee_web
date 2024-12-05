import { useCallback, useRef, useState } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);

  const startRecording = useCallback((stream) => {
    try {
      if (!stream) {
        throw new Error('No media stream provided');
      }

      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available in the stream.');
      }

      const audioStream = new MediaStream(audioTracks);
      const recorder = new MediaRecorder(audioStream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        setRecordedAudio(audioUrl);
        setAudioChunks(chunks);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const clearRecording = useCallback(() => {
    if (recordedAudio) {
      URL.revokeObjectURL(recordedAudio);
    }
    setRecordedAudio(null);
    setAudioChunks([]);
  }, [recordedAudio]);

  return {
    isRecording,
    recordedAudio,
    audioChunks,
    startRecording,
    stopRecording,
    clearRecording,
  };
};
