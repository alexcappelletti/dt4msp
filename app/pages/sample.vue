<template>
  <!-- <div class="flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-br from-blue-600 to-indigo-700 text-white"> -->
	<div class="flex flex-col 
	items-center justify-center text-center px-6 py-24 
	bg-primary text-white text-8xl font-sans">
    <h1>Test degli stili</h1>
	</div>
	<p class="mt-4 text-lg">Questa è una pagina con colori corretti</p>
	<p class="text-sm/tight ">So I started to walk into the water...</p>
<p class="text-sm/10 ">So I started to walk into the water...</p>
	<p class="font-roboto text-9xl">esempio di roboto </p>
	<p class="font-sans text-9xl">esempio di sans</p>
<p class="font-sans text-4xl">No one shall be subjected to arbitrary arrest, detention or exile. Everyone is entitled in full equality to a fair and public hearing by an independent and impartial tribunal, in the determination of his rights and obligations and of any criminal charge against him. No one shall be subjected to arbitrary interference with his privacy, family, home or correspondence, nor to attacks upon his honour and reputation. Everyone has the right to the protection of the law against such interference or attacks.</p>
<p class="font-serif">The quick brown fox</p>
<p class="titolo-custom font-roboto"> Roboto</p>
<p class="titolo-custom font-dynapuff">font-dynapuff</p>
<p class="font-dynapuff">it is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like).</p>
<span class="text-5xl instyle-sb  ">The default theme variables are very general purpose and suitable for building dramatically different designs, but they are still just a starting point. It's very common to customize things like the color palette, fonts, and shadows to build exactly the design you have in mind.
</span>
  <div class="font-killos text-6xl bg-alex p-4">
    Tailwind v4 + SCSS side-by-side

  </div>

  <button
  	
	class="my-b">
caricamento
      </button>


</template>




<style lang="css" scoped>
@reference "@/assets/css/tailwind.css";

.my-b {
	@apply bg-ux2 py-3 font-roboto text-lg rounded-md text-ux5 hover:bg-ux1 disabled:bg-gray-300 disabled:cursor-not-allowed transition;

}

.titolo-custom {
  @apply text-5xl text-purple-300; 
}
.instyle-font {
	@apply text-4xl;
	font-family: var(--font-mio);
	
}
.instyle-sb {
	font-family: var(--font-family-scoreboard);
}
</style>