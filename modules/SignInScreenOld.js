/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component, useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, ScrollView, View, Text, Button, StatusBar } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-community/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk';

GoogleSignin.configure({
    webClientId: '746354116982-3hstbknau7g3f68uu8ivvp6ore3rpc49.apps.googleusercontent.com',
});

function GoogleSignInButton() {
    return (
        <Button
        title="Google Sign-In"
        onPress={() => onGoogleButtonPress().then(() => console.log('Signed in with Google!'))}
        />
    );
}

async function onGoogleButtonPress() {
  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(googleCredential);
}

async function onFacebookButtonPress() {
  // Attempt login with permissions
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

  if (result.isCancelled) {
      throw 'User cancelled the login process';
  }

  // Once signed in, get the users AccesToken
  const data = await AccessToken.getCurrentAccessToken();

  if (!data) {
      throw 'Something went wrong obtaining access token';
  }

  // Create a Firebase credential with the AccessToken
  const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

  // Sign-in the user with the credential
  return auth().signInWithCredential(facebookCredential);
}
// import { GoogleSignIn }  from './android/app/src/main/res/components/SignIn/GoogleSignIn';
 
/*import { StackNavigator } from 'react-navigation';
 
 
export default MyProject = StackNavigator(
{
 
 First: { screen: MainActivity },
 
 Second: { screen: SecondActivity }
 
});*/

const credentials = {
  clientId: '746354116982-lj34rddjinuh2h53san7rc5o1otlv7mn.apps.googleusercontent.com',
  appId: '1:746354116982:android:f380ba66f38d2caedc5257',
  apiKey: 'AIzaSyCvEuwRgQinApgGnrc-i--VjqpJanDxyGs',
  databaseURL: 'https://hoc-chatapp.firebaseio.com/',
  storageBucket: 'hoc-chatapp.appspot.com',
  messagingSenderId: '746354116982',
  projectId: 'hoc-chatapp',
};

firebase.initializeApp(credentials);

import { Colors } from 'react-native/Libraries/NewAppScreen';

function FacebookSignIn() {
  return (
    <Button
      title="Facebook Sign-In"
      onPress={() => onFacebookButtonPress().then(() => console.log('Signed in with Facebook!'))}
    />
  );
}

function SignOutButton(){
  return (
    <Button
      title="Sign out"
      onPress={() => onSignOutPress()}
    />
  );
}

function onSignOutPress(){
  auth()
    .signOut()
    .then(() => console.log('User signed out!'));
}

function LoginApp() {
  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  // Handle user state changes
  function onAuthStateChanged(user) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return null;

  if (!user) {
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.centerText}>Sign in to get access</Text>
      </View>
    );
  }

  return (
    <View style={styles.sectionContainer}>
      <Text style={styles.centerText}>Welcome {user.email}</Text>
    </View>
  );
};

export default class SignInScreen extends Component {
  componentDidMount() {
    // google and facebook sign in
    
    SplashScreen.hide();
  }

  render(){
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <SafeAreaView>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <View style={styles.body}>
              <LoginApp />
              <View style={styles.sectionContainer}>
                <GoogleSignInButton />
              </View>
              <View style={styles.sectionContainer}>
                <FacebookSignIn />
              </View>
              <View style={styles.sectionContainer}>
                <SignOutButton />
              </View>
              {/*<View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Step One</Text>
                <Text style={styles.sectionDescription}>
                  Edit <Text style={styles.highlight}>App.js</Text> to change this
                  screen and then come back to see your edits.
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>See Your Changes</Text>
                <Text style={styles.sectionDescription}>
                  <ReloadInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Debug</Text>
                <Text style={styles.sectionDescription}>
                  <DebugInstructions />
                </Text>
              </View>
              <View style={styles.sectionContainer}>
                <Text style={styles.sectionTitle}>Learn More</Text>
                <Text style={styles.sectionDescription}>
                  Read the docs to discover what to do next:
                </Text>
              </View>*/ }
            </View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }
};

/*const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: Colors.white,
  },
  engine: {
    position: 'absolute',
    right: 0,
  },
  body: {
    backgroundColor: Colors.white,
  },
  sectionContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  centerText: {
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
*/