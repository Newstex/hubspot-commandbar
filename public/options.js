function save_options() {
	chrome.storage.sync.set({
		ALGOLIA_APP_ID: document.getElementById('app_id').value,
		ALGOLIA_API_KEY: document.getElementById('api_key').value,
		COMMANDBAR_ID: document.getElementById('commandbar_id').value,
	}, function () {
		console.log('Updated Preferences');
		history.back();
	});
}
document.getElementById('save').addEventListener('click', save_options);
