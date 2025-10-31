<template>
	<div class="tw:flex tw:items-center tw:text-ux5 tw:bg-linear-to-b tw:from-ux1">
		<!-- <Icon name="uil:github" style="color: black" class="text-3xl" /> -->
		<v-icon icon="mdi-information" size="large"></v-icon>
		<h1 class="tw:font-roboto tw:text-3xl">Geo Story viewer</h1>
		<!-- <nav class="ml-auto flex gap-4 font-roboto text-2xl">
			<NuxtLink active-class="router-link-exact-active" to="/" >Home</NuxtLink>
			<NuxtLink active-class="router-link-exact-active" to="/geostory">Horz</NuxtLink>
			<NuxtLink active-class="router-link-exact-active" to="/geostory-info-page" >Info</NuxtLink>
			<NuxtLink active-class="router-link-exact-active" to="/geostory-page" >Vert</NuxtLink>
			
		</nav> -->
	</div>
</template>

<script setup lang="ts">
// Nessuna logica per ora, ma puoi aggiungere reactive state o props
</script>

<style lang="scss">
.header {
	// justify-content: space-between;
	// align-items: center;
	padding: 1rem 1.2rem;
	background-color: var(--color-ux3);
	
}
.router-link-exact-active {
	text-decoration: underline;
  	color: var(--color-ux5); // oppure un colore evidenziato
	transition: color 0.2s ease;
	&:hover {
		color: var(--color-ux1); // colore alternativo per hover
    	//text-decoration: underline;
  	}
}

nav a {
	margin-left: 1rem;
	color: white;
	text-decoration: none;
}

nav a:hover {
	text-decoration: underline;
}
</style>