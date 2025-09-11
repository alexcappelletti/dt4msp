import { describe, it, expect, beforeAll } from 'vitest'
import {Eta} from 'Eta'
import {Scenario} from '../../gv-ssr-app/models/scenario'
import { readFileSync } from 'fs'
describe('Math test', () => {
  it('should add correctly', () => {
	expect(1 + 2).toBe(3)
  })
})



describe("sample on ETA", ()=>{

	const data = {
		scenarios:new Array<Scenario>()
	}
	beforeAll(()=>{
		const s = JSON.parse(
			readFileSync("./out/scenario.json", 'utf-8')) as Scenario
		if (s !== undefined) {data.scenarios.push(s)}


	})

	it("check data", ()=>{
		expect(data.scenarios.length).toBe(1)
		expect(data.scenarios[0].id).toBe("scenarioSoS_bd")


	})

	it("show usage od Eta lib", ()=>{
		const eta = new Eta()
		//const template = '<%= it.scenarios["scenarioSoS_bd"] %>' //.themes["BD_trasporto"].impacts["incremento"].description %>'
		const template = '<%= it.scenarios.length %>' //.themes["BD_trasporto"].impacts["incremento"].description %>'
		const expected = eta.renderString(template, {scenarios: data.scenarios})
		expect(expected).toBe("1")

		expect(
			eta.renderString('<%=it.scenarios[0].id%>', {scenarios: data.scenarios})
		).toBe("scenarioSoS_bd");

		expect(eta.renderString('<%=2+2/2%>', {})).toBe("3")


		expect(
			eta.renderString('<%=it.scenarios[0].temi["BD_sicurezza"].nome%>', {scenarios: data.scenarios})
		).toBe("Sicurezza e sorveglianza");

		expect(
			eta.renderString('<%=it.scenarios[0].temi["BD_trasporto"].impacts["Incremento del traffico marittimo"].description%>', {scenarios: data.scenarios})
		).toBe("Proiezioni di aumento della densità di traffico per diverse categorie di navi (CAR +30%, CON +53%, PAS +26%, TGC +38%, RRO +33%), basate su studi EMSA (2024) e letteratura di settore (EMSA-EEA 2021, Piano del Mare 2023, Report SRM 2022)");

		expect(
			eta.renderString('<%=it.scenarios[0].temi["BD_trasporto"].impacts["Incremento del traffico marittimo"].layers[0].name%>', {scenarios: data.scenarios})
		).toBe("routedensity_allavg");



	})





})