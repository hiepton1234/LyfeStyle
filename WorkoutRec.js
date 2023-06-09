import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, ScrollView } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import database from "@react-native-firebase/database";

function WorkoutRec({ user }) {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorkoutType, setSelectedWorkoutType] = useState('');
    const [possibleWorkoutTypes, setPossibleWorkoutTypes] = useState([]);
    const [suggestedWorkouts, setSuggestedWorkouts] = useState([]);
    const [weightGoal, setWeightGoal] = useState('');

    useEffect(() => {
        fetchWorkoutTypes()
            .then((result) => {
                setPossibleWorkoutTypes(result);
                if (result.length > 0) {
                    setSelectedWorkoutType(result[0]); // Set the initial workout type
                }
            })
            .catch((error) => {
                console.error("Error fetching workout types:", error);
            });
    }, []);

    useEffect(() => {
        if (modalVisible && selectedWorkoutType) {
            fetchWorkouts(selectedWorkoutType)
                .then((workouts) => {
                    setSuggestedWorkouts(workouts);
                })
                .catch((error) => {
                    console.error("Error fetching workouts:", error);
                });
        }
    }, [modalVisible, selectedWorkoutType]);

    async function fetchWorkoutTypes() {
        const ref = database().ref('Exercises');
        const snapshot = await ref.once('value');
        const types = [];

        snapshot.forEach((childSnapshot) => {
            types.push(childSnapshot.key);
        });

        return types;
    }

    async function fetchWorkouts(type) {
        const ref = database().ref('Exercises/' + type);
        const snapshot = await ref.once('value');
        const workouts = [];

        snapshot.forEach((childSnapshot) => {
            const goals = childSnapshot.val().Goals;
            if (goals.includes(weightGoal)) {

                const workout = {
                    exercise: childSnapshot.key,
                    intensity: childSnapshot.val().Intensity
                };

                workouts.push(workout);
            }
        });

        // console.log(workouts)
        return workouts;
    }

    useEffect(() => {
        const fetchWeightGoal = async (user) => {
            try {
                const newReference = database().ref('user/' + user.uid + '/goals/weightGoal');
                newReference.on('value', (snapshot) => {
                    const goal = snapshot.val();
                    setWeightGoal(goal); // Update the state with the fetched goal value
                });
            } catch (error) {
                console.log("ERROR DETECTED FETCHING USER'S WEIGHT GOAL: " + error);
            }
        };

        fetchWeightGoal(user)
            .then(() => {
                // Handle the resolution here if needed
                // console.log("Weight goal fetch completed.");
            })
            .catch((error) => {
                // Handle any errors that occurred during the fetch
                console.log("Error fetching weight goal: " + error);
            });

        // Cleanup function to detach the event listener when the component unmounts
        return () => {
            const newReference = database().ref('user/' + user.uid + '/goals/weightGoal');
            newReference.off('value');
        };
    }, []);


    return (
        <View style={styles.centeredView}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    Alert.alert('Modal has been closed.');
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={styles.appContainer}>
                    <Text style={styles.title}>Workouts</Text>
                    <Text style={[styles.baseText, { paddingBottom: 5 }]}>
                        Weight Goal:
                        <Text style={{ fontWeight: 'bold' }}> {weightGoal}</Text>
                    </Text>

                    <Text style={styles.baseText}>Workout Type:</Text>
                    <Picker
                        style={{ flex: 1 }}
                        selectedValue={selectedWorkoutType}
                        onValueChange={(itemValue, itemIndex) =>
                            setSelectedWorkoutType(itemValue)
                        }
                        itemStyle={styles.pickerItem} // Set the custom style for Picker items
                    >
                        {possibleWorkoutTypes.map((item, index) => (
                            <Picker.Item key={index} label={item} value={item} />
                        ))}
                    </Picker>

                    <Text style={[styles.baseText, { paddingTop: 40, paddingBottom: 10 }]}>
                        Here Are Suggested Workouts{'\n'}For Your Weight Goal:
                    </Text>
                    {suggestedWorkouts.length > 0 ? (
                        <ScrollView style={{ height: 150 }}>
                            {suggestedWorkouts.map((workout, index) => (
                                <View key={index} style={[styles.itemContainer, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                                    <Text style={styles.itemText}>{workout.exercise}</Text>
                                    <Text style={[styles.itemText, { textAlign: 'right' }]}>{workout.intensity}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={{ height: 315 }}>
                            <View style={styles.itemContainer}>
                                <Text style={[styles.itemText, { textAlign: 'center' }]}>
                                    Sorry, there are no workouts{'\n'}for your weight goal
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={{ paddingBottom: 20 }}></View>

                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => setModalVisible(!modalVisible)}>
                        <Text style={styles.textStyle}>Back</Text>
                    </Pressable>
                    <View style={{ paddingBottom: 10 }}></View>
                </View>
            </Modal>
            <Pressable
                style={[styles.button, styles.buttonOpen]}
                onPress={() => setModalVisible(true)}>
                <Text style={styles.textStyle}>Workouts</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    appContainer: {
        backgroundColor: '#ffff',
        flex: 1,
        paddingTop: 50,
        padding: 25,
    },

    title: {
        fontFamily: 'American Typewriter',
        paddingBottom: 10,
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    baseText: {
        fontFamily: 'American Typewriter',
        fontSize: 20,
        textAlign: 'center',
        paddingTop: 10,
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
    },

    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },

    buttonOpen: {
        backgroundColor: '#64D2FF',
    },

    buttonClose: {
        backgroundColor: '#64D2FF',
    },

    textStyle: {
        fontFamily: 'American Typewriter',
        textAlign: 'center',
    },

    item: {
        flexDirection: "row",
    },

    itemContainer: {
        backgroundColor: '#F2F2F2',
        padding: 13,
        marginVertical: 5,
        borderRadius: 5,
    },

    itemText: {
        fontFamily: 'American Typewriter', // Set the desired font family
        fontSize: 16, // Set the desired font size
    },

    pickerItem: {
        fontFamily: 'American Typewriter',
        fontSize: 18,
    },

    scrollView: {
        height: 'auto',
    },
});

export { WorkoutRec };
