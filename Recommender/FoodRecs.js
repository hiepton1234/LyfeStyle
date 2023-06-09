import axios, {CancelToken} from 'axios';
import Geolocation from 'react-native-geolocation-service';
import database from "@react-native-firebase/database";
import React, {useEffect, useState} from 'react'
import {TouchableOpacity, StyleSheet, Text, View, Alert, TextInput, Pressable, Modal} from 'react-native'
import qs from 'qs'
import {Picker} from "@react-native-picker/picker";

function FoodRecModal(props) {
  return(
    <Modal
      animationType="fade"
      transparent={true}
      visible={props.modalVisible}
      onRequestClose={() => {
        Alert.alert('Modal has been closed.');
        props.setModalVisible(!props.modalVisible);
      }}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={[styles.item, { flexDirection: 'row', justifyContent: 'space-between' }]}>
            <TextInput
              style={styles.input}
              placeholder={"Food name here"}
              onChangeText={props.foodInputHandler}
              value={props.recommendation}
            />
            <TextInput
              style={styles.input}
              placeholder={"Cals per serving"}
              onChangeText={props.caloriesInputHandler}
              value={props.recommendationCals.toString()}
            />
          </View>
          <View style={styles.pickerSection}>
            <View style={{flex: 1}}>
              <Text style={styles.modalText}># of Servings</Text>
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.modalText}>Like Rating</Text>
            </View>
          </View>
          <View style={styles.pickerSection}>
            <Picker
              style={{ flex: 1 }}
              selectedValue={props.selectedServings}
              onValueChange={(itemValue, itemIndex) =>
                props.setSelectedServings(itemValue)
              }>
              {props.possible_num_servings.map((item, index) => (
                <Picker.Item label={item} value={item} />
              ))}
            </Picker>
            <Picker
              style={{ flex: 1 }}
              selectedValue={props.selectedLike}
              onValueChange={(itemValue, itemIndex) =>
                props.setSelectedLike(itemValue)
              }>
              {props.like_scale.map((item, index) => (
                <Picker.Item label={item} value={item} />
              ))}
            </Picker>
          </View>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => {
              props.setModalVisible(!props.modalVisible)
              props.addFoodHandler(props.recommendation, props.recommendationCals)
            }
            }>
            <Text style={styles.modalText}>Add Food Entry</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

export function FoodRecs(props) {
  const [recommendedTime, setRecommendedTime] = useState('');
  const [recommendation, setRecommendation] = useState('')
  const [recommendationCals, setRecommendationCals] = useState(0)
  const [energyBurned, setEnergyBurned] = useState([])
  const [goalCalories, setGoalCalories] = useState(0)
  const [weightGoal, setWeightGoal] = useState([])
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: {
      vegetarian: false,
      vegan: false,
      glutenFree: false,
      dairyFree: false,
    },
    ethnicStyles: {
      Italian: false,
      Mexican: false,
      Indian: false,
      Chinese: false,
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
  const APP_ID = 'b710f942';
  const APP_KEY = '1530298d7ac2bc4f3fa1d89d8a7f6aba';
  const searchFoodItems = async (query, preferences) => {
    const ethnicPreferences = Object.entries(preferences.ethnicStyles)
      .filter(([ethnicStyle, value]) => value === true)
      .map(([ethnicStyle, value]) => ethnicStyle);

    const healthPreferences = Object.entries(preferences.dietaryRestrictions)
      .flatMap(([category, preferenceObj]) =>
        Object.entries(preferenceObj)
          .filter(([preference, value]) => value === true)
          .map(([preference, value]) => preference)
      );

    // Convert preferences into the allowed format by the API
    const convertedHealthPreferences = healthPreferences.map((preference) => {
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

    const goalCalories = await calculateGoalCalories(await avgEnergyBurned());
    setGoalCalories(goalCalories);

    let max_cals_each_serving = Math.round(goalCalories / 3) + 100
    console.log(goalCalories)

    let healthParams = qs.stringify({ health: convertedHealthPreferences }, { indices: false });
    console.log(healthParams)

    let cuisineTypeParams = qs.stringify({ cuisineType: ethnicPreferences }, { indices: false });
    console.log(cuisineTypeParams)

    try {
      const response = await axios.get(
        `https://api.edamam.com/api/recipes/v2?type=public&q=${query}&app_id=${APP_ID}&${cuisineTypeParams}&app_key=${APP_KEY}&calories=200-${max_cals_each_serving}&${healthParams}`
      );

      // Handle the response data here
      const recipes = response.data.hits.map((hit) => hit.recipe);

      let randomRec = Math.floor(Math.random() * recipes.length);
      setRecommendation(recipes[randomRec].label)
      setRecommendationCals(Math.round(recipes[randomRec].calories / recipes[randomRec].yield))

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
  database()
    .ref('user/' + props.user.uid + '/goals/weightGoal')
    .once('value')
    .then((snapshot) => {
      if (snapshot.exists()) {
        setWeightGoal(snapshot.val());
      }
    })

// calculate user's maintenance calories based on Mifflin-St Jeor Equation
  async function calculateGoalCalories(avgEnergyBurntDaily) {
    try {
      console.log(avgEnergyBurntDaily);

      let genderConstant = 5;
      if (props.bio_sex === 'female')
        genderConstant = -161;
      let BMR = (10 * props.weight * 0.453592) + (6.25 * props.height * 2.54) - (5 * props.age) + genderConstant;

      // increase basal metabolic rate by avg daily energy burnt from activity to obtain maintenance cals
      let maintenance_cals = BMR * avgEnergyBurntDaily / 15;

      let goalModifier = 1;
      if (weightGoal === 'lose')
        goalModifier = 0.9;
      else if (weightGoal === 'gain')
        goalModifier = 1.1;

      // goal calories = maintenance calories times a multiplier depending on weight goal. 0.9 and 1.1 for
      // healthy and feasible weight loss rate of +/- 0.5 pound each week
      let goal_cals = Math.round(maintenance_cals * goalModifier);
      return goal_cals;
    } catch (error) {
      console.error('Error calculating goal calories:', error);
      return null; // Return null in case of an error
    }
  }


  function loadEnergyBurned() {
    return new Promise((resolve, reject) => {
      database()
        .ref('user/' + props.user.uid + '/Health Info/Active Energy Burned/')
        .once('value')
        .then((snapshot) => {
          if (snapshot.exists()) {
            resolve(snapshot.val());
          } else {
            resolve([]); // Return an empty array if data doesn't exist
          }
        })
        .catch((error) => {
          console.error('Error loading energy burned:', error);
          reject(error);
        });
    });
  }

  async function avgEnergyBurned() {
    try {
      // Step 1: Load energy burned data from Firebase
      const energyBurnedData = await loadEnergyBurned();

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

      return averageEnergyBurnedPerDay;
    } catch (error) {
      console.error('Error calculating average energy burned:', error);
      return null; // Return null in case of an error
    }
  }

  const [modalVisible, setModalVisible] = useState(false);
  const [prevModalVisible, setPrevModalVisible] = useState(false);
  const [selectedServings, setSelectedServings] = useState('1');
  const possible_num_servings = ['0.25', '0.5', '0.75', '1', '1.25', '1.5', '1.75', '2']
  const [selectedLike, setSelectedLike] = useState('1');
  const like_scale = ['1', '2', '3', '4', '5']
  const [enteredFood, setEnteredFood] = useState(recommendation);
  const [enteredCalories, setEnteredCalories] = useState('');

  const foodInputHandler = (enteredText) => {
    setEnteredFood(enteredText);
  };

  const caloriesInputHandler = (enteredText) => {
    setEnteredCalories(enteredText);
  };

  const addFoodHandler = (recommendation, recommendationCals) => {

    props.addNewFoodItem(props.index, recommendation, recommendationCals, selectedServings, selectedLike)

    setEnteredFood('');
    setEnteredCalories('');
    setSelectedServings('0.25');
    setSelectedLike('1');
  };

  const [previousRecommendation, setPreviousRecommendation] = useState('')
  const [previousRecommendationCals, setPreviousRecommendationCals] = useState(0)

  useEffect(() => {
    const loadFoodItems = async () => {
      try {
        const snapshot = await database()
          .ref('user/' + props.user.uid + '/Food Entries')
          .once('value');

        if (snapshot.exists()) {
          const foodEntries = snapshot.val();
          const foodItems = [];

          for (const date in foodEntries) {
            const meals = foodEntries[date];

            if (meals[props.meal] && meals[props.meal].Items) {
              const items = meals[props.meal].Items;
              Object.keys(items).forEach(itemKey => {
                const foodItem = items[itemKey];
                foodItems.push({ name: itemKey, ...foodItem });
              });
            }
          }

          const likedFoodItems = foodItems.filter(item => item.selectedLike >= 3);

          if (likedFoodItems.length > 0) {
            const randomRec = Math.floor(Math.random() * likedFoodItems.length);
            console.log(likedFoodItems);
            setPreviousRecommendation(likedFoodItems[randomRec].name);
            setPreviousRecommendationCals(likedFoodItems[randomRec].enteredCalories);
          }
        }
      } catch (error) {
        console.error('Error loading food items:', error);
      }
    };

    loadFoodItems();
  }, [props.meal, props.user.uid]);


  return (
    <>
      {props.meal === recommendedTime && (
        <View style={styles.recommendationView}>
          <FoodRecModal
            setModalVisible={setModalVisible}
            modalVisible={modalVisible}
            foodInputHandler={foodInputHandler}
            recommendation={recommendation}
            caloriesInputHandler={caloriesInputHandler}
            recommendationCals={recommendationCals}
            setSelectedServings={setSelectedServings}
            selectedServings={selectedServings}
            possible_num_servings={possible_num_servings}
            setSelectedLike={setSelectedLike}
            selectedLike={selectedLike}
            like_scale={like_scale}
            addFoodHandler={addFoodHandler}
          ></FoodRecModal>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Text style={styles.baseText}>{recommendedTime === props.meal && recommendation}</Text>
          </TouchableOpacity>
          <FoodRecModal
            setModalVisible={setPrevModalVisible}
            modalVisible={prevModalVisible}
            foodInputHandler={foodInputHandler}
            recommendation={previousRecommendation}
            caloriesInputHandler={caloriesInputHandler}
            recommendationCals={previousRecommendationCals}
            setSelectedServings={setSelectedServings}
            selectedServings={selectedServings}
            possible_num_servings={possible_num_servings}
            setSelectedLike={setSelectedLike}
            selectedLike={selectedLike}
            like_scale={like_scale}
            addFoodHandler={addFoodHandler}
          ></FoodRecModal>
          <TouchableOpacity onPress={() => setPrevModalVisible(true)}>
            <Text style={styles.baseText}>{recommendedTime === props.meal && previousRecommendation}</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  );


}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Avenir-Book',
    fontSize: 18,
    lineHeight: 30,
    marginRight: 10,
    opacity: 0.4
  },
  recommendationView: {
    backgroundColor: 'rgba(255,218,191,0.77)',
    borderRadius: 10,
    padding: 10,
    margin: 5
  },
  sectionHeading: {
    fontFamily: 'Avenir-Book',
    fontWeight: "bold",
    fontSize: 40,
    lineHeight: 50,
  },
  customButton: {
    fontFamily: 'Avenir-Book',
    fontSize: 35,
    fontWeight: "600",
    textAlign: "right",
  },
  appContainer: {
    backgroundColor: '#edf7f5',
    flex: 1,
    paddingTop: 50,
    padding: 25,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cccccc",
    // in most places where you can set size as num pixels, you can also use percentages passed as a string
    // want this element to take up 80% of available width, defined by the container in which the element sits
    width: '60%',
    margin: 8,
    padding: 8,
    justifyContent: ''
  },
  item: {
    flexDirection: "row",
  },
  pickerSection: {
    flexDirection: "row",
  },
  goalInput: {
    fontFamily: 'Avenir-Book',
    flex: 1,
    textAlign: 'left',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalText: {
    fontFamily: 'Avenir-Book',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    margin: 20,
    flex: 1,
    borderRadius: 20,
    paddingTop: 35,
    paddingBottom: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonOpen: {
    backgroundColor: '#2196F3',
  },
  buttonClose: {
    backgroundColor: '#F194FF',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    margin: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mealSection: {
    fontFamily: 'Avenir-Book',
    fontWeight: "bold",
    fontSize: 20,
    lineHeight: 25,
  },
  input: {
    fontFamily: 'Avenir-Book',
    borderWidth: 1,
    borderRadius: 5,
    margin: 10,
    padding: 10,
    fontSize: 15,
    flex: 1
  },
})
