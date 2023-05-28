import {LineChart, BarChart, ContributionGraph} from 'react-native-chart-kit';
import {useState, useMemo, useEffect} from "react";
import {StyleSheet, Text, View, Dimensions, ScrollView} from 'react-native';
import {Profile} from './Profile'
import {HealthGoals} from "./HealthGoals";
import {FoodPage} from "./FoodPage";
import {RNFirebase} from "./RNFirebase";
import database from "@react-native-firebase/database";
import moment from "moment";

const screenWidth = Dimensions.get('window').width;

import auth from '@react-native-firebase/auth'
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  scopes: ['https://www.googleapis.com/auth/drive.readonly'], // what API you want to access on behalf of the user, default is email and profile
  webClientId: '59074829052-q49bld4qcc0jidkt1rus9ibpd6urf9dk.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  hostedDomain: '', // specifies a hosted domain restriction
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId: '59074829052-6g77ov31173fhj5ggbdesprd3schp6uu.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

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




export function score(activity, activity_goal, sleep, sleep_goal, intake, intake_goal) {
    var a_dev = 100 * Math.abs((activity - activity_goal) / activity_goal);
    var s_dev = 100 * Math.abs((sleep - sleep_goal) / sleep_goal);
    var i_dev = 100 * Math.abs((intake - intake_goal) / intake_goal);

    return 100 - a_dev - s_dev - i_dev;
}

// auth()
//   .signOut()
//   .then(() => console.log('User signed out!'));

export default function App() {
    const lifescore_data = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
            data: [score(100, 100, 100, 100, 100, 100),
                score(50, 100, 75, 100, 90, 100),
                score(60, 100, 85, 100, 120, 100),
                score(100, 100, 75, 100, 90, 100),
                score(90, 100, 105, 100, 110, 100),
                score(50, 100, 75, 100, 100, 100),
                score(150, 100, 90, 100, 90, 100),]
        }]
    }), []);

    // const sleep_chart_data = useMemo(() => ({
    //     labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    //     datasets: [{ data: [7.5, 8, 7, 6, 6.5, 9, 8.5] }],
    // }), []);

    // const caloric_chart_data = useMemo(() => ({
    //     labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    //     datasets: [{ data: [2490, 2505, 2510, 2485, 2498, 2502, 2515] }],
    // }), []);

    // const calories_burned_chart_data = useMemo(() => ({
    //     labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    //     datasets: [{ data: [408, 429, 471, 488, 403, 416, 452] }],
    // }), []);

    const workout_hours_chart_data = useMemo(() => ({
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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

    // Set an initializing state whilst Firebase connects
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();
    const [sleepChartData, setSleepChartData] = useState([]);
    const [caloricChartData, setCaloricChartData] = useState([]);
    const [caloriesBurnedChartData, setCaloriesBurnedChartData] = useState([]);

    const sleep_chart_data = useMemo(() => ({
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: sleepChartData }],
    }), [sleepChartData]);

    const caloric_chart_data = useMemo(() => ({
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: caloricChartData }],
    }), [caloricChartData]);

    const calories_burned_chart_data = useMemo(() => ({
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: caloriesBurnedChartData }],
    }), [caloriesBurnedChartData]);

    async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const user = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(user.idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

    useEffect(() => {
        const daysDict = {
          "Sunday": 0,
          "Monday": 1,
          "Tuesday": 2,
          "Wednesday": 3,
          "Thursday": 4,
          "Friday": 5,
          "Saturday": 6
        };

        const fetchSleepData = async (currentUser) => {
            try {
                const newReference = database().ref('user/' + currentUser.uid + '/Health Info/Sleep Samples');
                const snapshot = await newReference.once('value');
                // console.log(currentUser)

                // Array for sleep hours
                let daysOfWeek = Array(7).fill(0);

                snapshot.forEach((childSnapshot) => {
                    // Step 1: Parse the timestamp into a Date object
                    const start = new Date(childSnapshot.val().startDate);
                    const end = new Date(childSnapshot.val().endDate);
                    // console.log("START DATE: " + start)
                    // console.log("END DATE: " + end)
                    // console.log("IN SAME WEEK?: " + inSameWeek(start, new Date()))

                    // Determining if the day is on the same week
                    if (inSameWeek(start, new Date())) {
                        // Step 2: Get the day from the start date
                        const options = { weekday: 'long' };
                        const day = start.toLocaleDateString('en-US', options).split(',')[0];
                        // console.log("DAY: " + day)

                        // Step 3: Calculate hours
                        const hours = (end.getHours() + (end.getMinutes() / 60) + (end.getSeconds() / 3600)) - (start.getHours() + (start.getMinutes() / 60) + (start.getSeconds() / 3600));
                        // console.log("HOURS: " + hours)

                        // Adding hours to respective day
                        daysOfWeek[daysDict[day]] += hours;
                    } else { return true; }
                });

                console.log("Sleep reading done!")
                setSleepChartData(daysOfWeek);
            } catch (error) {
                console.log("ERROR DETECTED FETCHING SLEEP SAMPLES: " + error)
            }
        };

        const fetchCaloricData = async (currentUser) => {
            try {
                const newReference = database().ref('user/' + currentUser.uid + '/Health Info/Energy Consumed Samples');
                const snapshot = await newReference.once('value');
                // console.log(currentUser)

                // Array for sleep hours
                let daysOfWeek = Array(7).fill(0);

                snapshot.forEach((childSnapshot) => {
                    // Step 1: Parse the timestamp into a Date object
                    const start = new Date(childSnapshot.val().startDate);
                    console.log("START DATE: " + start)
                    console.log("TODAY: " + new Date())

                    console.log(inSameWeek(start, new Date()))
                    // Determining if the day is on the same week
                    if (inSameWeek(start, new Date())) {
                        // Step 2: Get the day from the start date
                        const options = { weekday: 'long' };
                        const day = start.toLocaleDateString('en-US', options).split(',')[0];
                        console.log("DAY: " + day)

                        // Adding calories to respective day
                        daysOfWeek[daysDict[day]] += childSnapshot.val().value;
                        console.log("Calories: " + childSnapshot.val().value);
                        console.log("daysOfWeek: " + daysOfWeek);
                    } else { return true; }
                });

                console.log("Calorie reading done!")
                setCaloricChartData(daysOfWeek);
            } catch (error) {
                console.log("ERROR DETECTED FETCHING CALORIC SAMPLES: " + error)
            }
        };

        const fetchCaloriesBurnedData = async (currentUser) => {
            try {
                const newReference = database().ref('user/' + currentUser.uid + '/Health Info/Active Energy Burned');
                const snapshot = await newReference.once('value');
                // console.log(currentUser)

                // Array for sleep hours
                let daysOfWeek = Array(7).fill(0);

                snapshot.forEach((childSnapshot) => {
                    // Step 1: Parse the timestamp into a Date object
                    const start = new Date(childSnapshot.val().startDate);
                    console.log("START DATE: " + start)
                    console.log("TODAY: " + new Date())

                    console.log(inSameWeek(start, new Date()))
                    // Determining if the day is on the same week
                    if (inSameWeek(start, new Date())) {
                        // Step 2: Get the day from the start date
                        const options = { weekday: 'long' };
                        const day = start.toLocaleDateString('en-US', options).split(',')[0];
                        console.log("DAY: " + day)

                        // Adding calories to respective day
                        daysOfWeek[daysDict[day]] += childSnapshot.val().value;
                        console.log("Calories: " + childSnapshot.val().value);
                        console.log("daysOfWeek: " + daysOfWeek);
                    } else { return true; }
                });

                console.log("Calories Burned reading done!")
                setCaloriesBurnedData(daysOfWeek);
            } catch (error) {
                console.log("ERROR DETECTED FETCHING ENERGY BURNED SAMPLES: " + error)
            }
        };

    const onAuthStateChanged = (user) => {
        setUser(user);
        if (initializing) setInitializing(false);
        fetchSleepData(user)
        fetchCaloricData(user)
        fetchCaloriesBurnedData(user)
    };

    GoogleSignin.getCurrentUser();

    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    fetchSleepData();
    fetchCaloricData();
    fetchCaloriesBurnedLostData();

    return () => {
      subscriber(); // unsubscribe on unmount
    };
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <View style={styles.centeredView}>
        <Text style={styles.subtitle}>Please Login</Text>
        <GoogleSigninButton
          style={{ width: 192, height: 48 }}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
        />
      </View>
    );
  }

  GoogleSignin.getCurrentUser()
  const newReference = database().ref('user/' + user.uid)

  AppleHealthKit.initHealthKit(permissions, (error) => {
    /* Called after we receive a response from the system */

    if (error) {
      // console.log('[ERROR] Cannot grant permissions!')
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
        // console.log(result[0])
        newReference.child("Health Info/Sleep Samples")
          .set(result)
      },
    )
    AppleHealthKit.getBiologicalSex(
      options,
      (callBackError, result) => {
        // console.log(result)
        bio_sex = result.value

        newReference.child("Health Info")
          .update({
            bio_sex: bio_sex
          })
      }
    )
    AppleHealthKit.getLatestHeight(
      options,
      (callBackError, result) => {
        // console.log(result)
        height = result.value

        newReference.child("Health Info")
          .update({
            height: height
          })
      }
    )
    AppleHealthKit.getDailyStepCountSamples(
      options,
      (callBackError, result) => {
        // console.log(result[0])
        newReference.child("Health Info/Step Counts")
          .set(
            result.slice(0, 90)
          )
      }
    )
    AppleHealthKit.getLatestWeight(
      options,
      (callBackError, result) => {
        // console.log(result)

        newReference.child("Health Info")
          .update({
            weight: result
          })
      }
    )
    AppleHealthKit.getDateOfBirth(
      options,
      (callbackError, result) => {
        // console.log(result)
        dob = result.value.substring(0, 10)
        age = result.age
        newReference.child("Health Info")
          .update({
            dob: dob,
            age: age
          })
      }
    )

    AppleHealthKit.getActiveEnergyBurned(
      options,
      (callbackError, result) => {
        // console.log(result[0])
        newReference.child("Health Info/Active Energy Burned")
          .set(
            result
          )
      }
    )

    AppleHealthKit.getEnergyConsumedSamples(
      options,
      (callbackError, result) => {
        // console.log(result[0])

        newReference.child("Health Info/Energy Consumed Samples")
          .set(
            result
          )
      }
    )
    AppleHealthKit.getProteinSamples(
      options,
      (callbackError, result) => {
        // console.log(result[0])

        newReference.child("Health Info/Protein Samples")
          .set(
            result
          )
      }
    )
    }
  )
  // AppleHealthKit.getClinicalRecords(
  //     options,
  //     (callbackError, result) => {
  //         // console.log(result[0])
  //     }
  // )

    // Function to determine if two dates are within the same week (Sunday to Saturday)
    function inSameWeek(firstDay, secondDay) {
        const firstMoment = moment(firstDay);
        const secondMoment = moment(secondDay);

        const startOfWeek = function (_moment, _offset) {
            return _moment.clone().startOf('week').add(_offset, 'days');
        };

        return startOfWeek(firstMoment, -1).isSame(startOfWeek(secondMoment, -1), 'day');
    }

    return (
      <View style={styles.centeredView}>
        <Text style={styles.textStyle}>Lyfestyle</Text>

        <ScrollView contentContainerStyle={styles.scrollView}>
            <Text style={styles.title}>Today's Lifestyle Score: {score(100,100,100,100,100,100)}</Text>
            <Text style={styles.subtitle}>Current Week's Lifestyle Scores</Text>
            <LineChart
                data={lifescore_data}
                width={screenWidth}
                height={250}
                chartConfig={{
                    backgroundGradientFrom: '#f0f0f0',
                    backgroundGradientTo: '#e0e0e0',
                    decimalPlaces: 1,
                    barPercentage: 0.6,
                    color: (opacity = 1) => `rgba(255, 153, 0, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                }}
                style={{ paddingTop: 10}}
            />

          <Profile
            user = {user}
            age={age}
            dob={dob}
            bio_sex={bio_sex}
            height={height}
          />
          <HealthGoals
            user = {user}
            age={age}
            dob={dob}
            bio_sex={bio_sex}
            height={height}/>
          <FoodPage
            // personalModel = {personalModel} replace when we have one
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
                data={calories_burned_chart_data}
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
