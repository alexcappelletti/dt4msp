<template>
  <div class="iframe-container">
    <iframe
      :src="iframeSrc"
      frameborder="0"
      style="width:100%; height:80vh;"
      allowfullscreen
    ></iframe>
  </div>
  <div class="description">
    <p>
      This is a map displayed using an iframe. Source is from GeoNode
    </p>
    </div>  
</template>

<script setup>
import { ref } from 'vue'

// Sostituisci con l'URL desiderato
const iframeSrc = ref('http://localhost/maps/6/embed#/')
</script>

<style lang="scss" scoped>
.iframe-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  iframe {
    border: none;
    width: 100%;
    height: 80vh;
  }
}
</style>