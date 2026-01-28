<script setup lang="ts">
import type { DomainEffect } from '#/shared/types/msp-project';

const props = defineProps<{
	domainEffects: DomainEffect[];
}>();
// Eventi emessi dal componente per gestire edit, delete e l'apertura del form per nuova misura
const emit = defineEmits(['delete:effect', 'edit:effect']);


</script>

<template>effects</template>