import React, { useState, useEffect } from 'react';
import { Alert, Modal, StyleSheet, Text, Pressable, View, ScrollView } from 'react-native';
import { Picker } from "@react-native-picker/picker";
import database from "@react-native-firebase/database";

function WorkoutRec() {
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedWorkoutType, setSelectedWorkoutType] = useState('');
    const [possibleWorkoutTypes, setPossibleWorkoutTypes] = useState([]);
    const [suggestedWorkouts, setSuggestedWorkouts] = useState([]);

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
            if (childSnapshot.val() != null && childSnapshot.val() !== "") {
                workouts.push(childSnapshot.val());
                // console.log("WORKOUT: " + childSnapshot.val())
            }
        });
        // console.log("WORKOUT ARRAY: " + workouts)
        return workouts;
    }

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
                    <View style={styles.pickerSection}>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.baseText, { paddingBottom: 10 }]}>What Workout Type?:</Text>
                        </View>
                    </View>

                    <Picker
                        style={{ flex: 1 }}
                        selectedValue={selectedWorkoutType}
                        onValueChange={(itemValue, itemIndex) =>
                            setSelectedWorkoutType(itemValue)
                        }>
                        {possibleWorkoutTypes.map((item, index) => (
                            <Picker.Item key={index} label={item} value={item} />
                        ))}
                    </Picker>

                    <Text style={[styles.baseText, { paddingTop: 10, paddingBottom: 10 }]}>Here Are Your{"\n"}Suggested Workouts:</Text>
                    <ScrollView style={{ height: 120 }}>
                        {suggestedWorkouts.map((workout, index) => (
                            <View key={index} style={styles.itemContainer}>
                                <Text style={styles.itemText}>{workout}</Text>
                            </View>
                        ))}
                    </ScrollView>

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
    baseText: {
        fontFamily: 'American Typewriter',
        fontSize: 20,
        textAlign: 'center',
        paddingTop: 10,
    },

    title: {
        fontFamily: 'American Typewriter',
        paddingBottom: 10,
        fontSize: 35,
        fontWeight: 'bold',
        textAlign: 'center',
    },

    appContainer: {
        backgroundColor: '#ffff',
        flex: 1,
        paddingTop: 50,
        padding: 25,
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

    pickerSection: {
        flexDirection: "row",
    },

    itemContainer: {
        backgroundColor: '#F2F2F2',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
    },

    itemText: {
        fontFamily: 'American Typewriter', // Set the desired font family
        fontSize: 16, // Set the desired font size
    },
});

export { WorkoutRec };
