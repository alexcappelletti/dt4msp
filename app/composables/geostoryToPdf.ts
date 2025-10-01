import type { Geostory } from "@/models/geostory"

export const useGeostoryPdf = () => {
	const generatePdf = async (geostory: Geostory) => {
		const res = await fetch('/api/generate-pdf', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: geostory.toJson()
		})

		const blob = await res.blob()
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'downloaded-geostory.pdf'
		link.click()
	}
	const printGeostory = async (g:Geostory) => {
		console.log(g.toJson())
		const body = g.toJson()
		const res = await fetch('/api/geostories', {
			method: 'POST',
			//headers: { 'Content-Type': 'application/json' },
			body: body
		})
		console.log("print done!")
	}
	return { 
		generatePdf, 
		printGeostory
	 }
}

