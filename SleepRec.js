import database from "@react-native-firebase/database";
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-react-native';
import {bundleResourceIO} from "@tensorflow/tfjs-react-native";

console.warn = () => {};

var tf_data = {"last": 420,
             "duration": 420,
             "exercise": 0,
             "height": 170,
             "age": 25,
             "gender": 0};

export function sleep(user){
  p_data = getData(user);
  predict(p_data);
  return "11:45 PM";
}

function set_tf_data(k, v){
    tf_data[k] = v;
}

function fetchSleepData(uid) {
    const getSleep = () => {database()
        .ref('user/' + uid + '/Health Info/Sleep Samples/')
        .limitToLast(1)
        .once('value')
        .then(function(snapshot) {
            if (snapshot.exists()) {
                var s_val = snapshot.val();
                for(var key in s_val){
                    var millis = (new Date(s_val[key]["endDate"])) - (new Date(s_val[key]["startDate"]));
                    set_tf_data("last", millis/60000);
                    set_tf_data("duration", );
                }
            }
        });
    };

    const getExercise = () => {database()
        .ref('user/' + uid + '/Health Info/Active Energy Burned/')
        .limitToLast(1)
        .once('value')
        .then(function(snapshot) {
            if (snapshot.exists()) {
                var s_val = snapshot.val();
                for(var key in s_val){
                    var millis = (new Date(s_val[key]["endDate"])) - (new Date(s_val[key]["startDate"]));
                    set_tf_data("exercise", millis/60000);
                }
            }
        });
    };

    const getHeight = () => {database()
        .ref('user/' + uid + '/Health Info/height/')
        .once('value')
        .then(function(snapshot) {
            if (snapshot.exists()) {
                set_tf_data("height", snapshot.val());
            }
        });
    };

    const getAge = () => {database()
        .ref('user/' + uid + '/Health Info/age/')
        .once('value')
        .then(function(snapshot) {
            if (snapshot.exists()) {
                set_tf_data("age", snapshot.val());
            }
        });
    };

    const getGender = () => {database()
        .ref('user/' + uid + '/Health Info/bio_sex/')
        .once('value')
        .then(function(snapshot) {
            if (snapshot.exists()) {
                set_tf_data("gender", (snapshot.val()=='male' ? 0:1));
            }
        });
    };

    getSleep();
    getExercise();
    getHeight();
    getAge();
    getGender();
}

async function formatData (last, exercise, duration, height, age, gender) {
    await tf.ready();
    return tf.tensor([age, height, gender, last, duration, exercise], dateType='float32');
}

function getData(user) {
    fetchSleepData(user.uid);
    return formatData(  tf_data["last"],
                        tf_data["exercise"],
                        tf_data["duration"],
                        tf_data["height"],
                        tf_data["age"],
                        tf_data["gender"]);
}

async function loadModel() {
  const modelJSON = require("./Recommender/sleep_tf/model.json");
  const modelWeights = require("./Recommender/sleep_tf/group1-shard1of1.bin");
  const model = await tf
    .loadLayersModel(bundleResourceIO(modelJSON, modelWeights))
    .catch(e => console.log(e));
  console.log("Model loaded!");
  return model;
};

async function predict(p_data) {
   const model = loadModel();
   const predictions = model.detect(tf.randomNormal([6, 1]));
   console.log(predictions);
}
