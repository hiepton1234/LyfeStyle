import { StatusBar } from 'expo-status-bar';
import {useState} from "react";
import {StyleSheet, Text, View, Modal, ScrollView, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import {Profile} from './Profile'

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
  return (
    <Profile
      age={age}
      dob={dob}
      bio_sex={bio_sex}
      height={height}
    >

    </Profile>
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
