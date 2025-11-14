import { describe, test, expect} from "vitest";
import { parseTextWithCommands } from "../../app/models/commandPayload"
import { Geostory, StoryElement, StoryItem } from "../../app/models/geostory";

describe.skip("Command Parser", () => {
	const now = new Date();
	const context = {
		scenarioSoS_bd: {
			narrativa: "obiettivi di conservazione e azioni per fvorire sviluppo sostenibile di economa blu (focus settori innovativi, utilizzo di NBS, teconologie per diminuire impatti antropici)",
			orizzonte_temporale: "2040 - probabile orizzonte di più lungo periodo (causa settori trasporto marittimo, pesca, soluzioni/tecnologie adottate)",
			general_description: "Economia blu sostenibile basata su soluzioni innovative/tecnologie verdi",
			id: "scenarioSoS_bd",
			name: "Blue Development",
			timestamp: now.toISOString(),
			temi: [
				"Energia",
				"Trasporto Marittimo",
				"Protezione ambientale",
				"Pesca",
				"Acquacoltura",
				"Difesa costiera",
				"Turismo Costiero",
				"Marittimo",
				"Ricerca",
				"Innovazione",
				"Paesaggio e patrimonio culturale",
				"Sicurezza e sorveglianza",
				"Energia - Oil&Gas"
			]
		}
	};

	test("should TEXT command", () => {
		expect(
			parseTextWithCommands(
				context,
				"Narrativa e orizzonte temporale di riferimento: {\"command\": \"text\", \"path\": \"scenarioSoS_bd.narrativa\"} {\"command\": \"text\", \"path\": \"scenarioSoS_bd.orizzonte_temporale\"}"))
			.toBe("Narrativa e orizzonte temporale di riferimento: obiettivi di conservazione e azioni per fvorire sviluppo sostenibile di economa blu (focus settori innovativi, utilizzo di NBS, teconologie per diminuire impatti antropici) 2040 - probabile orizzonte di più lungo periodo (causa settori trasporto marittimo, pesca, soluzioni/tecnologie adottate)");
	});

	test("should Text command with params ", () => {
		expect(
			parseTextWithCommands(
				context,
				"Scenario 3: Blue Development (BD): {\"command\":\"text\", \"path\": \"scenarioSoS_bd.general_description\", \"params\":[\"bold\"]}"))
			.toBe("Scenario 3: Blue Development (BD): Economia blu sostenibile basata su soluzioni innovative/tecnologie verdi");
	});

	test("should LIST command ", () => {
		expect(
			parseTextWithCommands(
				context,
				"{\"command\":\"list\", \"path\": \"scenarioSoS_bd.temi\", \"params\":[\"bold\"]}"))
			.toBe("Energia Trasporto Marittimo, Protezione ambientale, Pesca, Acquacoltura, Difesa costiera, Turismo Costiero, Marittimo, Ricerca, Innovazione, Paesaggio e patrimonio culturale, Sicurezza e sorveglianza, Energia - Oil&Gas");
	});

});