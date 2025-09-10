import type { Geostory } from "@/models/geostory"

export const useGeostoryPdf = () => {
	const generatePdf = async (geostory: Geostory) => {
		const res = await fetch('/api/generate-pdf', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(geostory)
		})

		const blob = await res.blob()
		const url = URL.createObjectURL(blob)
		const link = document.createElement('a')
		link.href = url
		link.download = 'downloaded-geostory.pdf'
		link.click()
	}

	return { generatePdf }
}