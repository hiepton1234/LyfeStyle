import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';


function ScrollableBarChart({ data, width, height, chartConfig }) {
    return (
        <ScrollView horizontal={true}>
            <BarChart
                data={data}
                width={width}
                height={height}
                chartConfig={chartConfig}
                withInnerLines={false}
                bezier
            />
        </ScrollView>
    );
}

export default function App() {
    const chartData = useMemo(() => ({
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ data: [7.5, 8, 7, 6, 6.5, 9, 8.5] }],
    }), []);

    const chartConfig = {
        backgroundGradientFrom: '#f0f0f0',
        backgroundGradientTo: '#e0e0e0',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
        style: {
            borderRadius: 16,
        },
        barWidth: 20,
        barPercentage: 0.7,
        categoryPercentage: 0.2,
        yAxisInterval: 1,
        yAxisMinValue: 0,
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Personicle</Text>
            <Text style={styles.subtitle}>Sleep</Text>
            <View style={{ alignItems: 'center' }}>
                <ScrollableBarChart
                    data={chartData}
                    width={400}
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
    paddingTop: 70,
    marginBottom: 30,
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
