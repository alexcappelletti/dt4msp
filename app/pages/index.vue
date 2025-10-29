<script setup lang="ts">
definePageMeta({
  layout: false,
})

import ContentDetails from '~/components/contentDetails.vue';
//import ContentsBody from '~/components/contentsBody.vue';
import LoaderNav from '~/components/loaderNav.vue';
import infos from '~/components/infos.vue';
</script>

<template>
    <NuxtLayout name="main-layout">
      <template #navigation>
        <LoaderNav class="w-full h-full min-h-[100px] items-start" />
      </template>
      <template #body>
        <!-- <ContentDetails class="w-full min-h-[200px]  bg-gray-50" />  -->
        <!-- <ContentsBody class="w-full h-full min-h-[400px]  bg-gray-50" />  -->
         <infos/>
      </template>
    </NuxtLayout >
</template>


