import { useCallback, useEffect, useRef, useState } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordedSegments, setRecordedSegments] = useState([]);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [recordingPlaybackTime, setRecordingPlaybackTime] = useState(0);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [retakePoint, setRetakePoint] = useState(null);
  const [previousSegments, setPreviousSegments] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioStreamRef = useRef(null);
  const recordingProgressRef = useRef(0);
  const recordingPlayerRef = useRef(new Audio());

  // Initialize recording player event listeners
  useEffect(() => {
    const player = recordingPlayerRef.current;
    
    const handlePlaybackEnd = () => {
      setIsPlayingRecording(false);
      setRecordingPlaybackTime(0);
    };

    const handleTimeUpdate = () => {
      setRecordingPlaybackTime(player.currentTime);
    };

    player.addEventListener('ended', handlePlaybackEnd);
    player.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      player.removeEventListener('ended', handlePlaybackEnd);
      player.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, []);

  // Define WAV encoder helper functions in advance
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++){
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const encodeWAV = (audioBuffer) => {
    const numOfChan = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    let samples;
    if (numOfChan === 1) {
      samples = audioBuffer.getChannelData(0);
    } else {
      const channel0 = audioBuffer.getChannelData(0);
      const channel1 = audioBuffer.getChannelData(1);
      samples = new Float32Array(channel0.length + channel1.length);
      for (let i = 0, j = 0; i < channel0.length; i++, j += 2) {
        samples[j] = channel0[i];
        samples[j + 1] = channel1[i];
      }
    }
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    // RIFF chunk descriptor
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    // fmt subchunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numOfChan, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numOfChan * 2, true);
    view.setUint16(32, numOfChan * 2, true);
    view.setUint16(34, 16, true);
    // data subchunk
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
      let s = Math.max(-1, Math.min(1, samples[i]));
      s = s < 0 ? s * 0x8000 : s * 0x7FFF;
      view.setInt16(offset, s, true);
    }
    return new Blob([view], { type: 'audio/wav' });
  };

  const mergeRecordings = useCallback(async (retakeSegment) => {
    if (!previousSegments.length || !retakeSegment || retakePoint === null) {
      return;
    }

    try {
      const originalBlob = new Blob(previousSegments[0].chunks, { type: 'audio/wav' });
      const newBlob = new Blob(retakeSegment.chunks, { type: 'audio/wav' });

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();

      // decode Blob get AudioBuffer
      const originalBuffer = await audioContext.decodeAudioData(await originalBlob.arrayBuffer());
      const newBuffer = await audioContext.decodeAudioData(await newBlob.arrayBuffer());

      const sampleRate = originalBuffer.sampleRate;
      // calculate the sample points to keep in the original recording (0 to retakePoint)
      const cutoffSample = Math.floor(Math.min(retakePoint, originalBuffer.duration) * sampleRate);
      const numChannels = originalBuffer.numberOfChannels;

      // create new AudioBuffer: original part + retake recording whole
      const totalLength = cutoffSample + newBuffer.length;
      const mergedBuffer = audioContext.createBuffer(numChannels, totalLength, sampleRate);

      for (let channel = 0; channel < numChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel);
        const mergedData = mergedBuffer.getChannelData(channel);
        // use subarray and set to implement efficient copy
        mergedData.set(originalData.subarray(0, cutoffSample));
        const newData = newBuffer.getChannelData(channel);
        mergedData.set(newData, cutoffSample);
      }

      const wavBlob = encodeWAV(mergedBuffer);
      const audioUrl = URL.createObjectURL(wavBlob);

      setRecordedAudio(audioUrl);
      setRecordedSegments([
        {
          startTime: 0,
          endTime: mergedBuffer.duration,
          chunks: [], // the merged Blob get the recording by URL
          url: audioUrl,
        },
      ]);

      if (recordingPlayerRef.current) {
        recordingPlayerRef.current.src = audioUrl;
        recordingPlayerRef.current.load();
      }

      // clean up retake related states
      setRetakePoint(null);
      setPreviousSegments([]);
    } catch (error) {
      console.error('Error merging recordings:', error);
    }
  }, [previousSegments, retakePoint]);

  const startRecording = useCallback(async (startTime = 0) => {
    try {
      // Use raw microphone input, disable echo cancellation, noise suppression and auto gain control
      // to avoid algorithm interference causing recording distortion when playing background music
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
          sampleRate: 48000,
          latency: 0,
        }
      });

      // Create AudioContext to process audio stream, note this is only used for collection, not connected to output
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      // Add a gain node to control recording level (if needed, gain value can be fine-tuned)
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 1.0;
      source.connect(gainNode);
      
      // Record audio with higher bitrate
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 256000
      });
      
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      // When recording stops, first decode the recording data, then generate a higher quality PCM format file through encodeWAV
      recorder.onstop = () => {
        (async () => {
          try {
            const mimeType = recorder.mimeType || 'audio/webm;codecs=opus';
            const blob = new Blob(chunks, { type: mimeType });
            const arrayBuffer = await blob.arrayBuffer();
            const tempAudioContext = new (window.AudioContext || window.webkitAudioContext)();
            const decodedBuffer = await tempAudioContext.decodeAudioData(arrayBuffer);
            // use the predefined encodeWAV function to generate WAV Blob
            const wavBlob = encodeWAV(decodedBuffer);
            const audioUrl = URL.createObjectURL(wavBlob);

            const newSegment = {
              startTime: startTime,
              endTime: recordingProgressRef.current,
              chunks: chunks,
              url: audioUrl,
            };

            if (retakePoint !== null) {
              mergeRecordings(newSegment);
            } else {
              setRecordedAudio(audioUrl);
              setRecordedSegments([newSegment]);
              if (recordingPlayerRef.current) {
                recordingPlayerRef.current.src = audioUrl;
                recordingPlayerRef.current.load();
              }
            }
          } catch (err) {
            console.error("Error processing recorded audio:", err);
          }
        })();
      };

      mediaRecorderRef.current = recorder;
      recordingProgressRef.current = startTime;
      setIsRecording(true);
      recorder.start();

      // Save audio resource reference for later cleanup
      audioStreamRef.current = {
        stream,
        audioContext,
        source,
        gainNode
      };
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [retakePoint, mergeRecordings]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Clean up audio processing resources
      if (audioStreamRef.current) {
        const { stream, audioContext, source, gainNode } = audioStreamRef.current;
        
        // Disconnect audio nodes
        gainNode?.disconnect();
        source?.disconnect();
        
        // Close audio context
        audioContext?.close();
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Clear reference
        audioStreamRef.current = null;
      }
      
      setIsRecording(false);
    }
  }, [isRecording]);

  const playRecording = useCallback(() => {
    if (recordingPlayerRef.current && recordedAudio) {
      recordingPlayerRef.current.play();
      setIsPlayingRecording(true);
    }
  }, [recordedAudio]);

  const pauseRecording = useCallback(() => {
    if (recordingPlayerRef.current) {
      recordingPlayerRef.current.pause();
      setIsPlayingRecording(false);
    }
  }, []);

  const clearRecording = useCallback(() => {
    setRecordedAudio(null);
    setRecordedSegments([]);
    setRecordingPlaybackTime(0);
    setIsPlayingRecording(false);
    setRetakePoint(null);
    setPreviousSegments([]);
    if (recordingPlayerRef.current) {
      recordingPlayerRef.current.src = '';
    }
  }, []);

  const seekRecordingPlayback = useCallback((time) => {
    if (recordingPlayerRef.current) {
      recordingPlayerRef.current.currentTime = time;
      setRecordingPlaybackTime(time);
    }
  }, []);

  const updateRecordingProgress = useCallback((time) => {
    recordingProgressRef.current = time;
    setRecordingProgress(time);
  }, []);

  const startRetake = useCallback((point) => {
    if (!point || !point.time) return;

    const [minutes, seconds] = point.time.split(':').map(Number);
    const retakeTime = minutes * 60 + seconds;

    // save the current recording segment, and record the retake start point
    setPreviousSegments(recordedSegments);
    setRetakePoint(retakeTime);
  }, [recordedSegments]);

  return {
    isRecording,
    recordedAudio,
    recordedSegments,
    recordingProgress,
    isPlayingRecording,
    recordingPlaybackTime,
    recordingPlayerRef,
    startRecording,
    stopRecording,
    clearRecording,
    playRecording,
    pauseRecording,
    seekRecordingPlayback,
    updateRecordingProgress,
    startRetake,
    mergeRecordings,
    retakePoint,
  };
};

export default useAudioRecorder;
