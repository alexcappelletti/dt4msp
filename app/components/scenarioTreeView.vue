<script setup lang="ts">
import { ref } from 'vue'
import type { Scenario, Theme, Impact, MapLayer } from '@/models/scenario'

defineProps<{ scenario: Scenario }>()

const isOpen = ref<Record<string, boolean>>({})
const toggle = (key: string) => {
  isOpen.value[key] = !isOpen.value[key]
}
</script>

<template>
  <div class="text-sm font-mono space-y-2 bg-fuchsia-400">
    <TreeNode label="Scenario" :children="[
      { label: 'id', value: scenario.id },
      { label: 'name', value: scenario.name },
      { label: 'generalDescription', value: scenario.generalDescription },
      { label: 'narrative', value: scenario.narrative },
      { label: 'temporalScope', value: scenario.temporalScope },
      { label: 'maps', value: scenario.maps },
      { label: 'datasets', value: scenario.datasets },
      { label: 'extendedAspects', value: scenario.extendedAspects },
      { label: 'objectives', value: scenario.objectives },
      {
        label: 'temi',
        children: Object.entries(scenario.temi).map(([key, theme]) => ({
          label: key,
          children: [
            { label: 'nome', value: theme.nome },
            { label: 'theme_id', value: theme.theme_id },
            { label: 'type', value: theme.type },
            { label: 'description', value: theme.description },
            {
              label: 'geospatialResources',
              children: theme.geospatialResources.map(layer => ({
                label: layer.name,
                children: Object.entries(layer).map(([k, v]) => ({
                  label: k,
                  value: v
                }))
              }))
            },
            {
              label: 'impacts',
              children: Object.entries(theme.impacts).map(([id, impact]) => ({
                label: id,
                children: [
                  { label: 'nome', value: impact.nome },
                  { label: 'impactID', value: impact.impactID },
                  { label: 'impactOnTheme', value: impact.impactOnTheme },
                  { label: 'description', value: impact.description },
                  {
                    label: 'layers',
                    children: impact.layers.map(layer => ({
                      label: layer.name,
                      children: Object.entries(layer).map(([k, v]) => ({
                        label: k,
                        value: v
                      }))
                    }))
                  }
                ]
              }))
            }
          ]
        }))
      },
      {
        label: 'definedGeostories',
        children: scenario.definedGeostories.map((g, i) => ({
          label: `Geostory ${i + 1}`,
          value: g // puoi espandere se hai struttura nota
        }))
      }
    ]" />
  </div>
</template>