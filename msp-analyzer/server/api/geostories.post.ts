// import { read, utils } from 'xlsx'
// import fs from 'fs'
// import path from 'path'
// import { fileURLToPath } from 'url'

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// import { GeostoryXlsxReader, ScenarioXlsxReader } from '@/models/xlsReaders'
import { Scenario } from '@/models/scenario';
import {
	Geostory,
	parseGeostoryFromJson,
	StoryElement,
	StoryItem,
} from '~/models/geostory';

export default defineEventHandler(async (event) => {
	const raw = await readBody(event);
	const elements = (raw.elements || []).map((el: any) => {
		const storyItems = (el.storyItems || []).map(
			(item: any) => new StoryItem(item),
		);
		return new StoryElement(
			el.order,
			el.sectionTitle,
			el.sectionID,
			el.id,
			el.style,
			el.tags,
			el.actions,
			storyItems,
		);
	});

	const story = new Geostory({
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
	console.log('numero elementi ' + story.elements.length);
	console.log('numero sezioni- ' + story.sections.size);
	return { story: story.toJson(), sections: story.sections.size };
});
