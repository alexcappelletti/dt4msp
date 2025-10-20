import { describe, test, expect, it } from "vitest";
import { parseTextWithCommands } from "/app/models/commandPayload";
import { Geostory, StoryElement, StoryItem } from "@/models/geostory";



describe("Command Parser", () => {
	const now = new Date();
	test("should parse a simple command", () => {
		
		expect(parseTextWithCommands("Hello {\"command\":\"text\",\"params\":[\"world\"]}")).toBe("Hello WORLD");
	});

	test("should handle unknown command", () => {
		expect(parseTextWithCommands("Hello {\"command\":\"unknown\",\"params\":[\"world\"]}")).toBe("Hello [Unknown command: unknown]");
	});
	test("should handle invalid JSON", () => {
		expect(parseTextWithCommands("Hello {invalid json}")).toBe("Hello [Invalid command block]");
	});

	test("should parse multiple commands", () => {
		expect(parseTextWithCommands("Start {\"command\":\"text\",\"params\":[\"first\"]} and {\"command\":\"layers\",\"params\":[\"ha\",\"3\"]} end"))
			.toBe("Start FIRST and hahaha end");
	});

});
// parseTextWithCommands("Intro {\"command\":\"say\",\"params\":[\"Benvenuto\"]}")
// // → "Intro Benvenuto"

// parseTextWithCommands("Titolo: {\"command\":\"upper\",\"params\":[\"ciao\"]}")
// // → "Titolo: CIAO"

// parseTextWithCommands("Echo: {\"command\":\"repeat\",\"params\":[\"ha\",\"3\"]}")
// // → "Echo: hahaha"

// parseTextWithCommands("Path: {\"command\":\"pathEcho\",\"params\":[\"ciao\"],\"path\":\"/home\"}")
// // → "Path: /home: ciao"
