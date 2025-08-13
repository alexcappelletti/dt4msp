import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import WmsMapView from '@/views/WmsMapView.vue'
import IFrameMapView from '@/views/IFrameMapView.vue'
import MapLibreView from '@/views/MaplibreView.vue'
import WFSMapView from '@/views/WFSMapView.vue'
import RemoteLayerView from '@/views/RemoteLayerView.vue'
import StoryView from '@/views/StoryView.vue'
const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: RemoteLayerView },

		{path: '/wms-map', name: 'wms-map', component: WmsMapView},
		{ path: '/iframe-map', name: 'iframe-map', component: IFrameMapView },
		{ path: '/maplibre-map', name: 'maplibre-map', component: MapLibreView },
			// this generates a separate chunk (WmsMapView.[hash].js) for this rout},
		{ path: '/wfs-map', name: 'wfs-map', component: WFSMapView },
		{ path: '/story', name: 'view-story', component: StoryView },
		// {
		// 	path: '/about',
		// 	name: 'about',
		// 	// route level code-splitting
		// 	// this generates a separate chunk (About.[hash].js) for this route
		// 	// which is lazy-loaded when the route is visited.
		// 	component: () => import('../views/AboutView.vue'),
		// },
	],
})

export default router
