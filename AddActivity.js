import React, { useState } from 'react';
import {Alert, Modal, StyleSheet, Text, Pressable, View, TextInput, Dimensions} from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import InteractiveCalendar from './InteractiveCalendar';

const screenWidth = Dimensions.get('window').width;

function AddActivity(props) {
    const [modalVisible, setModalVisible] = useState(false);
    const [activity, setActivity] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [isStartTimePickerVisible, setStartTimePickerVisible] = useState(false);
    const [isEndTimePickerVisible, setEndTimePickerVisible] = useState(false);
    const [minEndTime, setMinEndTime] = useState(null);

    const handleActivityChange = (text) => {
        setActivity(text);
    };

    const handleStartTimeChange = (time) => {
        setStartTime(time);
        setStartTimePickerVisible(false);

        // Calculate the minimum end time by adding 1 minute to the start time
        const minEndTime = new Date(time);
        minEndTime.setMinutes(minEndTime.getMinutes() + 1);
        setMinEndTime(minEndTime);
    };

    const handleEndTimeChange = (time) => {
        setEndTime(time);
        setEndTimePickerVisible(false);
    };

    const handleAddActivity = () => {
        if (!activity || !startTime || !endTime || !selectedDate) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Create a new activity object
        const newActivity = {
            activity: activity,
            startTime: startTime,
            endTime: endTime,
            selectedDate: selectedDate,
        };

        // Add the new activity to the activities array
        props.activities.push(newActivity);
        // Print the updated activities array
        console.log("AddActivity.js:");
        props.activities.forEach((activity) => {
            console.log("Activity: " + activity.activity);
            console.log("Start Time: " + activity.startTime);
            console.log("End Time: " + activity.endTime);
            console.log("Selected Date: " + activity.selectedDate);
            console.log("------");
        });

        // Clear the input fields
        setActivity('');
        setStartTime('');
        setEndTime('');
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
    };

    const showStartTimePicker = () => {
        setStartTimePickerVisible(true);
    };

    const hideStartTimePicker = () => {
        setStartTimePickerVisible(false);
    };

    const showEndTimePicker = () => {
        setEndTimePickerVisible(true);
    };

    const hideEndTimePicker = () => {
        setEndTimePickerVisible(false);
    };

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
                    <Text style={styles.title}>Add Activities</Text>
                    <Text style={[styles.baseText, { paddingBottom: 5 }]}>Please Enter An Activity:</Text>
                    <View style={styles.tagContainer}>
                        <Text style={styles.tagText}>
                            Ensure the activity is something that does not allow with your sleep or workout. For example, work or school.
                        </Text>
                    </View>
                    <TextInput
                        style={styles.input}
                        value={activity}
                        onChangeText={handleActivityChange}
                        placeholder="Please enter an activity here"
                    />

                    <Text style={styles.baseText}>Start Time:</Text>
                    <Pressable onPress={showStartTimePicker}>
                        <Text style={{ color: '#64D2FF', fontFamily: 'American Typewriter', textAlign: 'center', fontSize: 17 }}>
                            {startTime ? startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select Start Time'}
                        </Text>
                    </Pressable>
                    {isStartTimePickerVisible && (
                        <DateTimePickerModal
                            isVisible={isStartTimePickerVisible}
                            mode="time"
                            onConfirm={handleStartTimeChange}
                            onCancel={hideStartTimePicker}
                        />
                    )}
                    <View style={{ paddingBottom: 20 }} />

                    <Text style={styles.baseText}>End Time:</Text>
                    <Pressable onPress={showEndTimePicker}>
                        <Text style={{ color: '#64D2FF', fontFamily: 'American Typewriter', textAlign: 'center', fontSize: 17 }}>
                            {endTime ? endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Select End Time'}
                        </Text>
                    </Pressable>
                    {isEndTimePickerVisible && (
                        <DateTimePickerModal
                            isVisible={isEndTimePickerVisible}
                            mode="time"
                            onConfirm={handleEndTimeChange}
                            onCancel={hideEndTimePicker}
                            minimumDate={minEndTime} // Set the minimum end time
                        />
                    )}
                    <View style={{ paddingBottom: 20 }} />

                    <Text style={styles.baseText}>Select Day:</Text>
                    <InteractiveCalendar onDateSelect={handleDateSelect} />
                    <View style={{ paddingBottom: 20 }} />

                    <View style={styles.buttonContainer}>
                        <Pressable style={[styles.button, styles.buttonClose]} onPress={handleAddActivity}>
                            <Text style={styles.textStyle}>Add</Text>
                        </Pressable>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}
                        >
                            <Text style={styles.textStyle}>Back</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Pressable style={[styles.button, styles.buttonOpen]} onPress={() => setModalVisible(true)}>
                <Text style={styles.textStyle}>Add Activity</Text>
            </Pressable>
            {isStartTimePickerVisible && (
                <DateTimePickerModal
                    isVisible={isStartTimePickerVisible}
                    mode="time"
                    onConfirm={handleStartTimeChange}
                    onCancel={hideStartTimePicker}
                />
            )}
            {isEndTimePickerVisible && (
                <DateTimePickerModal
                    isVisible={isEndTimePickerVisible}
                    mode="time"
                    onConfirm={handleEndTimeChange}
                    onCancel={hideEndTimePicker}
                />
            )}
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

    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
    },

    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    buttonOpen: {
        backgroundColor: '#64D2FF',
    },

    buttonClose: {
        backgroundColor: '#64D2FF',
        width: (screenWidth - 130) / 2,
    },

    textStyle: {
        fontFamily: 'American Typewriter',
        textAlign: 'center',
    },

    input: {
        width: screenWidth - 50,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 5,
        marginTop: 10,
        marginBottom: 10,
        paddingHorizontal: 10,
    },

    tagContainer: {
        backgroundColor: '#F0F0F0',
        borderRadius: 10,
        padding: 10,
    },

    tagText: {
        fontFamily: 'American Typewriter',
        fontSize: 14,
        color: '#555555',
        textAlign: 'center',
    },
});

export { AddActivity };
