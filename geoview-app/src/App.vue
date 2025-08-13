<template>
      <nav>
        <!-- <router-link to="/"></router-link> -->
        <router-link to="/wms-map">WMS [leaflet] </router-link>|
        <router-link to="/iframe-map">Map@localhost [iframe+geonode]</router-link> |
        <router-link to="/maplibre-map">WFS @localhost[geoserver + maplibre] ?!?!</router-link> |
        <router-link to="/wfs-map">Trento buildings wfs [geoserver + leaflet]</router-link> |
        <!-- <router-link to="/remote-layer">Remote Layer</router-link> | -->
        <router-link to="/story">Story</router-link>
      </nav>
     <router-view />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
import MapComponent from './components/MapComponent.vue';

</script>


<style scoped>
/* header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
} */
</style>
