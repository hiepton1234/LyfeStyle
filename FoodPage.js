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
import {getCurrentLocation, fetchNearbyRestaurants, fetchRestaurantMenu, searchFoodItems} from "./Recommender/FoodRecs";
import Geolocation from 'react-native-geolocation-service';

class FoodEntry {
  constructor(food_name, hour_recorded, minute_recorded) {
    this.food_name = food_name
    this.hour_recorded = hour_recorded
    this.minute_recorded = minute_recorded
  }
}

function FoodPage(props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [info, setInfo] = useState("");
  const [currentSelectedDate, setCurrentSelectedDate] = useState(new Date());
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const yelpFusionApiKey = '3YfmZ-MolZrxxP2KBnefV1eepEw034xAmxOleosjvwytWvLjAeXb0mf1emgb0rnhLD-2_Pwz97JW5JFU_c7xGcfglxG51N5RWp9MM3DZTuW2ORSngo6OtS_wExx3ZHYx'


  let emptyMealList = [
    {
      meal: 'Breakfast',
      data: []
    },
    {
      meal: 'Lunch',
      data: [],
    },
    {
      meal: 'Dinner',
      data: [],
    },
    {
      meal: 'Snacks',
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

  const addNewFoodItem = (index, enteredText) => {
    const d = new Date()
    let hour_recorded = d.getHours()
    let minute_recorded = d.getMinutes()

    let newItem = new FoodEntry(enteredText, hour_recorded, minute_recorded)

    console.log(index + enteredText)
    const newMealList = [...mealList];
    newMealList[index].data.push(newItem);

    setMealList(newMealList);
  };

  const foodReference = database().ref('user/' + props.user.uid);
  console.log('foodReference key: ', foodReference.key);
  const saveFoods = () => {
    // store contents of profile page user inputs to firebase
    for (let i = 0; i < mealList.length; i++){
      const mealReference = foodReference
        .child("Food Entries/" + formatDate(currentSelectedDate))
        .child(mealList[i].meal);

      // for each food entry for a meal time
      for (let j = 0; j < mealList[i].data.length; j++) {
        const food = mealList[i].data[j];
        const { food_name: foodName, hour_recorded, minute_recorded } = food;

        const foodEntry = {
          hour_recorded,
          minute_recorded,
        };

        mealReference.child(foodName).set(foodEntry)
          .then(() => console.log('Food updated.'));
      }
    }
  }

  useEffect(() => {
    loadFoodEntries();
  }, [currentSelectedDate]);

  const loadFoodEntries = () => {
    console.log("CURRENT SELECTED DATE FROM LOAD " + currentSelectedDate)
    database()
      .ref('user/' + props.user.uid + '/Food Entries/' + formatDate(currentSelectedDate))
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setInfo(data);

          // Update the profileElems array with data from info
          const updatedMealList = mealList.map((elem) => {
            if (elem.meal in data) {
              const foodList = Object.entries(data[elem.meal]).map(([foodName, foodEntry]) => ({
                food_name: foodName,
                hour_recorded: foodEntry.hour_recorded,
                minute_recorded: foodEntry.minute_recorded,
              }));
              return { ...elem, data: foodList };
            }
            return elem;
          });

          setMealList(updatedMealList);
        } else {
          setInfo("")
          setMealList(emptyMealList)
        }
      })
  };

  // get menu items of restaurants nearby, used for possible recommendations
  // fetchNearbyRestaurants(props.latitude, props.longitude, yelpFusionApiKey)
  // commented right now to stop API calls
  // searchFoodItems('chicken sandwich')

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
          {/* make recommendation */}
          <Pressable
            onPress={() => {
              setModalVisible(!modalVisible)
              saveFoods()
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
              <Text style={[styles.baseText, {fontWeight: "bold"}]}>{'⇦'}</Text>
            </TouchableOpacity>
            <Text style={styles.baseText}>{isTodayOrYesterday(currentSelectedDate)}</Text>

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
                <Text style={[{opacity: 0, fontWeight: "bold"}]}>{'⇨'}</Text>
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
              <Text style={[styles.baseText, {fontWeight: "bold"}]}>{'⇨'}</Text>
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
    fontSize: 20,
    lineHeight: 40,
    marginRight: 10,
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
  date_selection_container: {
    margin: 5,
    flexDirection: "row",
    justifyContent: 'space-evenly',
  },
  item: {
    backgroundColor: '#edf7f5',
    borderColor: 'gray',
    borderWidth: 1,
    padding: 10,
    marginVertical: 8,
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
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalText: {
    fontFamily: 'Avenir-Book',
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
    fontFamily: 'Avenir-Book',
    fontWeight: "bold",
    fontSize: 20,
    lineHeight: 25,
  }
})