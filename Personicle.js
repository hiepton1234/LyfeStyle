import React, {useMemo, useState} from 'react';
import {LineChart, BarChart, ContributionGraph} from 'react-native-chart-kit';
import {StyleSheet, Text, View, ScrollView, Dimensions, Alert, Pressable, Modal} from 'react-native';

const screenWidth = Dimensions.get('window').width;

function Personicle(props) {
    const [modalVisible, setModalVisible] = useState(false);

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
                <View style={styles.centeredView}>
                    <View style={styles.appContainer}>
                        <Text style={styles.title}>Personicle</Text>

                        <ScrollView contentContainerStyle={styles.scrollView}>
                            <Text style={styles.subtitle}>Sleep</Text>
                            <ScrollView horizontal>
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
                            </ScrollView>

                            <Text style={styles.subtitle}>Caloric Intake</Text>
                            <ScrollView horizontal>
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
                            </ScrollView>

                            <Text style={styles.subtitle}>Calories Burned</Text>
                            <ScrollView horizontal>
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
                            </ScrollView>

                            <Text style={styles.subtitle}>Workout Hours</Text>
                            <ScrollView horizontal>
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
                            </ScrollView>

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
                        </ScrollView>
                        <Pressable
                            style={[styles.button, styles.buttonClose]}
                            onPress={() => setModalVisible(!modalVisible)}>
                            <Text style={styles.textStyle}>Back</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
            <Pressable
                style={[styles.button, styles.buttonOpen]}
                onPress={() => setModalVisible(!modalVisible)}>
                <Text style={styles.textStyle}>Show Personicle</Text>
            </Pressable>
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
        fontSize: 24,
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

    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
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
    }
});

export {Personicle};
