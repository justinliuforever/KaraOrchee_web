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

  // 初始化录音播放器的事件监听
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

  // 将 WAV 编码器相关的辅助函数提前定义
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
      // 交错合并前两个通道的数据
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
      // 直接使用 Blob 数组（chunks 内部已是 Blob 对象）
      const originalBlob = new Blob(previousSegments[0].chunks, { type: 'audio/wav' });
      const newBlob = new Blob(retakeSegment.chunks, { type: 'audio/wav' });

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();

      // 解码两个 Blob 得到 AudioBuffer
      const originalBuffer = await audioContext.decodeAudioData(await originalBlob.arrayBuffer());
      const newBuffer = await audioContext.decodeAudioData(await newBlob.arrayBuffer());

      const sampleRate = originalBuffer.sampleRate;
      // 计算原始录音中保留的采样点（0 到 retakePoint）
      const cutoffSample = Math.floor(Math.min(retakePoint, originalBuffer.duration) * sampleRate);
      const numChannels = originalBuffer.numberOfChannels;

      // 创建新 AudioBuffer: 原始部分 + 重录录音整段
      const totalLength = cutoffSample + newBuffer.length;
      const mergedBuffer = audioContext.createBuffer(numChannels, totalLength, sampleRate);

      for (let channel = 0; channel < numChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel);
        const mergedData = mergedBuffer.getChannelData(channel);
        // 使用 subarray 和 set 实现高效复制
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
          chunks: [], // 合并后的 Blob 通过 URL 得到录音
          url: audioUrl,
        },
      ]);

      if (recordingPlayerRef.current) {
        recordingPlayerRef.current.src = audioUrl;
        recordingPlayerRef.current.load();
      }

      // 清理重录相关状态
      setRetakePoint(null);
      setPreviousSegments([]);
    } catch (error) {
      console.error('Error merging recordings:', error);
    }
  }, [previousSegments, retakePoint]);

  const startRecording = useCallback(async (startTime = 0) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      // 直接存储 Blob 数据，无需额外元信息
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        const newSegment = {
          startTime: startTime,
          endTime: recordingProgressRef.current,
          chunks: chunks,
          url: audioUrl
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
      };

      mediaRecorderRef.current = recorder;
      recordingProgressRef.current = startTime;
      setIsRecording(true);
      recorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, [retakePoint, mergeRecordings]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      // 这里直接设置为 false，方便 UI 立即更新（onstop 内不再重复更新）
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

    // 保存当前录音片段，并记录重录起始点
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
