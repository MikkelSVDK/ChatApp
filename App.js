import Fire from './Fire';
import React from 'react';
import { AppRegistry } from 'react-native'
import auth, { firebase } from "@react-native-firebase/auth"
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

import SignInScreen from './modules/SignInScreen';
import ChatRoomListScreen from './modules/ChatRoomListScreen';
import ChatRoomScreen from './modules/ChatRoomScreen';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('app', () => App);

function DefaultScreen(){
  let user = firebase.auth().currentUser;
  if(user != null)
      return "ChatRoomList";
  return "SignIn";
}

const Stack = createStackNavigator();

async function saveTokenToDatabase(token) {
  let user = firebase.auth().currentUser;
  if(user != null){

    // Add the token to the users datastore
    await firestore()
      .collection('users')
      .doc(user.uid)
      .set({
        tokens: firestore.FieldValue.arrayUnion(token),
      }, {merge: true});
  }
}

export default class App extends React.Component {
  componentDidMount() {
    SplashScreen.hide();

    messaging()
      .getToken()
      .then(token => {
        return saveTokenToDatabase(token);
    });
    
    messaging().onTokenRefresh(token => {
      saveTokenToDatabase(token);
    });
  }

  render(){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={DefaultScreen()}>
          <Stack.Screen name="SignIn" animationEnabled="false" component={SignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatRoomList" animationEnabled="false" component={ChatRoomListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}
// options={{animationEnabled:false}}
/*const credentials = {
  clientId: '746354116982-3hstbknau7g3f68uu8ivvp6ore3rpc49.apps.googleusercontent.com',
  appId: '1:746354116982:android:f380ba66f38d2caedc5257',
  apiKey: 'AIzaSyCvEuwRgQinApgGnrc-i--VjqpJanDxyGs',
  databaseURL: 'https://hoc-chatapp.firebaseio.com/',
  storageBucket: 'hoc-chatapp.appspot.com',
  messagingSenderId: '746354116982',
  projectId: 'hoc-chatapp',
};

firebase.initializeApp(credentials);*/