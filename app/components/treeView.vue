<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  label?: string
  data: Record<string, any>
}>()

const isOpen = ref<Record<string, boolean>>({})

const toggle = (key: string) => {
  isOpen.value[key] = !isOpen.value[key]
}

const isObject = (val: any) =>
  val && typeof val === 'object' && !Array.isArray(val)
</script>

<template>
  <div class="ml-4 text-sm font-mono">
    <div v-if="label" class="font-bold mb-1">{{ label }}</div>

    <div v-for="(value, key) in data" :key="key" class="mb-1">
      <div v-if="isObject(value)">
        <button
          class="text-blue-700 hover:underline"
          @click="toggle(key)"
        >
          ▶ {{ key }}
        </button>
        <div v-if="isOpen[key]" class="ml-4 border-l pl-2">
          <TreeView :data="value" />
        </div>
      </div>

      <div v-else>
        <span class="text-gray-700">{{ key }}:</span>
        <span class="text-black">{{ value }}</span>
      </div>
    </div>
  </div>
</template>