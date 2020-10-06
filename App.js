import Fire from './Fire';
import React from 'react';
import { AppRegistry } from 'react-native'
import { firebase } from "@react-native-firebase/auth"
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

// FOrskellige skærme
import SignInScreen from './modules/SignInScreen';
import ChatRoomListScreen from './modules/ChatRoomListScreen';
import ChatRoomScreen from './modules/ChatRoomScreen';

// Hvis notifikation skal gøre noget i baggrunden (Giver warning uden)
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent('app', () => App);

// Skifter til Chatroom listen hvis bruger er logget ind
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

    // Tilføjer notifikationstoken til firestore hvis bruger er logget ind
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
    SplashScreen.hide(); // Gemmer loading screen væk

    // First time noti token
    messaging()
      .getToken()
      .then(token => {
        return saveTokenToDatabase(token);
    });
    
    // Hvis noti token refresher
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