import { StatusBar } from 'expo-status-bar';
import {useState} from "react";
import { StyleSheet, Text, View, ScrollView, Button, TextInput} from 'react-native';

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
      dob = result.value
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
  let defaultTemp={text:''}

  let [temp,setTemp] = useState(defaultTemp); //We will store current being edited input's data and index

  // registers new state, set to empty string initially
  // enteredGoalText state can be updated with setEnteredGoalText function
  const [enteredGoalText, setEnteredGoalText] = useState('');

  // new state to add list of goals. typical case for using state is when some data dynamically changes
  // and with it, UI should be changed. initialized with empty array, initially no goals
  const [courseGoals, setCourseGoals] = useState([]);

  function getInputHandler(enteredText){
    setEnteredGoalText(enteredText);
  }
  function addGoalHandler(){
    /// ... is JS spread operator. keep content of courseGoals array, add enteredGoalText
    // setCourseGoals([...courseGoals, enteredGoalText]);

    // better way/best practice of above statement. use arrow function when new state depends on previous state.
    setCourseGoals(currentCourseGoals => [...currentCourseGoals, enteredGoalText]);
  }

  return (
    <View style={styles.appContainer}>
      <ScrollView>
        <Text style={styles.baseText}>
          <Text style={styles.sectionHeading}>
            My Profile
            {'\n'}
          </Text>
          <Text>
            Full Name:
            Age: {age + "\n"}
            Date of Birth: {dob.substring(0, 10) + '\n'}
          </Text>
          <View style={{flexDirection: "row"}}>
            <Text style = {styles.baseText}>
            Gender:
            </Text>
            
            <TextInput
              style={styles.textInput}
              placeholder={bio_sex}
              onFocus={() => setTemp({editingIndex: })}
            />
          </View>
          <Text>
            {'\n'}
            Height: {height}
            Home Address:
            Work Address:
            Favorite Place 1:
            Favorite Place 2:
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Avenir-Book',
    fontSize: 20,
    lineHeight: 40,
  },
  sectionHeading: {
    fontWeight: "bold",
    fontSize: 40,
    lineHeight: 50,
  },
  // container: {
  //   flex: 1,
  //   backgroundColor: '#fff',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  // },
  appContainer: {
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
});
