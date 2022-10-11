/**
 * Content Script that runs in HubSpot
 */
import type { SearchClient } from 'algoliasearch/lite';
import algoliasearch from 'algoliasearch/lite';
import { init } from 'commandbar';

let searchClient: SearchClient;
let config: any = {};

function getItemDescription(item: any) {
	let resp = item.description || item.excerpt || '';
	if (item.content_status) {
		resp = `${item.content_status} ${resp}`;
	} else if (item.status) {
		resp = `${item.status} ${resp}`;
	}
	return resp;
}

function getItemName(item: any) {
	let name = item.name || item.headline;
	if (item.tags && item.tags[0]) {
		name = `[${item.tags[0]}] ${name}`;
	}
	return name;
}

async function searchContents(query: string) {
	const index = searchClient.initIndex('Content');
	const resp = await index.search(query);
	return resp.hits.map((hit: any) => ({
			...hit,
			category: 'Content',
			__heading: getItemDescription(hit),
			label: getItemName(hit),
			__extraHTML: hit._highlightResult?.newstex_id?.value || `${hit.newstex_id}`,
	}));
}

async function searchHubSpot(sectionName: string, query: string) {
	const { cookieStore, quickFetch } = <any>window;
	const csrf = await cookieStore.get('hubspotapi-csrf');
	const apiURL = new URL(quickFetch.getApiUrl('/search/v2/search'));
	apiURL.searchParams.append('query', query);
	apiURL.searchParams.append('portalId', quickFetch.getPortalId());
	apiURL.searchParams.append('locale', 'en');
	apiURL.searchParams.append('clienttimeout', '14000');
	apiURL.searchParams.append('hs_static_app', quickFetch._currentProject);
	apiURL.searchParams.append('hs_static_app_version', quickFetch._currentProjectVersion.replace('static-', ''));
	const resp = await fetch(apiURL.href, {
		headers: {
			accept: 'application/json, text/javascript, */*; q=0.01',
			'x-hubspot-csrf-hubspotapi': csrf.value,
		},
		method: 'GET',
		credentials: 'include',
		mode: 'cors',
	});
	const data = await resp.json();
	const output: any[] = [];
	for (const section of data.sections) {
		if (section.sectionName === sectionName) {
			for (const result of section.results) {
				output.push({
					...result,
					icon: result.properties.avatarUrl,
					category: result.resultType,
					__heading: result.properties.email || result.properties.domain,
					label: result.properties.name,
				});
			}
		}
	}
	return output;
}

function initCommandBar() {
	// Register search function to CommandBar
	window.CommandBar.addRecords('Contents', [], {
		onInputChange: searchContents,
	});
	// Search HubSpot records
	window.CommandBar.addRecords('Companies', [], {
		onInputChange: (query: string) => searchHubSpot('COMPANY', query),
	});
	window.CommandBar.addRecords('Contacts', [], {
		onInputChange: (query: string) => searchHubSpot('CONTACT', query),
	});
}

function bootCommandBar() {
	const userEmail: string = (<any>document.getElementsByClassName('user-info-email')?.[0])?.innerText;
	if (userEmail) {
		window.CommandBar.boot(userEmail).then(() => {
			console.log('Loaded CommandBar Script', userEmail);
			initCommandBar();
		});
	} else {
		setTimeout(bootCommandBar, 500);
	}
}

(function () {
	document.addEventListener('COMMANDBAR_CONFIG_Extension', (e) => {
		config = (<CustomEvent>e).detail;
		if (config.COMMANDBAR_ID) {
			init(config.COMMANDBAR_ID);
			setTimeout(bootCommandBar, 500);
		}
		if (config.ALGOLIA_APP_ID && config.ALGOLIA_API_KEY) {
			searchClient = algoliasearch(config.ALGOLIA_APP_ID, config.ALGOLIA_API_KEY);
		}
	});
})();
