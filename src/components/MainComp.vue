<template>
  <div class="main-comp">
    <h1>Live Transcription</h1>
    <p>{{ transcription }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const ASSEMBLYAI_WS_URL = 'wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000';

const apiKey = '079b32fb59c74406a051250ea6c1444d';

const transcription = ref('');

const runLiveTranscription = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    if (!stream) {
      console.error('No audio stream available.');
      return;
    }

    const socket = new WebSocket(`${ASSEMBLYAI_WS_URL}&access_token=${apiKey}`);

    socket.onopen = () => {
      console.log('WebSocket connection opened.');

      const audioContext = new AudioContext();
      const microphone = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);

      microphone.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (event) => {
        const audioData = event.inputBuffer.getChannelData(0);
        socket.send(JSON.stringify({ audio_data: audioData }));
      };

      socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        if (data && data.text) {
          transcription.value = data.text;
          console.log('Transcript:', data.text);
        }
      };
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    socket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

  } catch (error) {
    console.error('Error accessing microphone or initializing AssemblyAI:', error);
  }
};

onMounted(() => {
  runLiveTranscription();
});
</script>

<style scoped>
.main-comp {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2em;
  margin-bottom: 20px;
}

p {
  font-size: 1.5em;
  color: #333;
}
</style>
