import {BarChart, LineChart} from 'react-native-chart-kit';
import {useEffect, useMemo, useRef, useState} from "react";
import {Dimensions, Pressable, ScrollView, StatusBar, StyleSheet, Text, View} from 'react-native';
import {Profile} from './Profile'
import {HealthGoals} from "./HealthGoals";
import {FoodPage} from "./FoodPage";
import {WorkoutRec} from "./WorkoutRec"
import {AddActivity} from './AddActivity';
import {RNFirebase} from "./RNFirebase";
import database from "@react-native-firebase/database";
import auth from '@react-native-firebase/auth'
import {GoogleSignin, GoogleSigninButton, statusCodes} from '@react-native-google-signin/google-signin';
import AppleHealthKit, {HealthValue, HealthKitPermissions} from 'react-native-health'
import moment from "moment";

const screenWidth = Dimensions.get('window').width;

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

export function score(calories_burned, calories_burned_goal, sleep, sleep_goal, caloric_intake, caloric_intake_goal) {
    const calories_burned_dev = 100 * Math.abs((calories_burned - calories_burned_goal) / calories_burned_goal);
    const sleep_dev = 100 * Math.abs((sleep - sleep_goal) / sleep_goal);
    const caloric_intake_dev = 100 * Math.abs((caloric_intake - caloric_intake_goal) / caloric_intake_goal);

    return 100 - calories_burned_dev - sleep_dev - caloric_intake_dev;
}

// auth()
//   .signOut()
//   .then(() => console.log('User signed out!'));

export default function App() {
    const [height, setHeight] = useState(0);
    const [dob, setDob] = useState("");
    const [age, setAge] = useState(0);
    const [bio_sex, setBio_sex] = useState("");
    const [weight, setWeight] = useState(0);
    const [activities, setActivities] = useState([]);
    const scrollViewRef = useRef(null);

    const scrollToTop = () => {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
    };

    const lifescore_data = useMemo(() => ({
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
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

    RNFirebase()

    // Set an initializing state whilst Firebase connects
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();
    const [sleepChartData, setSleepChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [caloricChartData, setCaloricChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [caloriesBurnedChartData, setCaloriesBurnedChartData] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [workoutHoursChartData, setWorkoutHoursChartData] = useState([0, 0, 0, 0, 0, 0, 0]);

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

    const workout_hours_chart_data = useMemo(() => ({
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: workoutHoursChartData }],
    }), [workoutHoursChartData]);

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

  // const [location, setLocation] = useState(null)
  //
  // useEffect(() => {
  //   (async () => {
  //     let { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       console.log('Location permission denied');
  //       return;
  //     }
  //
  //     let location = await Location.getCurrentPositionAsync({});
  //     setLocation(location)
  //     // console.log(location.coords.latitude, location.coords.longitude);
  //   })();
  // }, []);
  //
  // if (location === null) {
  //   return null
  // }

    // Function to determine if two dates are within the same week (Sunday to Saturday)
    function inSameWeek(firstDay, secondDay) {
        const firstMoment = moment(firstDay);
        const secondMoment = moment(secondDay);

        const startOfWeek = function (_moment, _offset) {
            return _moment.clone().startOf('week').add(_offset, 'days');
        };

        return startOfWeek(firstMoment, -1).isSame(startOfWeek(secondMoment, -1), 'day');
    }

    const daysDict = {
        "Sunday": 0,
        "Monday": 1,
        "Tuesday": 2,
        "Wednesday": 3,
        "Thursday": 4,
        "Friday": 5,
        "Saturday": 6
    };

    useEffect(() => {
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
                        let hours = 0
                        // Step 3: Calculate hours
                        if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
                            hours = 24 - (start.getHours() + (start.getMinutes() / 60) + (start.getSeconds() / 3600));
                        } else {
                            hours = (end.getHours() + (end.getMinutes() / 60) + (end.getSeconds() / 3600)) - (start.getHours() + (start.getMinutes() / 60) + (start.getSeconds() / 3600));
                        }
                        // console.log("HOURS: " + hours)

                        // Adding hours to respective day
                        daysOfWeek[daysDict[day]] += hours;
                    } else { return true; }
                });

                // console.log("Sleep reading done!")
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
                    // console.log("START DATE: " + start)
                    // console.log("TODAY: " + new Date())

                    // console.log(inSameWeek(start, new Date()))
                    // Determining if the day is on the same week
                    if (inSameWeek(start, new Date())) {
                        // Step 2: Get the day from the start date
                        const options = { weekday: 'long' };
                        const day = start.toLocaleDateString('en-US', options).split(',')[0];
                        // console.log("DAY: " + day)

                        // Adding calories to respective day
                        daysOfWeek[daysDict[day]] += childSnapshot.val().value;
                        // console.log("Calories: " + childSnapshot.val().value);
                        // console.log("daysOfWeek: " + daysOfWeek);
                    } else { return true; }
                });

                // console.log("Calorie reading done!")
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
                    // console.log("START DATE: " + start)
                    // console.log("TODAY: " + new Date())

                    // console.log(inSameWeek(start, new Date()))
                    // Determining if the day is on the same week
                    if (inSameWeek(start, new Date())) {
                        // Step 2: Get the day from the start date
                        const options = { weekday: 'long' };
                        const day = start.toLocaleDateString('en-US', options).split(',')[0];
                        // console.log("DAY: " + day)

                        // Adding calories to respective day
                        daysOfWeek[daysDict[day]] += childSnapshot.val().value;
                        // console.log("Calories: " + childSnapshot.val().value);
                        // console.log("daysOfWeek: " + daysOfWeek);
                    } else { return true; }
                });

                // console.log("Calories Burned reading done!")
                setCaloriesBurnedChartData(daysOfWeek);
            } catch (error) {
                console.log("ERROR DETECTED FETCHING ENERGY BURNED SAMPLES: " + error)
            }
        };

        const fetchWorkoutHoursData = async (currentUser) => {
            try {
                const newReference = database().ref('user/' + currentUser.uid + '/Health Info/Active Energy Burned');
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
                        let hours = 0
                        // Step 3: Calculate hours
                        if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
                            hours = 24 - (start.getHours() + (start.getMinutes() / 60) + (start.getSeconds() / 3600));
                        } else {
                            hours = (end.getHours() + (end.getMinutes() / 60) + (end.getSeconds() / 3600)) - (start.getHours() + (start.getMinutes() / 60) + (start.getSeconds() / 3600));
                        }
                        // console.log("HOURS: " + hours)

                        // Adding hours to respective day
                        daysOfWeek[daysDict[day]] += hours;
                    } else { return true; }
                });

                // console.log("Workout hours reading done!")
                setWorkoutHoursChartData(daysOfWeek);
            } catch (error) {
                console.log("ERROR DETECTED FETCHING WORKOUT HOURS SAMPLES: " + error)
            }
        };

        const fetchActivitiesData = async (currentUser) => {
            try {
                const newReference = database().ref(
                    'user/' + currentUser.uid + '/Activities'
                );

                newReference.on('value', (snapshot) => {
                    let activityArr = [];
                    snapshot.forEach((childSnapshot) => {
                        const newActivity = {
                            activity: childSnapshot.val().activity,
                            startTime: childSnapshot.val().startTime,
                            endTime: childSnapshot.val().endTime,
                            selectedDate: childSnapshot.val().selectedDate
                        };

                        activityArr.push(newActivity);
                    });

                    setActivities(activityArr);
                    console.log("Activities updated!");
                });
            } catch (error) {
                console.log("ERROR DETECTED FETCHING ACTIVITIES SAMPLES: " + error);
            }
        };

        const onAuthStateChanged = (user) => {
            setUser(user);
            if (initializing) setInitializing(false);
            if (user) {
                fetchSleepData(user)
                    .then(() => {
                        // Sleep data fetching completed
                        // console.log('Sleep data fetched');
                    })
                    .catch((error) => {
                        console.log('Error fetching sleep data: ', error);
                    });

                fetchCaloricData(user)
                    .then(() => {
                        // Caloric data fetching completed
                        // console.log('Caloric data fetched');
                    })
                    .catch((error) => {
                        console.log('Error fetching caloric data: ', error);
                    });

                fetchCaloriesBurnedData(user)
                    .then(() => {
                        // Calories burned data fetching completed
                        // console.log('Calories burned data fetched');
                    })
                    .catch((error) => {
                        console.log('Error fetching calories burned data: ', error);
                    });

                fetchWorkoutHoursData(user)
                    .then(() => {
                        // Workout hours data fetching completed
                        // console.log('Workout hours data fetched');
                    })
                    .catch((error) => {
                        console.log('Error fetching workout hours data: ', error);
                    });

                fetchActivitiesData(user)
                    .then(() => {
                        // Activities data fetching completed
                        console.log('Activities data fetched');
                    })
                    .catch((error) => {
                        console.log('Error fetching workout hours data: ', error);
                    });
            }
        };

        GoogleSignin.getCurrentUser()
            .then((currentUser) => {
                onAuthStateChanged(currentUser);
            })
            .catch((error) => {
                console.log('Error getting current user:', error);
            });

        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        return () => {
            subscriber(); // unsubscribe on unmount
        };
    }, []);

    if (initializing) return null;

    if (!user) {
        return (
            <View style={styles.centeredView}>
            <Text style={styles.baseText}>Please Login</Text>
            <GoogleSigninButton
                style={{ width: 192, height: 48 }}
                size={GoogleSigninButton.Size.Wide}
                color={GoogleSigninButton.Color.Dark}
                onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
            />
            </View>
        );
    }

    // GoogleSignin.getCurrentUser()
    const newReference = database().ref('user/' + user.uid)

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
        // console.log(result[0])
        newReference.child("Health Info/Sleep Samples")
            .set(result)
        },
    )

    AppleHealthKit.getBiologicalSex(
      options,
      (callBackError, result) => {
        // console.log(result)
        setBio_sex(result.value)

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
        setHeight(result.value)

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
        setWeight(result.value)

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
        setDob(result.value.substring(0, 10))
        setAge(result.age)

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
    //         console.log(result[0])
    //     }
    // )

    return (
        <>
            <StatusBar barStyle="dark-content" />
            <View style={styles.centeredView}>
                <Text style={[styles.title, { paddingTop: 20, paddingBottom: 10, fontSize: 35 }]}>Lyfestyle</Text>

                <ScrollView
                    ref={scrollViewRef}
                    contentContainerStyle={styles.scrollView}
                >
                    <Text style={styles.title}>Today's Lifestyle Score: {score(100,100,100,100,100,100)}</Text>
                    <Text style={styles.baseText}>Current Week's Lifestyle Scores</Text>
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
                        user={user}
                        age={age}
                        dob={dob}
                        bio_sex={bio_sex}
                        height={height}
                    />
                    {/*{console.log(calculateMaintenanceCalories(age, bio_sex, height, weight))}*/}
                    <HealthGoals
                        user={user}
                        age={age}
                        dob={dob}
                        bio_sex={bio_sex}
                        height={height}
                    />

                    <FoodPage
                      user = {user}
                      age={age}
                      bio_sex={bio_sex}
                      height={height}
                      weight ={weight}
                      // latitude = {location.coords.latitude}
                      // longitude = {location.coords.longitude}
                      // personalModel = {personalModel} replace when we have one
                    />

                    <WorkoutRec
                        user={user}
                    />

                    <AddActivity
                        user={user}
                        // fetchActivitiesData={fetchActivitiesData}
                    />

                    {/*Personicle*/}
                    <View style={styles.centeredView}>
                        <Text style={styles.title}>Personicle</Text>

                        {/*<ScrollView contentContainerStyle={styles.scrollView}>*/}
                        <Text style={styles.baseText}>Sleep</Text>
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

                        <Text style={styles.baseText}>Caloric Intake</Text>
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

                        <Text style={styles.baseText}>Calories Burned</Text>
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

                        <Text style={styles.baseText}>Workout Hours</Text>
                        <BarChart
                            data={workout_hours_chart_data}
                            width={screenWidth}
                            height={250}
                            yAxisSuffix=" Hrs"
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

                        <Text style={[styles.baseText, { marginBottom: 5 }]}>Activities For Today</Text>
                        {activities.length === 0 ? (
                            <View style={styles.itemContainer}>
                                <Text style={[styles.itemText, { textAlign: 'center', fontWeight: 'bold' }]}>
                                    No Activities Registered!
                                </Text>
                            </View>
                        ) : (
                            <>
                                {(() => {
                                    const filteredActivities = activities.filter((activity) => {
                                        const today = new Date();
                                        const selectedDate = new Date(activity.selectedDate);
                                        
                                        // console.log("TODAY: ", today)
                                        // console.log("SELECTED DATE: ", selectedDate)

                                        today.setUTCHours(0, 0, 0, 0);
                                        selectedDate.setUTCHours(0, 0, 0, 0);

                                        // console.log("IS SAME DAY?: " + (today.getTime() === selectedDate.getTime()))
                                        return today.getTime() === selectedDate.getTime();
                                    });

                                    if (filteredActivities.length === 0) {
                                        return (
                                            <View style={styles.itemContainer}>
                                                <Text style={[styles.itemText, { textAlign: 'center', fontWeight: 'bold' }]}>
                                                    No Activities For Today!
                                                </Text>
                                            </View>
                                        );
                                    } else {
                                        return (
                                            <ScrollView style={[styles.scrollView, { maxHeight: 250 }]}>
                                                {filteredActivities.map((activity, index) => (
                                                    <View key={index} style={styles.itemContainer}>
                                                        <Text style={styles.itemText}>
                                                            Activity: <Text style={{ fontWeight: 'bold' }}>{activity.activity}</Text>
                                                            {'\n'}
                                                            Start Time: <Text style={{ fontWeight: 'bold' }}>{activity.startTime}</Text>
                                                            {'\n'}
                                                            End Time: <Text style={{ fontWeight: 'bold' }}>{activity.endTime}</Text>
                                                            {/*{'\n'}*/}
                                                            {/*Selected Date: <Text style={{ fontWeight: 'bold' }}>{activity.selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}</Text>*/}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                        );
                                    }
                                })()}
                            </>
                        )}

                        {/* "Back to Top" button */}
                        <Pressable style={styles.button} onPress={scrollToTop}>
                            <Text style={styles.textStyle}>Back to Top</Text>
                        </Pressable>
                    </View>
                </ScrollView>
            </View>
            <View style={{ paddingBottom: 50 }} />
        </>
    );
}

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },

    title: {
        fontSize: 24,
        paddingBottom: 10,
        color: '#000000',
        fontWeight: 'bold',
        textAlign: 'center',
        fontFamily: 'American Typewriter',
    },

    baseText: {
        fontSize: 16,
        marginTop: 10,
        marginBottom: 10,
        color: '#000000',
        textAlign: 'center',
        fontFamily: 'American Typewriter',
    },

    scrollView: {
        height: 'auto',
    },

    activitiesContainer: {
        backgroundColor: '#e0e0e0',
        width: screenWidth,
    },

    itemContainer: {
        width: screenWidth,
        backgroundColor: '#F2F2F2',
        padding: 13,
        marginVertical: 5,
        borderRadius: 5,
    },

    itemText: {
        fontFamily: 'American Typewriter', // Set the desired font family
        fontSize: 16, // Set the desired font size
    },

    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        backgroundColor: '#64D2FF',
        width: screenWidth - 50,
        marginTop: 40,
    },

    textStyle: {
        fontFamily: 'American Typewriter',
        textAlign: 'center',
    },
});
