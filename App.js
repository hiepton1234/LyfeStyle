import { StatusBar } from 'expo-status-bar';
import {useState, useEffect} from "react";
import {StyleSheet, Text, View, Modal, ScrollView, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import {Profile} from './Profile'
import {HealthGoals} from "./HealthGoals";
import {FoodPage} from "./FoodPage";
import { initializeApp } from 'firebase/app';
import {RNFirebase} from "./RNFirebase";
import database from "@react-native-firebase/database";

import auth from '@react-native-firebase/auth'
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '',
});

function GoogleSignIn() {
  return (
    <Button
      title="Google Sign-In"
      onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
    />
  );
}

async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
}

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

let height = 0;
let dob = "";
let age = 0;
let bio_sex = "";
// likely change once authentication is figured out
const newReference = database().ref('user/').push();

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
        newReference.child("Health Info/Sleep Samples")
          .set(result)
    },
  )
  AppleHealthKit.getBiologicalSex(
      options,
      (callBackError, result) => {
        console.log(result)
        bio_sex = result.value

        newReference.child("Health Info")
          .update({
            bio_sex : bio_sex
          })
      }
  )
  AppleHealthKit.getLatestHeight(
    options,
      (callBackError, result) => {
        console.log(result)
        height = result.value

        newReference.child("Health Info")
          .update({
            height : height
          })
    }
  )
    AppleHealthKit.getDailyStepCountSamples(
      options,
      (callBackError, result) => {
        console.log(result[0])
        newReference.child("Health Info/Step Counts")
          .set(
            result.slice(0, 90)
          )
      }
    )
  AppleHealthKit.getLatestWeight(
    options,
    (callBackError, result) => {
      console.log(result)

      newReference.child("Health Info")
        .update({
          weight : result
        })
    }
  )
  AppleHealthKit.getDateOfBirth(
    options,
    (callbackError, result) => {
        console.log(result)
      dob = result.value.substring(0, 10)
      age = result.age
      newReference.child("Health Info")
        .update({
          dob : dob,
          age : age
        })
    }
  )

  AppleHealthKit.getActiveEnergyBurned(
    options,
    (callbackError, result) => {
      console.log(result[0])
      newReference.child("Health Info/Active Energy Burned")
        .set(
          result
        )
    }
  )

    AppleHealthKit.getEnergyConsumedSamples(
      options,
      (callbackError, result) => {
        console.log(result[0])

        newReference.child("Health Info/Energy Consumed Samples")
          .set(
            result
          )
      }
    )
    AppleHealthKit.getProteinSamples(
      options,
      (callbackError, result) => {
        console.log(result[0])

        newReference.child("Health Info/Protein Samples")
          .set(
            result
          )
      }
    )
    // AppleHealthKit.getClinicalRecords(
    //     options,
    //     (callbackError, result) => {
    //         console.log(result[0])
    //     }
    // )
})

auth()
  .createUserWithEmailAndPassword('jane.doe@example.com', 'SuperSecretPassword!')
  .then(() => {
    console.log('User account created & signed in!');
  })
  .catch(error => {
    if (error.code === 'auth/email-already-in-use') {
      console.log('That email address is already in use!');
    }

    if (error.code === 'auth/invalid-email') {
      console.log('That email address is invalid!');
    }

    console.error(error);
  });

export default function App() {
  RNFirebase()
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <View style={styles.centeredView}>
        <Text>Login</Text>
      </View>
    );
  }

  return (
    <View style={styles.centeredView}>
      <Text>Welcome {user.email}</Text>
      <Profile
        age={age}
        dob={dob}
        bio_sex={bio_sex}
        height={height}
      />
      <HealthGoals
        age={age}
        dob={dob}
        bio_sex={bio_sex}
        height={height}/>
      <FoodPage
        // personalModel = {personalModel} replace when we have one
      />
    </View>
  );
}

const styles = StyleSheet.create({
  baseText: {
    fontFamily: 'Avenir-Book',
    fontSize: 20,
    lineHeight: 40,
    marginRight: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
});
