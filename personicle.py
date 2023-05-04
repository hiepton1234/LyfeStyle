# File: personicle.py

# Imports
import firebase_admin
from firebase_admin import credentials
from firebase_admin import db


class Personicle:
    def __init__(self):
        activity_level = 0
        sleep_level = 0
        food_intake = 0
        daily_life_events = 0

    def fetch_data(self):
        # Fetch the service account key JSON file contents
        cred = credentials.Certificate('/path/to/serviceAccountKey.json')  # replace with correct directory

        # Initialize the app with a service account, granting admin privileges
        firebase_admin.initialize_app(cred, {
            'databaseURL': 'https://<your-database-name>.firebaseio.com' # replace with correct directory
        })

        # Get a database reference to the root of your Firebase Realtime Database
        ref = db.reference('/')

        # Read the data at the root
        data = ref.get()

        # Print the data
        print(data)
