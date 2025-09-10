<template>
	<header class="header">
		<h1>📰 Geo Story viewer </h1>
		<nav>
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
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1rem 2rem;
	background-color: $color-primary;
	color: white
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