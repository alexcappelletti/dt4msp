export interface ThumbnailOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	backgroundColor?: string;
	outputMimeType?: string;
}

export async function createThumbnail(
	dataUrl: string,
	options?: ThumbnailOptions,
): Promise<string | null> {
	const {
		maxWidth = 640,
		maxHeight = 360,
		quality = 0.72,
		backgroundColor = "#ffffff",
		outputMimeType = "image/jpeg",
	} = options ?? {};

	return await new Promise((resolve) => {
		const image = new Image();

		image.onload = () => {
			const scale = Math.min(
				maxWidth / image.width,
				maxHeight / image.height,
				1,
			);
			const targetWidth = Math.max(1, Math.round(image.width * scale));
			const targetHeight = Math.max(1, Math.round(image.height * scale));
			const canvas = document.createElement("canvas");
			canvas.width = targetWidth;
			canvas.height = targetHeight;

			const context = canvas.getContext("2d");
			if (!context) {
				resolve(null);
				return;
			}

			context.fillStyle = backgroundColor;
			context.fillRect(0, 0, targetWidth, targetHeight);
			context.drawImage(image, 0, 0, targetWidth, targetHeight);

			try {
				resolve(canvas.toDataURL(outputMimeType, quality));
			} catch {
				resolve(null);
			}
		};

		image.onerror = () => resolve(null);
		image.src = dataUrl;
	});
}
