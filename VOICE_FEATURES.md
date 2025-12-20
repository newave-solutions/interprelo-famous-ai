# Voice Analysis Features

## Overview

The Vocal Dashboard now includes real-time voice analysis using the Web Audio API and Speech Recognition API. This provides actual microphone input analysis with live feedback during practice sessions.

## Features

### 1. Real-Time Audio Analysis

- **Pitch Detection**: Analyzes the dominant frequency of your voice (80-300 Hz range for human speech)
- **Volume Monitoring**: Tracks audio levels in real-time using RMS (Root Mean Square) calculation
- **Live Waveform**: Displays actual audio waveform from microphone input

### 2. Speech Recognition

- **Words Per Minute (WPM)**: Calculates speaking pace using browser's Speech Recognition API
- **Transcript**: Captures what you're saying (available in the analysis data)
- **Optimal Range**: Target 120-160 WPM for clear professional interpretation

### 3. Audio Recording & Playback

- **Session Recording**: Records entire practice session as audio file
- **Playback**: Review your recording immediately after stopping
- **Download**: Save recordings as WebM audio files for later review

### 4. Visual Feedback

#### Pitch Meter

- **Target Range**: 35-65 (on 0-100 scale)
- **Color Coding**:
  - Green: Within optimal range
  - Red: Too high or too low
- **Real-time Updates**: ~30 times per second

#### Pace (WPM) Meter

- **Display**: Shows actual words per minute
- **Target Range**: 120-160 WPM
- **Feedback**: "Speak faster" / "Slow down" / "Perfect pace!"

#### Volume Meter

- **Target Range**: 30-70 (0-100 scale)
- **Real-time**: Tracks audio levels continuously
- **Visual Indicator**: Slider shows current volume

### 5. Overall Score

- Calculated from pitch, pace, and volume metrics
- Updates continuously during recording
- Scale: 0-100
  - 80+: Excellent
  - 60-79: Good Progress
  - <60: Keep Practicing

## Browser Compatibility

### Required Browser Features

1. **Web Audio API**: Supported in all modern browsers
2. **MediaDevices.getUserMedia**: For microphone access
3. **MediaRecorder API**: For recording functionality
4. **Speech Recognition API**:
   - ✅ Chrome/Edge (fully supported)
   - ⚠️ Safari (limited support)
   - ❌ Firefox (not supported - will fallback to non-speech features)

### Permissions Required

- **Microphone Access**: User must grant permission when prompted
- Browser will remember permission for subsequent visits

## Usage Instructions

### Starting a Practice Session

1. Click **"Start Recording"** button
2. Grant microphone permission when prompted
3. Wait for initialization (1-2 seconds)
4. Begin speaking naturally

### During Practice

- **Monitor Meters**: Watch pitch, pace, and volume indicators
- **Stay in Green Zones**: Keep meters within target ranges
- **Check WPM**: Aim for 120-160 words per minute
- **View Waveform**: Confirm audio is being captured

### Controls

- **Pause/Resume**: Pause recording without stopping (maintains session data)
- **Stop**: End recording and enable playback
- **Reset**: Clear all data and start fresh
- **Play**: Listen to your recorded session
- **Download**: Save recording to your device

## Technical Details

### Audio Analysis

```typescript
interface AudioAnalysisData {
  pitch: number;      // 0-100 scale (normalized from Hz)
  volume: number;     // 0-100 scale (RMS volume)
  frequency: number;  // Raw frequency in Hz
  clarity: number;    // Signal strength (0-100)
}
```

### Speech Analysis

```typescript
interface SpeechAnalysisData {
  wordsPerMinute: number;  // Current WPM
  totalWords: number;      // Total words spoken
  transcript: string;      // What was said
}
```

### Audio Processing Pipeline

1. **Input**: Microphone → MediaStream
2. **Analysis**: AudioContext → AnalyserNode → Frequency/Time Domain Data
3. **Processing**: FFT analysis for pitch, RMS for volume
4. **Recognition**: SpeechRecognition API for transcription
5. **Recording**: MediaRecorder → Blob (WebM format)
6. **Output**: Real-time feedback + downloadable audio

## Troubleshooting

### Microphone Not Working

- **Check Permissions**: Browser must have microphone access
- **Check Device**: Ensure microphone is connected and working
- **Check Browser**: Use Chrome/Edge for best compatibility

### Speech Recognition Not Working

- **Firefox Users**: Speech recognition not supported, but pitch/volume still work
- **Safari Users**: May have limited functionality
- **Check Language**: Currently set to 'en-US'

### Poor Pitch Detection

- **Speak Clearly**: Enunciate for better frequency analysis
- **Reduce Background Noise**: Use in quiet environment
- **Check Microphone**: Ensure good quality microphone

### WPM Shows 0

- **Keep Speaking**: Needs continuous speech to calculate
- **Wait for Recognition**: May take a few seconds to start
- **Check Browser**: Verify Speech Recognition API support

## Performance Notes

- **CPU Usage**: Moderate (real-time audio analysis)
- **Memory**: ~10-20MB for audio buffers
- **Recording Size**: ~1MB per minute of audio (WebM)
- **Latency**: <50ms for visual feedback

## Privacy

- **No Server Upload**: All processing happens in the browser
- **Local Only**: Recordings stay on your device unless you upload them
- **No Storage**: Audio data deleted when you close/refresh the page

## Future Enhancements

Potential additions:

- Tone emotion detection (happy, sad, angry, neutral)
- Accent analysis and feedback
- Pronunciation scoring
- Export practice session reports
- Historical tracking of improvement
- AI-powered coaching suggestions

## Code Structure

```
src/
  lib/
    audioAnalysis.ts          # Core audio processing logic
  components/
    sections/
      VocalDashboard.tsx      # Main dashboard component
    ui/
      VocalMeter.tsx          # Individual meter display
      WaveformVisualizer.tsx  # Live waveform display
```

## API Reference

### AudioAnalyzer Class

```typescript
const analyzer = new AudioAnalyzer();
await analyzer.initialize();
analyzer.startAnalysis((data) => {
  console.log(data.pitch, data.volume);
});
analyzer.stopAnalysis();
analyzer.cleanup();
```

### AudioRecorder Class

```typescript
const recorder = new AudioRecorder();
await recorder.startRecording(stream);
const blob = await recorder.stopRecording();
// Use blob for playback or download
```
