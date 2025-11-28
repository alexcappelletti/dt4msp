import { describe, it, expect } from 'vitest';
import { setup, $fetch } from '@nuxt/test-utils';
import type {Geostory} from '../../app/models/geostory'




await setup({
	server: true,
	browser: false,
})



describe("Test on geostory api provider", async ()=>{
	it.skipIf(!process.env.REDIS_URL)("should get a sample geostory", async()=>{
		const response: Response = await $fetch('/api/storage/geostory-provider');
		expect(response.status).toBe('success');



	})






})