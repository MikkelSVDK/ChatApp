import React, { Component } from 'react';
import { View, Text, Button } from 'react-native'
import auth, { firebase } from "@react-native-firebase/auth"
import SplashScreen from 'react-native-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import SignInScreen from './modules/SignInScreen';
import ChatRoomListScreen from './modules/ChatRoomListScreen';
import ChatRoomScreen from './modules/ChatRoomScreen';

/*const AppNavigator = createStackNavigator({
  SignIn: SignInActivity
},{
  headerMode: "none"
});

export default createAppContainer(AppNavigator);*/

function DefaultScreen(){
  let user = firebase.auth().currentUser;
  if(user != null)
      return "ChatRoomList";
  return "SignIn";
}

const Stack = createStackNavigator();

export default class App extends React.Component {
  componentDidMount() {
    SplashScreen.hide();
  }

  render(){
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName={DefaultScreen()}>
          <Stack.Screen name="SignIn" animationEnabled="false" component={SignInScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatRoomList" animationEnabled="false" component={ChatRoomListScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ChatRoom" component={ChatRoomScreen} options={{
          headerRight: () => (
            <View style={{marginRight: 10}}><Button title="Sign-out" onPress={() => auth().signOut()} /></View>
          ),
        }} />
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