angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $location, $ionicNavBarDelegate, $window) {

  // Perform the login action when the user submits the login form
  window.addEventListener("orientationchange", function(){

    var dev_width = $window.innerWidth;

    if(dev_width >= 768){
      // screen.orientation.unlock();
      screen.orientation.lock('landscape');
      console.log('Orientation is ' + screen.orientation.type + 'mode1');
    } else {
      screen.orientation.unlock();
      console.log('Orientation is ' + screen.orientation.type + 'mode2');
    }
  });

})

.controller('SucheCtrl', function($scope, $state, $ionicModal, $window, $http, sharedProperties) {

  var dev_width = $window.innerWidth;
  var col_num;
  var cnt = 0;
  var original_ingredients = []; // all ingredients (immutable) for sort

  var selectedIngredients = [];
  var all_recipes = [];
  var matched_recipes = [];

  $scope.all_ingredients = []; // available ingredients (mutable)
  $scope.selects = [];  // include blank ingredient
  $scope.item;
  $scope.param = {};
  $scope.isDisabled = false;

  $scope.sorted_recipes = [];

/*   dectect device width  */

  if(dev_width >= 768){
    col_num = 8;
  } else {
    col_num = 5;
  }
  $scope.toggleActive = function() {
    var noIngredient = true;

    for (var i = 0; i < $scope.selects.length; i++) {
      for (var j = 0; j < original_ingredients.length; j++) {
        if ($scope.selects[i].name == original_ingredients[j].name) {
          noIngredient = false;
          break;
        }
      }
    }

    if (noIngredient) {
      $scope.isDisabled = true;
    } else {
      $scope.isDisabled = false;
    }
  }

  $scope.loadSelects = function() {
    $scope.selects = [];
    for (var i = 0; i < col_num; i++) {
      $scope.selects.push({id: i, src: "img/ingredients/ingredient_blank.png"});
    }
    this.toggleActive();

    // Lounching the help page
    if(!$window.localStorage['flagHelpModal']) {
      $scope.helpModal.show();
      $window.localStorage['flagHelpModal'] = true;
    }
  }

  $scope.loadAllIngredients = function() {
    $scope.all_ingredients = [];
    $http.get('json/ingredients.json').success(function(data) {
      for (var i = 0; i < data.length; i++) {
        original_ingredients.push({id: data[i].id, name: data[i].name, src: "img/ingredients/" + data[i].icon});
        $scope.all_ingredients.push({id: data[i].id, name: data[i].name, src: "img/ingredients/" + data[i].icon});
      }
    });

    all_recipes = [];
    ingredients = [];
    $http.get('json/recipes.json').success(function(data) {
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].ingredients.length; j++) {
          if (data[i].ingredients[j].value != 0) {
            ingredients.push(data[i].ingredients[j]);
          }
        }

        all_recipes.push({
          id: data[i].id,
          title: data[i].title,
          src: "img/images/" + data[i].imageName,
          category: data[i].category,
          season: data[i].season,
          waitTime: data[i].waitTime,
          difficultyLevel: data[i].difficultyLevel,
          prepTime: data[i].prepTime,
          servings: data[i].servings,
          directions: data[i].directions,
          ingredients: ingredients
        });
        ingredients = [];
      }
    });
  }

  $scope.selectItem = function(item) {
    $scope.all_ingredients.splice($scope.all_ingredients.indexOf(item), 1);
    $scope.selects.splice(0, 0, item);
    if (cnt < col_num) {
      $scope.selects.splice(-1, 1);
      cnt++;
    }

    this.toggleActive();
  }

  $scope.deselectItem = function(item) {
    if (item.src != "img/ingredients/ingredient_blank.png") {
      $scope.item = item;
      $scope.ingredients_modal.show();
    }
  }

  $scope.deleteItem = function() {
    $scope.selects.splice($scope.selects.indexOf($scope.item), 1);

    if ($scope.selects.length < col_num) {
      $scope.selects.push({id: $scope.selects.length, src: "img/ingredients/ingredient_blank.png"});
      cnt = 0;
    }
    $scope.all_ingredients.splice(0, 0, $scope.item);
    this.clearSearch();
    $scope.ingredients_modal.hide();
    this.toggleActive();
  }

  $ionicModal.fromTemplateUrl('templates/help.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.helpModal = modal;
    $scope.loadSelects();
  });

  $ionicModal.fromTemplateUrl('templates/ingredients_dialog.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.ingredients_modal = modal;
  });

  $scope.closeModal = function(index) {
    if(index == 1) {
      $scope.helpModal.hide();
    } else {
      $scope.ingredients_modal.hide();
    }
  }

  $scope.clearSearch = function() {
    $scope.param.search = '';
    this.searchIngredients();
  }

  $scope.searchIngredients = function(){

    $scope.all_ingredients = [];

    var letterMatch = new RegExp($scope.param.search, 'i');
    for (var i = 0; i < original_ingredients.length; i++) {
      var item = original_ingredients[i];
      if ($scope.param.search) {
        if (letterMatch.test(item.name.substring(0, $scope.param.search.length))) {
          $scope.all_ingredients.push(item);
        }
      } else {
        $scope.all_ingredients.push(item);
      }
    }

    for (var i = 0; i < $scope.selects.length; i++) {
      for (var j = 0; j < $scope.all_ingredients.length; j++) {
        if ($scope.selects[i].name == $scope.all_ingredients[j].name) {
          $scope.all_ingredients.splice($scope.all_ingredients.indexOf($scope.all_ingredients[j]), 1);
        }
      }
    }
  }

  $scope.onSuchergebnis = function() {
    this.filterRecipes();
    sharedProperties.setSorted_filtered_recipes($scope.sorted_recipes);  // set sorted_filtered receipes
    // $scope.sorted_recipes = 0;
    if($scope.sorted_recipes.length == 0) {
      $state.go('app.no_recipe');
    } else {
      $state.go('app.suchergebnis');
    }
  }

  // recipes

  $scope.filterRecipes = function() {
    selectedIngredients = [];
    matched_recipes = [];
    $scope.sorted_recipes = [];

      // get really selected ingredients
      for (var i = 0; i < $scope.selects.length; i++) {
        if ($scope.selects[i].name != undefined) {
          selectedIngredients.push({id: $scope.selects[i].id, name: $scope.selects[i].name, src: $scope.selects[i].src});
        }
      }

      // get recipes include selected ingredients
      for (var i = 0; i < all_recipes.length; i++) {
        var ingredients_per_recipe = [];
        for (var j = 0; j < all_recipes[i].ingredients.length; j++) {
          ingredients_per_recipe.push(all_recipes[i].ingredients[j]);
        }

        for (var k = 0; k < ingredients_per_recipe.length; k++) {
          for (var m = 0; m < selectedIngredients.length; m++) {
            if (ingredients_per_recipe[k].ingredient_id == selectedIngredients[m].id) {
              matched_recipes.push(all_recipes[i]);
            }
          }
        }
      }

      //sort matched_recipes by exact match
      var arr = matched_recipes;

      var freq = {};
      for (var s in arr)
        freq[s] = freq[s] ? freq[s] + 1 : 0;
      arr.sort(function(a, b) {
        return freq[a] > freq[b] ? -1 : 1;
      });
      for (var i = arr.length - 1; i > 0; i--)
        if (arr[i] == arr[i - 1])
          arr.splice(i,1);

      arr.join(",");
      arr.reverse();

      // remove duplicate element in array
      var uniqueNames = [];
      for(var i in arr){
          if(uniqueNames.indexOf(arr[i]) === -1){
              uniqueNames.push(arr[i]);
          }
      }

      for (var i = 0; i < uniqueNames.length; i++) {
        $scope.sorted_recipes.push(uniqueNames[i]);
      }

      var categoryArray = [{
        categoryImage: "img/AMA_UI/category_Haupt.png"
      }, {
        categoryImage: "img/AMA_UI/category_Vor.png"
      }, {
        categoryImage: "img/AMA_UI/category_Nach.png"
      }];

      for (var i = 0; i < $scope.sorted_recipes.length; i++) {
        if($scope.sorted_recipes[i].category == "Hauptspeise"){
          $scope.sorted_recipes[i] = angular.merge({}, $scope.sorted_recipes[i], categoryArray[0]);
        }
        else if($scope.sorted_recipes[i].category == "Vorspeise"){
          $scope.sorted_recipes[i] = angular.merge({}, $scope.sorted_recipes[i], categoryArray[1]);
        }
        else if($scope.sorted_recipes[i].category == "Nachspeise"){
          $scope.sorted_recipes[i] = angular.merge({}, $scope.sorted_recipes[i], categoryArray[2]);
        }
      }
  }
})

.controller('SuchergebnisCtrl', function($scope, $state, sharedProperties) {
  $scope.filtered_sorted_recipes = [];


  $scope.selectRecipe = function(item) { //alert(item.id);
    sharedProperties.setSelectedRecipe(item); // set selected Recipe
    $state.go('app.recipe_detail');
  }

  $scope.noRecipe = false;
  $scope.$on("$ionicView.enter", function() {
    $scope.filtered_sorted_recipes = sharedProperties.getSorted_filtered_recipes();  // get sorted_filtered receipes
    if ($scope.filtered_sorted_recipes.length > 0) {
      $scope.noRecipe = false;
    }
    else
    {
      $scope.noRecipe = true;
    }
  })
})

.controller('RecipeDetailCtrl', function($scope, sharedProperties) {

  $scope.ingredients = [];
  $scope.directions = [];
  $scope.favoriteList = [];
  $scope.favoriteFlag = false;

  $scope.selectedRecipe = sharedProperties.getSelectedRecipe(); // get selected Recipe

  if($scope.selectedRecipe.ingredients.length > 0){
    for (var i = 0; i < $scope.selectedRecipe.ingredients.length; i++) {
      $scope.ingredients.push($scope.selectedRecipe.ingredients[i]);
    }
  }

  if ($scope.selectedRecipe.directions.length > 0){
    for(var i = 0; i < $scope.selectedRecipe.directions.length; i++){
      $scope.directions.push($scope.selectedRecipe.directions[i]);
    }
  }

  $scope.onRegisterFavorite = function() {
    $scope.favoriteFlag = !$scope.favoriteFlag;
    if ($scope.favoriteFlag == true) {
      $scope.favoriteList.push($scope.selectedRecipe);
    }
    else {
      $scope.favoriteList.splice($scope.favoriteList.indexOf($scope.selectedRecipe), 1);
    }

    sharedProperties.setFavoriteList($scope.favoriteList);

  }

  $scope.statusFavorite = function() {
    $scope.favoriteList = sharedProperties.getFavoriteList();

    if ($scope.favoriteList.length > 0) {
      for (var i = 0; i < $scope.favoriteList.length; i++) {
        if($scope.favoriteList[i].id == $scope.selectedRecipe.id)
        {
          $scope.favoriteFlag = true;
          break;
        }
        else {
          $scope.favoriteFlag = false;
        }
      }
    }
  }
})

.controller('FavoriteCtrl', function($scope, $state, sharedProperties) {
  $scope.noFavorite = false;

  $scope.$on("$ionicView.enter", function() {
    $scope.favorites = sharedProperties.getFavoriteList();

    if ($scope.favorites.length > 0) {
      $scope.noFavorite = false;
    }
    else {
      $scope.noFavorite = true;
    }
  })

  $scope.selectRecipe = function(item) { //alert(item.id);
    sharedProperties.setSelectedRecipe(item); // set selected Recipe
    $state.go('app.recipe_detail');
  }

})


.service('sharedProperties', function () {
    var sorted_filtered_recipes = [];
    var selectedRecipe;
    var favoriteList = [];

    return {
        getSorted_filtered_recipes: function () {
            return sorted_filtered_recipes;
        },
        setSorted_filtered_recipes: function(value) {
          sorted_filtered_recipes = value;
        },

        getSelectedRecipe: function() {
          return selectedRecipe;
        },
        setSelectedRecipe: function(value) {
          selectedRecipe = value;
        },

        getFavoriteList: function() {
          return favoriteList;
        },
        setFavoriteList: function(value) {
          favoriteList = value;
        }
    };
});
