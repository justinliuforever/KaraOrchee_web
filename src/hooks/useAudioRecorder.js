import { useCallback, useRef, useState } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);

  const startRecording = useCallback(async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTracks = audioStream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks available in the stream.');
      }

      const recorder = new MediaRecorder(audioStream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        setRecordedAudio(audioUrl);
        setAudioChunks(chunks);

        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      audioStreamRef.current = audioStream;
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
