<template>
    <div class="min-h-screen bg-white text-primary">
        <!-- Hero Section -->
        <section
            class="flex flex-col items-center justify-center text-center px-6 py-24 bg-gradient-to-br from-primary to-gray-700 text-white">
            <h1 class="text-4xl md:text-6xl font-bold mb-6">Geostory viewer</h1>
            <p class="text-lg md:text-xl mb-8 max-w-2xl">Una piattaforma potente per raccontare storie geospaziali.</p>
            <NuxtLink to="load-content"
                class="bg-white text-primary font-semibold px-6 py-3 rounded-full shadow hover:bg-blue-100 transition">
                Inizia ora
            </NuxtLink>
        </section>

        <!-- Features -->
        <section id="features" class="px-6 py-20 max-w-6xl mx-auto">
            <h2 class="text-3xl font-bold text-center mb-12">What is</h2>
            <div class="grid md:grid-cols-3 gap-8">
                <div class="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
                    <h3 class="text-xl font-semibold mb-2">Mappe Interattive</h3>
                    <p>Visualizza dati geospaziali con mappe dinamiche e personalizzabili.</p>
                </div>
                <div class="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
                    <h3 class="text-xl font-semibold mb-2">Storytelling Visivo</h3>
                    <p>Combina immagini, testo e dati per rappresentare narrazioni coinvolgenti.</p>
                </div>
                <div class="p-6 bg-gray-50 rounded-lg shadow hover:shadow-md transition">
                    <h3 class="text-xl font-semibold mb-2">Analisi Avanzata</h3>
                    <p>Esplora dettagli grazie a strumenti di analisi geospaziale.</p>
                </div>
            </div>
        </section>

        <!-- Call to Action -->
        <section class="px-6 py-20 bg-primary-50 text-center">
            <h2 class="text-3xl font-bold mb-6">Sign in or Register </h2>
            <NuxtLink to="/login"
                class="bg-primary-500 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
               Sign in
            </NuxtLink>
        </section>
    </div>
</template>