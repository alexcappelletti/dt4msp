<script setup lang="ts">
import infos from '~/components/infos.vue';
definePageMeta({
  layout: 'main-layout',
});

</script>

<template>
	<v-container class="d-flex flex-column justify-center tw:gap-4">
		<infos></infos>


	  <!-- <h1 class="tw:text-6xl tw:bg-ux1 tw:font-bold tw:text-primary ">
            Benvenuto in Nuxt + Vuetify + Tailwind 4!
        </h1>
        <v-btn color="alex" class="mx-2">
            Un bottone Vuetify con un colore personalizzato
        </v-btn> -->
	</v-container>
</template>


