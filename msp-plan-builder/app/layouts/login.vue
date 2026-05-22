<template>
	<v-app class="login-layout">
		<v-main class="login-main">
			<div class="login-slot">
				<slot />
			</div>
		</v-main>
	</v-app>
</template>

<style lang="scss" scoped>
.login-layout {
	min-height: 100vh;
	background-color: $main-rose-color !important;
}

.login-main {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 24px;
}

.login-slot {
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
