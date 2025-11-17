import _ from 'lodash'

type CommandPayload = {
	command: string
	params: string[]
	path?: string
}

type CommandHandler = (params: string[], path: string) => string

function createCommandMap(context: Record<string, any>): Record<string, CommandHandler> {
	return {
		list: (params, path) => {
			const value = _.get(context, path)
			if (Array.isArray(value)) {
				return value.join(', ')
			}
			return value ?? 'N/A'
		},

		text: (params:string[], path:string) => {
			let raw = _.get(context, path, 'N/A')
			if (params.includes('bold')) {
			 	raw =  `<strong>${raw}</strong>`
			}
			return raw
		},
		//layers: ([text, times]) => text.repeat(Number(times || '1')),

		pathEcho: ([text], path) => `${path}: ${text}`,

		// aggiungi altri comandi qui
	}
}

function executeCommandBlock(block: string, context: Record<string, any>): string {
	try {
		const payload = JSON.parse(block) as CommandPayload
		
		const commandMap = createCommandMap(context)
		const handler = commandMap[payload.command]
		return handler ? handler(payload.params || [], payload.path || "") : `[Unknown command: ${payload.command}]`
	} catch (err) {
		console.log('Error parsing command block:', err)
		return `[Invalid command block]`
	}
}

export function parseTextWithCommands(context: Record<string, any>, input: string): string {
	return input.replace(/\{([^}]+)\}/g, (_, raw) => executeCommandBlock(`{${raw}}`, context))
}