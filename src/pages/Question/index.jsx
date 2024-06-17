import React, { useEffect, useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import { Controller, useForm } from 'react-hook-form'
import { useAudioRecorder } from '../../hooks/useAudoRecorder'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'

function Question() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm()
  const { isRecording, audioBlob, audioURL, startRecording, stopRecording, error, resetRecording } = useAudioRecorder()

  const uploadFile = async () => {
    const formData = new FormData()
    console.log('audioBlob', audioBlob)
    formData.append('localfile', audioBlob)
    formData.append('username', 'hardik')
    formData.append('datetime', '1122')

    try {
      const response = await fetch('http://13.233.5.250:5000/upload_speech', {
        method: 'put',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      } else {
        console.log('File uploaded successfully')
      }
    } catch (error) {
      console.error(`Error: ${error}`)
    }
  }

  // http://192.168.11.102:5000/health
  async function handleApi(formData) {
    uploadFile()
    const response = await fetch('http://13.233.5.250:5000/ask_rating', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        assessment_type: 'Managing Complexity',
        admin_question: questionData[currentIndex]?.sTitle,
        user_prompt: formData?.answer
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    resetTranscript()
    resetRecording()
    reset({ answer: '' })

    const data = await response.json()
    alert(`Rating: ${data?.Rating}`)
    setCurrentIndex((pre) => pre + 1)
  }

  const startListening = () => SpeechRecognition.startListening({ continuous: true, language: 'en-IN' })
  const { transcript, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition()

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

  const questionData = [
    { sTitle: 'What was the key business driver to enable the taking of the strategic decision?	' },
    { sTitle: 'What was the big picture you were looking at, in this situation?' },
    {
      sTitle: 'Did you depend on intuition, past experience, valid data or a combination of these factors to take the strategic decision?'
    },
    { sTitle: 'How comfortable were you in taking this strategic decision? How did you feel?' },
    { sTitle: 'Did you anticipate any stakeholder impact? What was your preparedness for this?	' }
  ]

  return (
    <div className='text-center mt-5 justify-content-center d-flex flex-column align-items-center'>
      <h3>Skills : Strategic Orientation</h3>
      <p className='w-50'>
        Tell us about a situation where you had to weigh the long-term business implications of a decision
        you made for your department/organisation. What strategy did you apply or develop to achieve the business goal or desired outcome?
      </p>
      {currentIndex < 5 ? (
        <Form>
          <Form.Group>
            <Form.Label className='text-start mt-2'>{questionData[currentIndex]?.sTitle}</Form.Label>
          </Form.Group>
          <Controller
            name={`answer`}
            control={control}
            rules={{ required: 'Answer is required' }}
            render={({ field: { onChange, value } }) => (
              <Form.Control onChange={onChange} value={value} disabled={isRecording} as='textarea' className='w-50 d-inline-block' />
            )}
          />
          {errors.answer && <p className='text-danger mt-2'>{errors.answer.message}</p>}

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
        </Form>
      ) : (
        <Button onClick={() => setCurrentIndex(0)}>Reset</Button>
      )}
    </div>
  )
}

export default Question
