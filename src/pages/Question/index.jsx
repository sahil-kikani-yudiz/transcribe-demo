import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useAudioRecorder } from '../../hooks/useAudoRecorder'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

function Question() {
  const { handleSubmit, control, setValue, formState: { errors } } = useForm()
  const { isRecording, audioBlob, audioURL, startRecording, stopRecording, error } = useAudioRecorder()

  // function onSave(data) {
  //   const formData = new FormData()
  //   if (audioBlob) {
  //     formData.append('audio', audioBlob, 'recording.wav')
  //   }
  //   formData.append('data', JSON.stringify(data))
  //   console.log('data :>> ', data)
  // }

  const question = 'First Question'

  // http://192.168.11.102:5000/health
  async function handleApi(formData) {
    const response = await fetch('http://192.168.11.102:5000/ask_rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assessment_type: 'Managing Complexity',
        admin_question: question,
        user_prompt: formData?.answer
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    alert(`Rating: ${data?.rating}`);
  }

  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
  const { transcript, browserSupportsSpeechRecognition } = useSpeechRecognition()

  useEffect(() => {
    setValue('answer', transcript)
  }, [transcript, setValue])

  if (!browserSupportsSpeechRecognition) {
    return null
  }

  const startListeningAndRecording = () => {
    startRecording()
    startListening()
  }

  const stopListeningAndRecording = () => {
    stopRecording()
    SpeechRecognition.stopListening()
  }

  return (
    <div className='text-center mt-5'>
      <Form>
        <Form.Group>
          <Form.Label className='text-start mt-2'>{question}</Form.Label>
        </Form.Group>
        <Controller
          name={`answer`}
          control={control}
          rules={{ required: "Answer is required" }}
          render={({ field: { onChange, value } }) => (
            <Form.Control onChange={onChange} value={value} disabled={isRecording}  as='textarea' className='w-50 d-inline-block' />
          )}
        />
        {errors.answer && <p className="text-danger mt-2">{errors.answer.message}</p>}
      </Form>

      <div className='mt-3'>
        {isRecording ? (
          <>
            <Button onClick={stopListeningAndRecording}>Stop Recording</Button>
            <p className='text-danger mt-2'>Recording...</p>
          </>
        ) : (
          <Button onClick={startListeningAndRecording}>Start Recording</Button>
        )}
        {error && <p className='text-danger mt-2'>{error}</p>}
      </div>

      <div className='mt-3'>
        {audioURL && (
          <div>
            <p>Recorded Audio:</p>
            <audio controls src={audioURL}></audio>
          </div>
        )}
      </div>

      <div className='mt-3'>
        <Button onClick={handleSubmit(handleApi)}>Submit</Button>
      </div>
    </div>
  )
}

export default Question
