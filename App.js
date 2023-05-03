import { StatusBar } from 'expo-status-bar';
import {useState} from "react";
import {StyleSheet, Text, View, ScrollView, Button, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';

import AppleHealthKit, {
  HealthValue,
  HealthKitPermissions,
} from 'react-native-health'

/* Permission options */
const permissions = {
  permissions: {
    read: [
        AppleHealthKit.Constants.Permissions.HeartRate,
        AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        AppleHealthKit.Constants.Permissions.Height,
        AppleHealthKit.Constants.Permissions.Weight,
        AppleHealthKit.Constants.Permissions.StepCount,
        AppleHealthKit.Constants.Permissions.DateOfBirth,
        AppleHealthKit.Constants.Permissions.BiologicalSex,
        AppleHealthKit.Constants.Permissions.SleepAnalysis,
        AppleHealthKit.Constants.Permissions.EnergyConsumed,
        AppleHealthKit.Constants.Permissions.Protein,
        // AppleHealthKit.Constants.Permissions.AllergyRecord
    ],
    // writing data permissions here, add if needed
    write: [],
  },
}

let height;
let dob = "";
let age;
let bio_sex;
AppleHealthKit.initHealthKit(permissions, (error) => {
  /* Called after we receive a response from the system */

  if (error) {
    console.log('[ERROR] Cannot grant permissions!')
  }

  /* Can now read or write to HealthKit */

  const options = {
    startDate: new Date(2020, 1, 1).toISOString(),
    endDate: new Date().toISOString(), // optional; default now
    type: 'AllergyRecord',
  }

  AppleHealthKit.getSleepSamples(
      options,
      (callbackError, result) => {
        /* Samples are now collected from HealthKit */
        console.log(result[0])
      },
  )
  AppleHealthKit.getBiologicalSex(
      options,
      (callBackError, result) => {
        console.log(result)
        bio_sex = result.value
      }
  )
  AppleHealthKit.getLatestHeight(
    options,
      (callBackError, result) => {
        console.log(result)
        height = result.value
    }
  )
    AppleHealthKit.getDailyStepCountSamples(
        options,
        (callBackError, result) => {
            console.log(result[0])
        }
    )
  AppleHealthKit.getLatestWeight(
      options,
      (callBackError, result) => {
        console.log(result)
      }
  )
  AppleHealthKit.getDateOfBirth(
    options,
    (callbackError, result) => {
        console.log(result)
      dob = result.value.substring(0, 10)
      age = result.age
    }
  )

  AppleHealthKit.getActiveEnergyBurned(
      options,
      (callbackError, result) => {
        console.log(result[0])
      }
  )

    AppleHealthKit.getEnergyConsumedSamples(
        options,
        (callbackError, result) => {
          console.log(result[0])
        }
    )
    AppleHealthKit.getProteinSamples(
        options,
        (callbackError, result) => {
            console.log(result[0])
        }
    )
    // AppleHealthKit.getClinicalRecords(
    //     options,
    //     (callbackError, result) => {
    //         console.log(result[0])
    //     }
    // )
})

export default function App() {
  // Define some example data for the ScrollView
  const [profileElems, setProfileElems] = useState([
    { id: 'Name:', text: '' },
    { id: 'Age:', text: age },
    { id: 'Date of Birth:', text: dob},
    { id: 'Gender:', text: bio_sex},
    { id: 'Height:', text: height },
    { id: 'Home Address:', text: ''},
    { id: 'Work Address:', text: ''},
    { id: 'Favorite Place 1:', text: ''},
    { id: 'Favorite Place 2:', text: ''},
  ]);

  // Define a function to update a data item by ID
  function updateDataItem(id, newText) {
    setProfileElems(previousData => {
      const newData = [...previousData];
      const index = newData.findIndex(item => item.id === id);
      newData[index] = { ...newData[index], text: newText };
      return newData;
    });
  }

  return (
    // adjusts view to still show what is being typed if otherwise would be covered by keyboard
    <KeyboardAvoidingView
      style={styles.appContainer}
      behavior='padding'
    >
      <ScrollView>
        <Text style={styles.sectionHeading}>
          My Profile
        </Text>
        {/* Each profile element in its own view, allows side by side TextInput*/}
        {profileElems.map(item => (
          <View style={styles.item} key={item.id}>
            <Text style={styles.baseText}>
              {item.id}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={"Type here"}
              value={item.text}
              onChangeText={newText => updateDataItem(item.id, newText)}
            />
          </View>
        ))}
        <View style={styles.save_or_cancel}>
            <Pressable
              // add function to call when pressed to read all inputs and save to DB
              // onPress={}
              style={({pressed}) => [
                {
                  opacity : pressed ? 0.3 : 1
                }
              ]}>
              <Text style={styles.customButton}>
                ✅
              </Text>
            </Pressable>
            <Pressable
              // onPress={}
              style={({pressed}) => [
              {
                opacity : pressed ? 0.3 : 1
              }
              ]}>
              <Text style={styles.customButton}>
                🚫
              </Text>
            </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    fontSize: 50,
    fontWeight: "600"
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  appContainer: {
    backgroundColor: '#edf7f5',
    flex: 1,
    paddingTop: 50,
    padding: 25,
  },
  // inputContainer: {
  //   flex: 1,
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  //   marginBottom: 24,
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#cccccc',
  // },
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
  // goalsContainer: {
  //   flex: 6
  // },
  // goalItem: {
  //   margin: 8,
  //   padding: 8,
  //   borderRadius: 6,
  //   backgroundColor: '#5e0acc',
  // },
  // goalText: {
  //   color: 'white',
  // },
  save_or_cancel: {
    flexDirection: "row",
    justifyContent: 'space-evenly',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  input: {
    fontFamily: 'Avenir-Book',
    flex: 1,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    fontSize: 20,
  },
});
