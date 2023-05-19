import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from "react-native-chart-kit";


export function score(activity, activity_goal, sleep, sleep_goal, intake, intake_goal) {
  var a_dev = 100 * Math.abs((activity - activity_goal) / activity_goal);
  var s_dev = 100 * Math.abs((sleep - sleep_goal) / sleep_goal);
  var i_dev = 100 * Math.abs((intake - intake_goal) / intake_goal);

  return 100 - a_dev - s_dev - i_dev;

}

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.titleText}>Today's Lifestyle Score: {score(100,100,100,100,100,100)}</Text>
      <Text style={styles.smallerTitleText}>This Week's Lifestyle Scores</Text>
      <StatusBar style="auto" />

      <LineChart
        data={{
          labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

          datasets: [
            {
              data: [score(100,100,100,100,100,100),
                    score(50,100,75,100,90,100),
                    score(60,100,85,100,120,100),
                    score(100,100,75,100,90,100),
                    score(90,100,105,100,110,100),
                    score(50,100,75,100,100,100),
                    score(150,100,90,100,90,100),]
            }
          ]
        }}
        width={650} // from react-native
        height={400}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: "#e26a00",
          backgroundGradientFrom: "#2A4858",
          backgroundGradientTo: "#2A4858",
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: 16
          },
          propsForDots: {
            r: "6",
            strokeWidth: "2",
            stroke: "#A6B3BA"
          }
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText : {
    fontSize: 30,
    fontWeight: 'bold',
  },
  smallerTitleText : {
    fontSize: 20,
    textAlign: "left",
  },
});
