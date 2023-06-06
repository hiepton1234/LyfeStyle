import React, {useEffect, useState} from "react";
import {Alert, StyleSheet, Switch, Modal, Text, View, ScrollView, Button, SectionList, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import database from "@react-native-firebase/database";
import {Picker} from "@react-native-picker/picker";
import axios from "axios";

const SwitchList = ({ data, onToggle }) => {
  // use regex to add spaces in between where the variable has a lowercase letter followed by an uppercase, such as
  // dairyFree to dairy Free, then capitalize first letter
  const formatPreferenceText = (preference) => {
    // Add spaces between specific words
    preference = preference.replace(/([a-z])([A-Z])/g, '$1 $2');
    return preference.charAt(0).toUpperCase() + preference.slice(1);
  };

  return (
    <View>
      {Object.entries(data).map(([preference, value]) => (
        <View style={styles.switchContainer} key={preference}>
          <Text style={styles.baseText}>{formatPreferenceText(preference)}</Text>
          <Switch value={value} onValueChange={() => onToggle(preference)} />
        </View>
      ))}
    </View>
  );
};

export function FoodPreferences(props) {
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

  // Credentials for Edamam Food Database API
  const APP_ID = '494db791';
  const APP_KEY = '89d36b8cf6bc7b3dd26a06900ad6c473';

  let truePreferences = []
  let foodSearchResults = []
  const searchFoodItems = async (query) => {
    // Iterate over the preferences object
    for (const category in preferences) {
      const preferenceCategory = preferences[category];

      // Iterate over each preference category
      for (const preference in preferenceCategory) {
        if (preferenceCategory[preference] === true) {
          truePreferences.push(preference);
        }
      }
    }

    try {
      const response = await axios.get(
        'https://api.edamam.com/api/food-database/v2/parser', {
          params: {
            ingr: query,
            app_id: APP_ID,
            app_key: APP_KEY,
            health: truePreferences.join(',')
          }
        }
      );

      // Handle the response data here
      response.data.hints.forEach((data_elem) => {
        console.log(data_elem.food.knownAs)
      })
    } catch (error) {
      // Handle any errors
      console.error(error);
    }
  };

  const prefRef = database().ref('user/' + props.user.uid);

  const [modalVisible, setModalVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const handleToggle = (section, preference) => {
    setPreferences((prevPreferences) => ({
      ...prevPreferences,
      [section]: {
        ...prevPreferences[section],
        [preference]: !prevPreferences[section][preference],
      },
    }));
  };

  const savePreferences = () => {
    try {
      database().ref('user/' + props.user.uid).child('Food Preferences').set(preferences);
      console.log("Preferences saved to Firebase Realtime Database.");
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  const loadFoodPreferences = () => {
    database()
      .ref('user/' + props.user.uid + '/Food Preferences/')
      .once('value')
      .then((snapshot) => {
        if (snapshot.exists()) {
          const prefFromDB = snapshot.val();
          setPreferences(prefFromDB);
          console.log("LOADED PREFERENCES FROM DB");
        }
      });
  };

  useEffect(() => {
    loadFoodPreferences();
  }, []);

  return (
    <View>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          Alert.alert('Modal has been closed.');
          setModalVisible(!modalVisible);
        }}>
        <ScrollView style={styles.appContainer}>
          <Pressable
            onPress={() => {
              setModalVisible(!modalVisible)
              savePreferences()
            }}
            style={({pressed}) => [{opacity : pressed ? 0.3 : 1}]}>
            <Text style={styles.customButton}>❌</Text>
          </Pressable>

          <Text style={styles.sectionHeading}>Dietary Restrictions</Text>
          <SwitchList
            data={preferences.dietaryRestrictions}
            onToggle={(preference) => handleToggle("dietaryRestrictions", preference)}
          />

          <Text style={styles.sectionHeading}>Ethnic Styles</Text>
          <SwitchList
            data={preferences.ethnicStyles}
            onToggle={(preference) => handleToggle("ethnicStyles", preference)}
          />

          <Text style={styles.sectionHeading}>Allergies</Text>
          <SwitchList
            data={preferences.allergies}
            onToggle={(preference) => handleToggle("allergies", preference)}
          />
        </ScrollView>
      </Modal>
      <Pressable
        style={[styles.button, styles.buttonOpen, {margin: 5}]}
        onPress={() => {
          setModalVisible(true)
          loadFoodPreferences()
        }}>
        <Text style={styles.textStyle}>Edit Food Preferences</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'American Typewriter',
    fontSize: 20,
    lineHeight: 40,
    marginRight: 10,
  },
  sectionHeading: {
    fontFamily: 'American Typewriter',
    fontWeight: "bold",
    fontSize: 35,
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
    paddingBottom: 50,
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
  save_or_cancel: {
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
})