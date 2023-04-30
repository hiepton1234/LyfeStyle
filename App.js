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
      }
  )
  AppleHealthKit.getLatestHeight(
    options,
      (callBackError, result) => {
        console.log(result)
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
        {/* holds input area where users can enter text for goal and click a button to add the goal*/}
        <View style={styles.inputContainer}>
          <TextInput
              style={styles.textInput}
              placeholder={'Your course goal!'}
              /* onChangeText listener will send text to getInputHandler as param*/
              onChangeText={getInputHandler}
          />
          <Button
              title={"Add goal"}
              onPress={addGoalHandler}
          />
        </View>
        {/*holds list of goals rendered*/}
        <View style={styles.goalsContainer}>
          <ScrollView>
            {/* output something dynamic by using {} */}
            {/* map method is a standard JS method that receives function which, as an argument/param, gets
          the individual values stored in courseGoals. function is called for each goal element in courseGoals array
          return the JSX element that should be rendered for the individual goal.
          value passed to key can be anything, but should uniquely identify the concrete value you are outputting.
          here we use goal, which is not necessarily unique, but we will make this better later. */}
            {courseGoals.map((goal) =>
                //   style and key now applied to View which is more versatile, so rounded corners will appear on iOS
                <View style={styles.goalItem} key={goal}>
                  {/*must add a style to child text component since styles do not cascade like CSS*/}
                  <Text style={styles.goalText}>
                    {goal}
                  </Text>
                </View>
            )}
          </ScrollView>
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContainer: {
    flex: 1,
    padding: 50,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cccccc",
    // in most places where you can set size as num pixels, you can also use percentages passed as a string
    // want this element to take up 80% of available width, defined by the container in which the element sits
    width: '70%',
    marginRight: 8,
    padding: 8,
  },
  goalsContainer: {
    flex: 6
  },
  goalItem: {
    margin: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#5e0acc',
  },
  goalText: {
    color: 'white',
  },
});
