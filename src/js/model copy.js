import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js'
//import { getJSON, sendJSON } from './helpers.js'
import { AJAX } from './helpers.js'

export const state = {
	recipe: {},
	search: {
		query: '',
		results: [],
		page: 1,
		resultsPerpage: RES_PER_PAGE,
		
	},
	bookmarks: []
};

export const loadRecipe = async function (id) {
	try {
		console.log("rfs1 const model.loadRecipe = async function (id) ")
		console.log(`rfs1: ${API_URL}${id}`)
		const data = await getJSON(`${API_URL}${id}`)

		const {recipe} = data.data;
		state.recipe = {
		id: recipe.id,
		title: recipe.title,
		publisher: recipe.publisher,
		sourceUrl: recipe.source_url,
		image: recipe.image_url,
		servings: recipe.servings,
		cookingTime: recipe.cooking_time,
		ingredients: recipe.ingredients
		}
		console.log('recipe-->', state.recipe)

		if (state.bookmarks.some(bookmark => bookmark.id === id)) {
			state.recipe.bookmarked = true;			
		} else {
			state.recipe.bookmarked = false;			
		}
	} catch (err) {
		// temp error handling
		console.error(`model.js.loadRecipe-->${err} 💥💥💥💥`);
		throw err;
	}
}

export const loadSearchResults = async function (query) {
	try {
		state.search.query = query;
		console.log("rfs2 const loadSearchResults = async function (query) ")
		const data = await getJSON(`${API_URL}?search=${query}`)
		//
		console.log('loadSearchResults-->', data)

		state.search.results = data.data.recipes.map(rec => {
			return {id: rec.id,
			title: rec.title,
			publisher: rec.publisher,
			image: rec.image_url}
		})
		//console.log('state.search.results-->', state.search.results)
		state.search.page = 1;
	} catch (err) {
		console.error(`model.js.loadRecipe-->${err} 💥💥💥💥`);
		throw err;
	}
}

export const getSearchResultsPage = function(page = state.search.page) {
	state.search.page = page;
	const start = (page - 1)  * state.search.resultsPerpage; 
	const end = page * state.search.resultsPerpage; 

	return state.search.results.slice(start, end);
}

export const updateServings = function (newServings) {
	state.recipe.ingredients.forEach(ing => {		
		ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
	});

	state.recipe.servings = newServings;	 
}

const persistBookmarks = function () {
	localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmarks = function (recipe) {
	// add <bookmk
	state.bookmarks.push(recipe);

	// mark current recipt as bookmark
	if (recipe.id === state.recipe.id) state.recipe.bookmarked = true; //settnig new property

	persistBookmarks();
}

export const deleteBookmark = function (id) {
	// Delete bookmakr
	const index = state.bookmarks.findIndex((el)=>el.id === id)
	state.bookmarks.splice(index, 1)
	// If mark current receipt as NOT bookmarked
	if (id === state.recipe.id) state.recipe.bookmarked = false; //settnig new property

	persistBookmarks();
}

const init = function() {
	const storage = localStorage.getItem('bookmarks');
	if (storage) {
		state.bookmarks = JSON.parse(storage)
	}
}

init()
console.log("state.bookmark", state.bookmarks)

const clearBookmarks = function () {
	localStorage.clear('bookmarks');
}

//clearBookmarks()

export const uploadRecipe = async function(newRecipe) {
	try {
		const ingredients = Object.entries(newRecipe)
			.filter(entry =>entry[0].startsWith('ingredient') && entry[1] != '')
			.map(ing=> {
				const ingArr = ing[1].replaceAll(' ', '').split(',');
				if (ingArr.length !== 3) {
					throw new Error('Wrong ingredient fromat! Please use the correct format:')
				}
				const [quantity, unit, description] = ing[1].replaceAll(' ','').split(',');
				return {quantity: quantity ? +quantity : null, unit, description}
			});	

			const recipe = {
				title: newRecipe.title,
				source_url: newRecipe.sourceUrl,
				image_url : newRecipe.image,
				publisher: newRecipe.publisher,
				cooking_time : +newRecipe.cookingTime,
				servings: +newRecipe.servings,
				ingredients
			}
			const data = await sendJSON(`${API_URL}?key=${KEY}`, recipe)
			console.log('model.uploadRecipe data-->', data)
	} catch (err) {
		throw err;
	}
}

