import axios, {CancelToken} from 'axios';
import Geolocation from 'react-native-geolocation-service';
import database from "@react-native-firebase/database";
import {useEffect, useState} from 'react'
import {StyleSheet, Text} from 'react-native'
import qs from 'qs'


export function FoodRecs(props) {
  const [recommendedTime, setRecommendedTime] = useState('');
  const [recommendation, setRecommendation] = useState('')
  const [foodSearchResults, setFoodSearchResults] = useState([])
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    ethnicStyles: {
      italian: false,
      mexican: false,
      indian: false,
      chinese: false,
    },
    allergies: {
      peanuts: false,
      soy: false,
      shellfish: false,
      treeNuts: false,
    },
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const snapshot = await database()
          .ref('user/' + props.user.uid + '/Food Preferences')
          .once('value');

        if (snapshot.exists()) {
          const preferencesData = snapshot.val();
          setPreferences(preferencesData);
          searchFoodItems('', preferencesData);
          console.log(preferencesData); // Log the fetched preferences
        }
      } catch (error) {
        console.error('Error fetching preferences: ', error);
      }
    };

    fetchPreferences();
  }, []);

  useEffect(() => {
    const calculateMedianTimes = () => {
      const mealTimes = ['Breakfast', 'Lunch', 'Dinner'];
      const medianTimes = {};

      // Initialize an empty array for each meal time
      for (const mealTime of mealTimes) {
        medianTimes[mealTime] = [];
      }

      // Iterate over the dates in Food Entries
      database()
        .ref('user/' + props.user.uid + '/Food Entries')
        .once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            const foodEntries = snapshot.val();

            for (const date in foodEntries) {
              const meals = foodEntries[date];

              // Iterate over each meal time for the current date
              for (const mealTime of mealTimes) {
                if (meals[mealTime]) {
                  const hourRecorded = meals[mealTime].hour_recorded;
                  const minuteRecorded = meals[mealTime].minute_recorded;

                  // Push the recorded time to the array
                  medianTimes[mealTime].push({ hour: hourRecorded, minute: minuteRecorded });
                }
              }
            }

            // Calculate the median for each meal time
            for (const mealTime of mealTimes) {
              const recordedTimes = medianTimes[mealTime];

              if (recordedTimes.length > 0) {
                // Sort the recorded times in ascending order
                recordedTimes.sort((a, b) => {
                  return a.hour - b.hour || a.minute - b.minute;
                });

                const medianIndex = Math.floor(recordedTimes.length / 2);
                medianTimes[mealTime] = recordedTimes[medianIndex];
              } else {
                medianTimes[mealTime] = null;
              }
            }

            const recommendedTime = calculateRecommendedTime(medianTimes);
            setRecommendedTime(recommendedTime);
          }
        });
    };

    calculateMedianTimes();
  }, []);

  // Credentials for Edamam Food Database API
  const APP_ID = '494db791';
  const APP_KEY = '89d36b8cf6bc7b3dd26a06900ad6c473';
  const searchFoodItems = async (query, preferences) => {

    const truePreferences = Object.entries(preferences)
      .flatMap(([category, preferenceObj]) =>
        Object.entries(preferenceObj)
          .filter(([preference, value]) => value === true)
          .map(([preference, value]) => preference)
      );
    console.log(truePreferences)

    // Convert preferences into the allowed format by the API
    const convertedPreferences = truePreferences.map((preference) => {
      // Perform any necessary conversions based on specific preference names
      switch (preference) {
        case 'glutenFree':
          return 'gluten-free';
        case 'dairyFree':
          return 'dairy-free'
        case 'peanuts':
          return 'peanut-free'
        case 'soy':
          return 'soy-free'
        case 'shellfish':
          return 'shellfish-free'
        case 'treeNuts':
          return 'tree-nut-free'
        // Add more cases for other preferences if needed
        default:
          return preference;
      }
    });

    console.log(convertedPreferences)
    let healthParams = qs.stringify({ health: convertedPreferences }, { indices: false });
    console.log(healthParams)

    try {
      const response = await axios.get(
        `https://api.edamam.com/api/food-database/v2/parser?ingr=${query}&app_id=${APP_ID}&app_key=${APP_KEY}&category=generic-meals&${healthParams}`
      );

      // Handle the response data here
      response.data.hints.forEach((data_elem) => {
        console.log(data_elem.food.knownAs)
      })

      let randomRec = Math.floor(Math.random() * response.data.hints.length);
      setRecommendation(response.data.hints[randomRec].food.knownAs)

    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };

  const calculateRecommendedTime = (medianTimes) => {
    let d = new Date();
    let currentHour = d.getHours();

    // make recommendedTime for which meal time to record, depending on current time with 1 hour grace period
    switch (true) {
      case currentHour >= (medianTimes?.Breakfast?.hour || 0) - 1 && currentHour < (medianTimes?.Lunch?.hour || 0) - 1:
        return 'Breakfast';
      case currentHour >= (medianTimes?.Lunch?.hour || 0) - 1 && currentHour < (medianTimes?.Dinner?.hour || 0) - 1:
        return 'Lunch';
      default:
        return 'Dinner';
    }
  };

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

  // get weight gaol
  const [weightGoal, setWeightGoal] = useState([])
  database()
    .ref('user/' + props.user.uid + '/goals/weightGoal')
    .once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        setWeightGoal(snapshot.val());
      }
    })

// calculate user's maintenance calories based on Mifflin-St Jeor Equation
  function calculateGoalCalories(avgEnergyBurntDaily) {

    let genderConstant = 5
    if (props.bio_sex === 'female')
      genderConstant = -161
    let BMR = (10 * props.weight * 0.453592) + (6.25 * props.height * 2.54) - (5 * props.age) + genderConstant

    // increase basal metabolic rate by avg daily energy burnt from activity to obtain maintenance cals
    let maintenance_cals = BMR * avgEnergyBurntDaily / 15

    let goalModifier = 1
    if (weightGoal === 'lose')
      goalModifier = 0.9
    else if (weightGoal === 'gain')
      goalModifier = 1.1

    // goal calories = maintenance calories times a multiplier depending on weight goal. 0.9 and 1.1 for
    // healthy and feasible weight loss rate of +/- 0.5 pound each week
    let goal_cals = Math.round(maintenance_cals * goalModifier)
    return goal_cals
  }

  function loadEnergyBurned() {
    const [energyBurned, setEnergyBurned] = useState([])
    database()
      .ref('user/' + props.user.uid + '/Health Info/Active Energy Burned/')
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          setEnergyBurned(snapshot.val());
        }
      });
    return energyBurned
  }

  function avgEnergyBurned() {
    // Assuming you have retrieved the energy burned data from Firebase as an array of objects
    const energyBurnedData = loadEnergyBurned();

    // Step 2: Group the energy burned records by endDate
    const groupedData = energyBurnedData.reduce((result, record) => {
      const { endDate, value } = record;
      if (!result[endDate]) {
        result[endDate] = [];
      }
      result[endDate].push(value);
      return result;
    }, {});

    // Step 3: Calculate total energy burned for each day
    const dailyTotals = Object.entries(groupedData).map(([endDate, energyBurnedValues]) => {
      const totalEnergyBurned = energyBurnedValues.reduce((sum, value) => sum + value, 0);
      return { endDate, totalEnergyBurned };
    });

    // Step 4: Determine the number of days
    const numberOfDays = dailyTotals.length;

    // Step 5: Calculate average energy burned per day
    const totalEnergyBurned = dailyTotals.reduce((sum, { totalEnergyBurned }) => sum + totalEnergyBurned, 0);
    const averageEnergyBurnedPerDay = totalEnergyBurned / numberOfDays;

    return (averageEnergyBurnedPerDay);

  }

  let goalCalories = calculateGoalCalories(avgEnergyBurned())

  return(
    <Text style={styles.baseText}>{recommendedTime === props.meal && recommendation}</Text>
  )

}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Avenir-Book',
    fontSize: 20,
    lineHeight: 40,
    marginRight: 10,
    opacity: 0.2
  },
})
