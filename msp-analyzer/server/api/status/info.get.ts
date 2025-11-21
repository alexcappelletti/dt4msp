
export default defineEventHandler(async (event) => {
	const storage = useStorage();
	const keys = await storage.getKeys()
	const storageKey = 'root:public:fixtures:scenario_bd-v0_02.json';
	keys.forEach((key) => {
		console.log('Storage key available:', key);
		if (key === storageKey) {
			const value =storage.getItem(key);
			console.log('Storage value found: ', value);
		}
		console.log('Storage key available: ', key);
	})
	return {message: 'Controlla il log del server per le chiavi di storage.', storageKeys: keys,  foundKey: keys.includes(storageKey)};

})