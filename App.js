import React, { useMemo } from 'react';
import {StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const xAxis = {
    name: 'Months',
    fontSize: 14,
    fontWeight: 'bold',
    fontColor: '#333',
};

export default function App() {
    const chartData = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [7.5, 8, 7, 6, 6.5, 9, 8.5] }],
    }), []);

    const chartConfig = {
        backgroundGradientFrom: '#f0f0f0',
        backgroundGradientTo: '#e0e0e0',
        decimalPlaces: 2,
        color: (opacity = 1) => `rgba(5, 105, 107, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        barWidth: 20,
        barPercentage: 0.6,
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Personicle</Text>
            <Text style={styles.subtitle}>Sleep</Text>
            <View>
                <BarChart
                    data={chartData}
                    width={screenWidth}
                    height={250}
                    chartConfig={chartConfig}
                />
            </View>
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
        fontFamily: 'Times New Roman',
    },
});