<template>
  <div class="scenario-details">
    <h1>{{ scenario.name }}</h1>
    <p><strong>ID:</strong> {{ scenario.id }}</p>
    <p><strong>Descrizione generale:</strong> {{ scenario.generalDescription }}</p>
    <p><strong>Narrativa:</strong> {{ scenario.narrative }}</p>
    <p><strong>Periodo temporale:</strong> {{ scenario.temporalScope }}</p>
    <p><strong>Obiettivi:</strong> {{ scenario.objectives }}</p>
    <p><strong>Aspetti estesi:</strong> {{ scenario.extendedAspects }}</p>

    <section>
      <h2>🗺️ Mappe</h2>
      <ul>
        <li v-for="map in scenario.maps" :key="map">{{ map }}</li>
      </ul>
    </section>

    <section>
      <h2>📊 Dataset</h2>
      <ul>
        <li v-for="dataset in scenario.datasets" :key="dataset">{{ dataset }}</li>
      </ul>
    </section>

    <section>
      <h2>🎯 Temi disponibili</h2>
      <div v-for="theme in scenario.temi" :key="theme.nome" class="theme-block">
        <h3>{{ theme.theme_id }} ({{ theme.type }})</h3>
        <p>{{ theme.description }}</p>

        <h4>🌐 Risorse geospaziali</h4>
        <ul>
          <li v-for="layer in theme.geospatialResources" :key="layer.id">
            {{ layer.name }} - {{ layer.type }}
          </li>
        </ul>

        <h4>⚡ Impatti</h4>
        <div v-for="impact in theme.impacts" :key="impact.impactID" class="impact-block">
          <p><strong>{{ impact.nome }}</strong> ({{ impact.impactID }})</p>
          <p><em>Su tema:</em> {{ impact.impactOnTheme }}</p>
          <p>{{ impact.description }}</p>
          <ul>
            <li v-for="layer in impact.layers" :key="layer.id">
              Layer: {{ layer.name }} ({{ layer.type }})
            </li>
          </ul>
        </div>
      </div>
    </section>

    <section>
      <h2>📖 Geostorie definite</h2>
      <ul>
        <li v-for="geo in scenario.definedGeostories" :key="geo.id">
          {{ geo.title }}
        </li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { Scenario } from '@/models/scenario'
import { useGeostoryStore } from '@/stores/geostoryStore';

const store = useGeostoryStore()
const scenario = store.scenario as Scenario	
</script>

<style scoped>
.scenario-details {
  padding: 24px;
  font-family: Arial, sans-serif;
  line-height: 1.6;
}

section {
  margin-top: 24px;
}

.theme-block {
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f9f9f9;
  border-left: 4px solid #007acc;
}

.impact-block {
  margin-top: 8px;
  padding-left: 12px;
  border-left: 2px dashed #999;
}
</style>