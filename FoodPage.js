import {useEffect, useState} from "react";
import {
  Alert,
  StyleSheet,
  Modal,
  Text,
  View,
  TouchableOpacity,
  SectionList,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import database from "@react-native-firebase/database";
import {AddNewFoodItem} from "./AddNewFoodItem";
import {FoodPreferences} from "./FoodPreferences"
import moment, {min} from 'moment'
import {
  getCurrentLocation,
  fetchNearbyRestaurants,
  fetchRestaurantMenu,
  makeRecommendation, FoodRecs
} from "./Recommender/FoodRecs";
import Geolocation from 'react-native-geolocation-service';
import HealthKit, {
  HKUnit,
  HKQuantityTypeIdentifier,
  useHealthkitAuthorization, HKUnits,
} from '@kingstinct/react-native-healthkit';
import AppleHealthKit from "react-native-health";

class FoodEntry {
  constructor(food_name, enteredCalories, selectedServings, selectedLike) {
    this.food_name = food_name
    this.enteredCalories = enteredCalories
    this.selectedServings = selectedServings
    this.selectedLike = selectedLike
  }
}

function FoodPage(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [info, setInfo] = useState("");
  const [currentSelectedDate, setCurrentSelectedDate] = useState(new Date());
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yelpFusionApiKey = '3YfmZ-MolZrxxP2KBnefV1eepEw034xAmxOleosjvwytWvLjAeXb0mf1emgb0rnhLD-2_Pwz97JW5JFU_c7xGcfglxG51N5RWp9MM3DZTuW2ORSngo6OtS_wExx3ZHYx'

  const writeEnergyConsumedSamples = async (energyConsumed, mealtime, energyConsumedSamps, currentSelectedDate, fetchCaloricData, readEnergyConsumedSamples, option, newReference) => {
    const isAvailable = await HealthKit.isHealthDataAvailable();


    try {
      await HealthKit.requestAuthorization(
        [HKQuantityTypeIdentifier.dietaryEnergyConsumed],
        [HKQuantityTypeIdentifier.dietaryEnergyConsumed]
      );

      const energySample = {
        type: 'DietaryEnergyConsumed',
        value: energyConsumed,
        unit: 'kcal',
      };

      const options = {
        startDate: new Date(0), // Retrieve samples from the beginning of time
        endDate: new Date(), // Retrieve samples up to the current date
        limit: 0, // Retrieve all matching samples
        ascending: false, // Sort the samples in descending order by date
        type: HKQuantityTypeIdentifier.dietaryEnergyConsumed, // Specify the desired data type
        sourceName: 'LyfeStyle', // Filter by the specified source name
        unit: 'kcal' // Specify the desired unit
      };

      // DELETE RECORDS
      // const uuids = energyConsumedSamps.map(sample => sample.id);
      //
      // for (let i = 0; i < 7; i++)
      //   await HealthKit.deleteQuantitySample(HKQuantityTypeIdentifier.dietaryEnergyConsumed, uuids[i]);
      //console.log(currentSelectedDate)

      const valueExists = energyConsumedSamps.some(sample => ((sample.value === energyConsumed) && sample.sourceName === 'LyfeStyle'));

      // If energyConsumed does not exist, save the quantity sample
      if (!valueExists) {
        await HealthKit.saveQuantitySample(
          HKQuantityTypeIdentifier.dietaryEnergyConsumed,
          'kcal',
          energyConsumed,
          {
            metadata: {
              meal: mealtime,
            }
          }
        );
        console.log('Quantity sample saved successfully!');
      }

      // await readEnergyConsumedSamples(option, newReference)
      // await fetchCaloricData(props.user)
    } catch (error) {
      console.error('Error writing energy consumed samples:', error);
    }
  };

  let emptyMealList = [
    {
      meal: 'Breakfast',
      hour_recorded: 0,
      minute_recorded: 0,
      data: []
    },
    {
      meal: 'Lunch',
      hour_recorded: 0,
      minute_recorded: 0,
      data: [],
    },
    {
      meal: 'Dinner',
      hour_recorded: 0,
      minute_recorded: 0,
      data: [],
    },
    {
      meal: 'Snacks',
      hour_recorded: 0,
      minute_recorded: 0,
      data: [],
    },
  ]

  const [mealList, setMealList] = useState(emptyMealList)

  const formatDate = (date) => {
    return date.getDate().toString() + " " + months[date.getMonth().toString()] + " " + date.getFullYear()
  }

  const isTodayOrYesterday = () => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (formatDate(today) === formatDate(currentSelectedDate))
      return "Today"
    else if (formatDate(yesterday) === formatDate(currentSelectedDate))
      return "Yesterday"
    return formatDate(currentSelectedDate)
  }

  const foodReference = database().ref('user/' + props.user.uid);
  // console.log('foodReference key: ', foodReference.key);

  const addNewFoodItem = (index, enteredText, enteredCalories, selectedServings, selectedLike) => {
    const d = new Date()
    let hour_recorded = d.getHours()
    let minute_recorded = d.getMinutes()

    let newItem = new FoodEntry(enteredText, enteredCalories, selectedServings, selectedLike)

    console.log(index + enteredText)
    const newMealList = [...mealList]
    newMealList[index].data.push(newItem)
    newMealList[index].hour_recorded = hour_recorded
    newMealList[index].minute_recorded = minute_recorded

    setMealList(newMealList);
  };

  const newReference = database().ref('user/' + props.user.uid)
  const saveFoods = async () => {
    // store contents of profile page user inputs to firebase
    for (let i = 0; i < mealList.length; i++){
      const mealReference = foodReference
        .child("Food Entries/" + formatDate(currentSelectedDate))
        .child(mealList[i].meal);

      // for each food entry for a meal time
      let totalCalsForMeal = 0
      for (let j = 0; j < mealList[i].data.length; j++) {
        const food = mealList[i].data[j];
        const { food_name: foodName, enteredCalories, selectedServings, selectedLike} = food;

        const foodEntry = {
          enteredCalories,
          selectedServings,
          selectedLike,
        };
        totalCalsForMeal += Math.floor(enteredCalories * selectedServings)
        console.log(totalCalsForMeal)

        writeEnergyConsumedSamples(totalCalsForMeal, mealList[i].meal, props.energyConsumedSamps, currentSelectedDate, props.fetchCaloricData, props.readEnergyConsumedSamples, props.options, newReference)

        await mealReference.update({hour_recorded: mealList[i].hour_recorded, minute_recorded: mealList[i].minute_recorded, totalCalsForMeal: totalCalsForMeal})
        mealReference.child('Items/' + foodName).update(foodEntry)
          .then(() => console.log('Food updated.'));
      }
    }
  }

  useEffect(() => {
    loadFoodEntries();
  }, [currentSelectedDate]);

  const loadFoodEntries = () => {
    // console.log("CURRENT SELECTED DATE FROM LOAD " + currentSelectedDate)
    database()
      .ref('user/' + props.user.uid + '/Food Entries/' + formatDate(currentSelectedDate))
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setInfo(data);

          const newMealList = emptyMealList.map((elem) => {
            if (elem.meal in data) {
              const mealData = data[elem.meal];
              const foodList = Object.entries(mealData.Items || {}).map(([foodName, foodEntry]) => {
                const { enteredCalories, selectedServings, selectedLike } = foodEntry;
                return {
                  food_name: foodName,
                  enteredCalories,
                  selectedServings,
                  selectedLike,
                };
              });
              return { ...elem, data: foodList, hour_recorded: mealData.hour_recorded, minute_recorded: mealData.minute_recorded };
            }
            return elem;
          });

          setMealList(newMealList);
        } else {
          setInfo("");
          setMealList(emptyMealList);
        }
      });
  };



  // get menu items of restaurants nearby, used for possible recommendations
  // fetchNearbyRestaurants(props.latitude, props.longitude, yelpFusionApiKey)
  // commented right now to stop API calls
  // searchFoodItems('chicken breast')

  return (
    <View style={styles.centeredView}>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Food page has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <ScrollView style={styles.appContainer}>
          <Pressable
            onPress={() => {
              setModalVisible(!modalVisible)
              saveFoods()
              props.readEnergyConsumedSamples(props.options, newReference)
              props.fetchCaloricData(props.user)
            }}
            style={({pressed}) => [{opacity : pressed ? 0.3 : 1}]}>
            <Text style={styles.customButton}>❌</Text>
          </Pressable>
          <Text style={styles.sectionHeading}>
            Food Tracking
          </Text>
          <FoodPreferences user={props.user}/>

          {/* Change Date View */}
          <View style={styles.date_selection_container}>
            <TouchableOpacity onPress={() => {
              const decrementedDate = new Date(currentSelectedDate);
              decrementedDate.setDate(decrementedDate.getDate() - 1);
              setCurrentSelectedDate(decrementedDate);
              loadFoodEntries()
            }}>
              <Text style={[styles.modalText, {fontWeight: "bold"}]}>{'⇦'}</Text>
            </TouchableOpacity>
            <Text style={styles.modalText}>{isTodayOrYesterday(currentSelectedDate)}</Text>

            {/* if currentSelectedDate is today, disable next date button, still render or messes up View */}
            {isTodayOrYesterday(currentSelectedDate) === 'Today' ? (
              <TouchableOpacity
                disabled={true}
                onPress={() => {
                  const incrementedDate = new Date(currentSelectedDate);
                  incrementedDate.setDate(incrementedDate.getDate() + 1);
                  setCurrentSelectedDate(incrementedDate);
                }}
              >
                <Text style={[styles.modalText, {opacity: 0, fontWeight: "bold"}]}>{'⇨'}</Text>
              </TouchableOpacity>
            ) :
            (
            <TouchableOpacity
              onPress={() => {
                const incrementedDate = new Date(currentSelectedDate);
                incrementedDate.setDate(incrementedDate.getDate() + 1);
                setCurrentSelectedDate(incrementedDate);
              }}
            >
              <Text style={[styles.modalText, {fontWeight: "bold"}]}>{'⇨'}</Text>
            </TouchableOpacity>
            )}
          </View>

          <View>
            {mealList.map((meal, index) => (
              <View key={index}>
                <Text style={styles.modalText}>{meal.meal}</Text>
                <View>
                  {meal.data.map((food, foodIndex) => (
                    <Text style={styles.baseText} key={foodIndex}>{food.food_name}</Text>
                  ))}
                </View>
                {/* if date is today, give a recommendation for a meal, corresponding to appropriate time*/}
                {isTodayOrYesterday(currentSelectedDate) === 'Today' && mealList[index].data.length === 0 &&
                  (
                    <FoodRecs
                      user={props.user}
                      age={props.age}
                      bio_sex={props.bio_sex}
                      height={props.height}
                      weight={props.weight}
                      meal={meal.meal}
                      index={index}
                      addNewFoodItem={addNewFoodItem}
                    >
                    </FoodRecs>
                )}
                <AddNewFoodItem index={index} addNewFoodItem={addNewFoodItem}/>
              </View>
            ))}
          </View>
        </ScrollView>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen]}
        onPress={() => {
          setModalVisible(true)
          loadFoodEntries()
        }}>
        <Text style={styles.textStyle}>Food Tracking</Text>
      </Pressable>
    </View>
  )
}

export {FoodPage};

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Avenir-Book',
    fontSize: 18,
    lineHeight: 40,
    marginRight: 10,
  },
  sectionHeading: {
    fontFamily: 'American Typewriter',
    fontWeight: "bold",
    fontSize: 40,
    lineHeight: 50,
  },
  customButton: {
    fontFamily: 'American Typewriter',
    fontSize: 35,
    fontWeight: "600",
    textAlign: "right",
  },
  appContainer: {
    backgroundColor: '#ffff',
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
  date_selection_container: {
    margin: 5,
    flexDirection: "row",
    justifyContent: 'space-evenly',
  },
  item: {
    backgroundColor: '#ffff',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
  },
  goalInput: {
    fontFamily: 'American Typewriter',
    flex: 1,
    textAlign: 'left',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 20,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalText: {
    fontFamily: 'American Typewriter',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#64D2FF',
  },
  buttonClose: {
    backgroundColor: '#64D2FF',
  },
  textStyle: {
    fontFamily: 'American Typewriter',
    textAlign: 'center',
  },
  mealSection: {
    fontFamily: 'American Typewriter',
    fontWeight: "bold",
    fontSize: 20,
    lineHeight: 25,
  }
})