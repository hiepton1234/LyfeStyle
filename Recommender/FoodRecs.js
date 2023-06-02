import axios from 'axios';
import Geolocation from 'react-native-geolocation-service';

const makeRecommendation = () => {

}
const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      (position) => {
        resolve(position.coords);
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  });
};

const fetchNearbyRestaurants = async (latitude, longitude, yelpFusionApiKey) => {
  console.log(latitude + " " + longitude)
  const url = `https://api.yelp.com/v3/businesses/search?latitude=${latitude}&longitude=${longitude}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${yelpFusionApiKey}`,
      },
    });
    const restaurants = response.data.businesses;
    // Handle the retrieved restaurants data

    restaurants.forEach((restaurant) => {
      console.log(restaurant)
      fetchRestaurantMenu(restaurant.id, yelpFusionApiKey)
    })
  } catch (error) {
    console.error('Error fetching nearby restaurants: ', error);
  }
};

const fetchRestaurantMenu = async (restaurantId, yelpFusionApiKey) => {
  console.log(yelpFusionApiKey)
  const url = `https://api.yelp.com/v3/businesses/${restaurantId}/menu`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${yelpFusionApiKey}`,
      },
    });

    const menu = response.data.menu_items;
    // Handle the retrieved menu data
    console.log(menu);
  } catch (error) {
    console.error('Error fetching restaurant menu: ', error);
  }
};

// Credentials for Edamam Food Database API
const APP_ID = '494db791';
const APP_KEY = '89d36b8cf6bc7b3dd26a06900ad6c473';

const searchFoodItems = async (query) => {
  try {
    const response = await axios.get(
      `https://api.edamam.com/api/food-database/v2/parser?ingr=${query}&app_id=${APP_ID}&app_key=${APP_KEY}`
    );

    // Handle the response data here
    response.data.hints.forEach((data_elem) => {
      console.log(data_elem.food.knownAs + " from " + data_elem.food.brand)
    })
  } catch (error) {
    // Handle any errors
    console.error(error);
  }
};

export {getCurrentLocation, fetchNearbyRestaurants, fetchRestaurantMenu, searchFoodItems}
