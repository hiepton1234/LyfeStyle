import { StatusBar } from 'expo-status-bar';
import React, {useMemo, useState} from 'react';
import {LineChart, BarChart, ContributionGraph} from 'react-native-chart-kit';
import {StyleSheet, Text, View, ScrollView, Dimensions, Modal, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
import {Profile} from './Profile'
import {HealthGoals} from "./HealthGoals";
import { initializeApp } from 'firebase/app';
import {RNFirebase} from "./RNFirebase";
import database from "@react-native-firebase/database";

const screenWidth = Dimensions.get('window').width;

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



export function score(activity, activity_goal, sleep, sleep_goal, intake, intake_goal) {
    var a_dev = 100 * Math.abs((activity - activity_goal) / activity_goal);
    var s_dev = 100 * Math.abs((sleep - sleep_goal) / sleep_goal);
    var i_dev = 100 * Math.abs((intake - intake_goal) / intake_goal);

    return 100 - a_dev - s_dev - i_dev;
}

export default function App() {
    const sleep_chart_data = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [7.5, 8, 7, 6, 6.5, 9, 8.5] }],
    }), []);

    const caloric_chart_data = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [2490, 2505, 2510, 2485, 2498, 2502, 2515] }],
    }), []);

    const caloric_lost_chart_data = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [408, 429, 471, 488, 403, 416, 452] }],
    }), []);

    const workout_hours_chart_data = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [2.45, 5.34, 6.87, 0.72, 3.12, 1.89, 6.57] }],
    }), []);

    const commitsData = [
        { date: "2017-01-02", count: 1 },
        { date: "2017-01-03", count: 2 },
        { date: "2017-01-04", count: 3 },
        { date: "2017-01-05", count: 4 },
        { date: "2017-01-06", count: 5 },
        { date: "2017-01-30", count: 2 },
        { date: "2017-01-31", count: 3 },
        { date: "2017-03-01", count: 2 },
        { date: "2017-04-02", count: 4 },
        { date: "2017-03-05", count: 2 },
        { date: "2017-02-30", count: 4 }
    ];

    RNFirebase()

    return (
        <View style={styles.centeredView}>
            <Text style={styles.textStyle}>Lyfestyle</Text>

            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.title}>Today's Lifestyle Score: {score(100,100,100,100,100,100)}</Text>
                <Text style={styles.subtitle}>This Week's Lifestyle Scores</Text>
                <StatusBar style="auto" />

                <LineChart
                    data={{
                        labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

                        datasets: [
                            {
                                data: [score(100,100,100,100,100,100),
                                    score(50,100,75,100,90,100),
                                    score(60,100,85,100,120,100),
                                    score(100,100,75,100,90,100),
                                    score(90,100,105,100,110,100),
                                    score(50,100,75,100,100,100),
                                    score(150,100,90,100,90,100),]
                            }
                        ]
                    }}
                    // width={650} // from react-native
                    width={screenWidth} // from react-native
                    height={400}
                    yAxisLabel=""
                    yAxisSuffix=""
                    yAxisInterval={1} // optional, defaults to 1
                    chartConfig={{
                        backgroundColor: "#e26a00",
                        backgroundGradientFrom: "#2A4858",
                        backgroundGradientTo: "#2A4858",
                        decimalPlaces: 0, // optional, defaults to 2dp
                        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        style: {
                            borderRadius: 16
                        },
                        propsForDots: {
                            r: "6",
                            strokeWidth: "2",
                            stroke: "#A6B3BA"
                        }
                    }}
                    bezier
                    style={{
                        marginVertical: 8,
                        borderRadius: 16
                    }}
                />

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

                {/*Personicle*/}
                <View style={styles.centeredView}>
                    <Text style={styles.title}>Personicle</Text>

                    {/*<ScrollView contentContainerStyle={styles.scrollView}>*/}
                        <Text style={styles.subtitle}>Sleep</Text>
                        <BarChart
                            data={sleep_chart_data}
                            width={screenWidth}
                            height={250}
                            yAxisSuffix=" Hrs"
                            chartConfig={{
                                backgroundGradientFrom: '#f0f0f0',
                                backgroundGradientTo: '#e0e0e0',
                                decimalPlaces: 1,
                                barPercentage: 0.6,
                                color: (opacity = 1) => `rgba(0, 153, 204, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            style={{ paddingBottom: 30 }}
                        />

                        <Text style={styles.subtitle}>Caloric Intake</Text>
                        <LineChart
                            data={caloric_chart_data}
                            width={screenWidth}
                            height={250}
                            chartConfig={{
                                backgroundGradientFrom: '#f0f0f0',
                                backgroundGradientTo: '#e0e0e0',
                                decimalPlaces: 1,
                                barPercentage: 0.6,
                                color: (opacity = 1) => `rgba(34, 139, 34, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            style={{ paddingBottom: 20}}
                        />

                        <Text style={styles.subtitle}>Calories Burned</Text>
                        <LineChart
                            data={caloric_lost_chart_data}
                            width={screenWidth}
                            height={250}
                            chartConfig={{
                                backgroundGradientFrom: '#f0f0f0',
                                backgroundGradientTo: '#e0e0e0',
                                decimalPlaces: 1,
                                barPercentage: 0.6,
                                color: (opacity = 1) => `rgba(255, 0, 56, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            style={{ paddingBottom: 20 }}
                        />

                        <Text style={styles.subtitle}>Workout Hours</Text>
                        <BarChart
                            data={workout_hours_chart_data}
                            width={screenWidth}
                            height={250}
                            chartConfig={{
                                backgroundGradientFrom: '#f0f0f0',
                                backgroundGradientTo: '#e0e0e0',
                                decimalPlaces: 1,
                                barPercentage: 0.6,
                                color: (opacity = 1) => `rgba(150, 60, 170, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            }}
                            style={{ paddingBottom: 40 }}
                        />

                        <Text style={styles.subtitle}>Daily Activities</Text>
                        <ScrollView horizontal={true}>
                            <ContributionGraph
                                values={commitsData}
                                endDate={new Date("2017-04-01")}
                                width={screenWidth + 280}
                                height={220}
                                showMonthLabels={true}
                                chartConfig={{
                                    backgroundGradientFrom: "#f0f0f0",
                                    backgroundGradientTo: "#e0e0e0",
                                    color: (opacity = 1) => `rgba(5, 105, 107, ${opacity})`,
                                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                }}
                                style={{ paddingBottom: 50 }}
                            />
                        </ScrollView>
                </View>
            </ScrollView>
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
        paddingTop: 20,
        paddingBottom: 20,
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

    title: {
        fontSize: 24,
        marginBottom: 10,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'American Typewriter',
    },

    subtitle: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 10,
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'American Typewriter',
    }
});
