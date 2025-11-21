import { describe, it, expect } from 'vitest'
import { StoryItem } from '@/models/geostory'
import { ChangeEvent } from '@/models/changeEvent'
import type { Visual } from '@/models/visual'

describe('StoryItem class', () => {
	const mockVisual: Visual = {
		type: 'image',
		url: 'https://example.com/image.png',
		alt: 'Example image'
	}

	const baseProps = {
		id: 'story-001',
		text: 'C’era una volta...',
		title: 'Fiaba di prova',
		author: 'alex',
		visual: mockVisual,
		structure: 'linear',
		tags: [],
		comments: 'sample comment',
		mapActions: []
	}

	it('should initialize with required fields', () => {
		const item = new StoryItem(baseProps)

		expect(item.id).toBe(baseProps.id)
		expect(item.text).toBe(baseProps.text)
		expect(item.title).toBe(baseProps.title)
		expect(item.author).toBe(baseProps.author)
		expect(item.visual).toEqual(mockVisual)
		expect(item.structure).toBe('linear')
		expect(item.comments).toBe(baseProps.comments)
		expect(item.tags).toEqual([])
		expect(item.mapActions).toEqual([])
		expect(item.timestamp).toBeInstanceOf(Date)
	})

	it('should create initial ChangeEvent on construction', () => {
		const item = new StoryItem(baseProps)

		expect(item.changes.length).toBe(1)
		const change = item.changes[0]
		expect(change).toBeInstanceOf(ChangeEvent)
		expect(change.what).toBe('construct')
		expect(change.newValue).toBe(baseProps.text)
		expect(change.changedBy).toBe(baseProps.author)
	})


})