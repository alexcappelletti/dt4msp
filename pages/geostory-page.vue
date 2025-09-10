<template>
  <div v-for="element in geostory?.elements" :key="element.id" class="geostory-block">
    <div class="geostory-header">
      <div class="title">{{ element.storyItems[0]?.title }}</div>
      <div class="text-column" v-if="element.storyItems[0]?.text">
        <div v-for="(line, index) in renderTexts(element.storyItems[0].text)" :key="index" class="text-line">
          {{ line }}
        </div>
      </div>
    </div>
  </div>
</template>



<script lang="ts" setup>
import { ref } from 'vue'
import { Geostory } from '@/models/geostory'
import { useGeostoryStore } from '@/stores/geostoryStore'
import Handlebars from 'handlebars'

const geostory = useGeostoryStore().selectedStory
const scenario = useGeostoryStore().scenario

const renderTexts = (t: string): Array<string> => {
	console.log(t)

	const compile = Handlebars.compile(t)
	return compile(scenario).split('\n')
	//return ["A", "B"]
}

</script>

<style scoped lang="scss">

.geostory-header {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 12px 24px;
  background-color: #f0f0f0;
  border-radius: 6px;

}

/* Titolo a sinistra */
.title {
	flex:0 0 10%;
	font-weight: bold;
	font-size: 18px;
	color: #333;
	width: 35%;
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
}

/* Testo a destra, in colonna, con larghezza ridotta */
.text-column {
	flex: 0 0 45%;
  	display: flex;
  	flex-direction: column;
  	align-items: flex-start;
  	width: 45%; /* meno ampia rispetto a prima */
  	padding-left: 16px; /* spazio interno a sinistra */
  	padding-right: 16px; /* spazio interno a destra */
  	box-sizing: border-box;
}

.text-line {
  font-size: 16px;
  color: #666;
  margin-bottom: 6px;
}
</style>
