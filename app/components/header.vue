<template>
	<header class="header flex items-center gap-4 text-ux5">
		<!-- <Icon name="uil:github" style="color: black" class="text-3xl" /> -->
		<Icon name="gis:contour-map" size="64" class=" text-4xl" />
		<h1 class="font-roboto text-3xl">Geo Story viewer</h1>
		<nav class="ml-auto flex gap-4 font-roboto text-2xl">
		<NuxtLink to="/">Home</NuxtLink>
			<NuxtLink to="/geostory-info-page">Info</NuxtLink>
			<NuxtLink to="/geostory-page">Details</NuxtLink>
			<NuxtLink to="/geostory">Navigate</NuxtLink>
		</nav>
</header>
</template>

<script setup lang="ts">
// Nessuna logica per ora, ma puoi aggiungere reactive state o props
</script>

<style lang="scss">
.header {
	justify-content: space-between;
	align-items: center;
	padding: 1rem 2rem;
	background-color: var(--color-ux3);
	
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