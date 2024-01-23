import * as model from './model.js';
import { MODAL_ClOSE_SEC } from './config.js';
import receipeView from './views/receipeView.js';
import searchView from './views/searchView.js'
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js'
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addReipeView.js'

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { async } from 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    
    const id = window.location.hash.slice(1);

    if (!id) {return}
    console.log("rfs controller.js id" + id)
    receipeView.renderSpinner()

    //0. Update results view to mark selected search result
    resultsView.update(model.getSearchResultsPage()) 

    //1. Updating bookmarks view    
    bookmarksView.update(model.state.bookmarks);

    //2. Loading recipe
    await model.loadRecipe(id);

    //3. Rending recipe
    receipeView.render(model.state.recipe) 

  } catch (err) {
   //receipeView.renderError(`${err}  💥💥💥💥`);
    receipeView.renderError();
    console.error(err)
  }

  
}

const controlSearchResult = async function() {
  try {
    resultsView.renderSpinner();
    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    //2) Load search results
    await model.loadSearchResults(query)
    //3) render results
    //resultsView.render(model.state.search.results)   
    resultsView.render(model.getSearchResultsPage())

    //4) Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (gotoPage) {
    //3) render new results
    resultsView.render(model.getSearchResultsPage(gotoPage))

    //4) Rendern ew pagination buttons
    paginationView.render(model.state.search);
  }

const controlServings = function (newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);

  // Update the recipe view
  //receipeView.render(model.state.recipe) 
  receipeView.update(model.state.recipe) 
}

const controlAddBookmarks = function () {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) {
    model.addBookmarks(model.state.recipe);
  }
  else {
    model.deleteBookmark(model.state.recipe.id);
  } 
  
  // 2) Update recipe view
  receipeView.update(model.state.recipe);

  // 3) Render bookmarks
  bookmarksView.render(model.state.bookmarks);
}

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner()

    //Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log('model.controlAddRecipe: model.state.recipe-->', model.state.recipe)

    // Render recipe
    receipeView.render(model.state.recipe);

    // Success message
    addRecipeView.renderMessage();

    // Render bookmarks view
    bookmarksView.render(model.state.bookmarks)

    //change id in the ulr
    window.history.pushState(null, '', `#${model.state.recipe.id}`)

    // Close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    },MODAL_ClOSE_SEC * 1000)
  } catch (err) {
    console.error('⏰', err)
    addRecipeView.renderError(err.message);
  }
}

const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  receipeView.addHandlerRender(controlRecipes);
  receipeView.addHandlerUpdateServings(controlServings);
  receipeView.addHandlerAddBookmark(controlAddBookmarks)
  searchView.addHandlerSearch(controlSearchResult);   //
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcomes');
  //controlServings();
};
console.log('init()')
init();