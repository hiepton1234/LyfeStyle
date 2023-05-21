import { StatusBar } from 'expo-status-bar';
import {useState} from "react";
import {StyleSheet, Text, View, Modal, ScrollView, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import {Profile} from './Profile'
import {HealthGoals} from "./HealthGoals";
import {Personicle} from "./Personicle";
import { initializeApp } from 'firebase/app';
import {RNFirebase} from "./RNFirebase";
import database from "@react-native-firebase/database";

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

export default function App() {

  RNFirebase()

  return (
    <View style={styles.centeredView}>
        <Text style={styles.textStyle}>Lyfestyle</Text>

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
        height={height}
      />

      <Personicle
      />
    </View>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },

  textStyle: {
      fontFamily: 'American Typewriter',
      paddingTop: 50,
      fontSize: 35,
      fontWeight: 'bold',
      textAlign: 'center',
  },

  baseText: {
      fontFamily: 'Avenir-Book',
      fontSize: 20,
      lineHeight: 40,
      marginRight: 10,
  },
});
