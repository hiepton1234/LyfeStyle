import {initializeApp} from "firebase/app";
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth'

function RNFirebase() {
  // Initialize Firebase
    const firebaseConfig = {
      apiKey: "AIzaSyDhpG1bIG5aXbZhHHXIQTEnblRDzx2yZDU",
      authDomain: "cs125-708d8.firebaseapp.com",
      databaseURL: "https://cs125-708d8-default-rtdb.firebaseio.com",
      projectId: "cs125-708d8",
      storageBucket: "cs125-708d8.appspot.com",
      messagingSenderId: "59074829052",
      appId: "1:59074829052:web:5c7618bdfa29e5822d5579",
      measurementId: "G-X80PP1VQJ6"
    };

    initializeApp(firebaseConfig);
}

export { RNFirebase };
