/**
 * Content Script that runs in HubSpot
 */
(function () {
	chrome.storage.sync.get({
		ALGOLIA_APP_ID: '',
		ALGOLIA_API_KEY: '',
		COMMANDBAR_ID: '',
	}, (config) => {
		if (config?.COMMANDBAR_ID) {
			const s: any = document.createElement('script');
			s.src = chrome.runtime.getURL('commandbar.js');
			s.onload = function () {
				document.dispatchEvent(new CustomEvent('COMMANDBAR_CONFIG_Extension', {
					detail: config,
				}));
				this.remove();
			};
			(document.head || document.documentElement).appendChild(s);
		}
	});
})();
