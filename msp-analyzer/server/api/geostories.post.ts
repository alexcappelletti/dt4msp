// import { read, utils } from 'xlsx'
// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// import { GeostoryXlsxReader, ScenarioXlsxReader } from '@/models/xlsReaders'
import{
	populateGeostory,
	populateStoryElement,
	populateStoryItem,
	type Geostory,
	type parseGeostoryFromJson,
	type StoryElement,
	type StoryItem,
} from '~/models/geostory';


export default defineEventHandler(async (event) => {
	const raw = await readBody(event);
	const elements = (raw.elements || []).map((el: any) => {
		const storyItems = (el.storyItems ?? []).map(
			(item: any) => populateStoryItem(item));
		return populateStoryElement({
			...el,
			storyItems: storyItems,
		});
	})
	

	const story = populateGeostory({
		id: raw.id,
		title: raw.title,
		topic: raw.topic,
		scenario: raw.scenario,
		language: raw.language,
		target: raw.target,
		exportType: raw.exportType,
		author: raw.author,
		timestamp: raw.timestamp ? new Date(raw.timestamp) : new Date(),
		elements: elements,
	});
	console.log('[server] numero elementi ' + story.elements.length);
	console.log('[server] numero sezioni- ' + story.sections.size);
	return { story: JSON.stringify(story), sections: story.sections.size };
});
