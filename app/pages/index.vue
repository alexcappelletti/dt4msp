<script setup lang="ts">
import LocalDataLoader from '@/components/LocalDataLoader.vue'
// const { data: posts } = await useAsyncData('posts', () =>
//   $fetch('https://api.example.com/posts')
// )
import landingPage from '@/components/landingPage.vue';
definePageMeta({
  layout: 'landing-layout'
});

</script>


<template>
  <landing-page />
  <!-- <LocalDataLoader /> -->
</template>


