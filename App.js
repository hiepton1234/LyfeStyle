import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { BarChart } from 'react-native-chart-kit';


  export default function App() {
    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [{
          data: [7.5, 8, 7, 6, 6.5, 9, 8.5],
        }],
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Personicle</Text>
      <Text style={styles.subtitle}>Sleep</Text>
        <View style={{ alignItems: 'center' }}>
            <ScrollView horizontal={true}>
                <BarChart
                    data={data}
                    width={700} // adjust the width of the chart to fit the screen
                    height={250}
                    chartConfig={{
                        backgroundGradientFrom: '#f0f0f0',
                        backgroundGradientTo: '#e0e0e0',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                    withInnerLines={false}
                    bezier
                />
            </ScrollView>
        </View>
      <StatusBar style="auto" />
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
