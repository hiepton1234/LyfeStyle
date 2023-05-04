import React, { useMemo } from 'react';
import {BarChart, ContributionGraph} from 'react-native-chart-kit';
import { StatusBar } from 'expo-status-bar';
import {useState} from "react";
import {StyleSheet, Text, View, Modal, ScrollView, Dimensions, TextInput, Pressable, KeyboardAvoidingView} from 'react-native';
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

const screenWidth = Dimensions.get('window').width;

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


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Personicle</Text>

            <ScrollView contentContainerStyle={styles.scrollView}>
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
                <BarChart
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
                    style={{ paddingBottom: 30}}
                />
                <Text style={styles.subtitle}>Calories Burned</Text>
                <BarChart
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
                    style={{ paddingBottom: 30 }}
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
                    style={{ paddingBottom: 30 }}
                />

                <Text style={styles.subtitle}>Daily Activities</Text>
                <ScrollView horizontal={true}>
                    <ContributionGraph
                        values={commitsData}
                        endDate={new Date("2017-04-01")}
                        width={screenWidth}
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
            </ScrollView>
          <Profile
            age={age}
            dob={dob}
            bio_sex={bio_sex}
            height={height}
          >

          </Profile>
        </View>
    );


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    title: {
        fontSize: 24,
        paddingTop: 50,
        marginBottom: 10,
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'Times New Roman',
    },

    subtitle: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 10,
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'Times New Roman',
    },
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
