import React, { useMemo } from 'react';
import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import {BarChart, ContributionGraph} from 'react-native-chart-kit';


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
        </View>
    );
}


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
});