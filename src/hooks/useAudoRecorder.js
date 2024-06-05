import { useState, useEffect } from "react";

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (mediaRecorder) {
      const handleDataAvailable = (event) => {
        setAudioBlob(event.data);
        setAudioURL(URL.createObjectURL(event.data));
      };

      mediaRecorder.addEventListener("dataavailable", handleDataAvailable);

      return () => {
        mediaRecorder.removeEventListener("dataavailable", handleDataAvailable);
      };
    }
  }, [mediaRecorder]);

    const startRecording = () => {
      navigator?.mediaDevices?.getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
          recorder.start();
          setIsRecording(true);
        })
        .catch((err) => {
          setError(`Error accessing media devices: ${err.message}`);
          console.error("Error accessing media devices.", err);
        });
    };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  return {
    isRecording,
    audioBlob,
    audioURL,
    startRecording,
    stopRecording,
    error,
  };
};
