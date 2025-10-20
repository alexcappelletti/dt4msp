type CommandPayload = {
	command: string
	params: string[]
	path?: string
}

type CommandHandler = (params: string[], path?: string) => string

const commandMap: Record<string, CommandHandler> = {
	list: ([text]) => text,
	text: ([text]) => text.toUpperCase(),
	layers: ([text, times]) => text.repeat(Number(times || '1')),
	pathEcho: ([text], path) => `${path}: ${text}`,
	// aggiungi altri comandi qui
}


function executeCommandBlock(block: string): string {
	try {
		const payload = JSON.parse(block) as CommandPayload
		const handler = commandMap[payload.command]
		return handler ? handler(payload.params, payload.path) : `[Unknown command: ${payload.command}]`
	} catch (err) {
		return `[Invalid command block]`
	}
}



export function parseTextWithCommands(input: string): string {
	return input.replace(/\{([^}]+)\}/g, (_, raw) => executeCommandBlock(`{${raw}}`))
}
