import React from 'react';
import { View, Image, Text, Button, StyleSheet } from 'react-native';
import auth, { firebase } from "@react-native-firebase/auth"
import { GoogleSignin } from '@react-native-community/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import FlashMessage, { showMessage } from "react-native-flash-message";

// Sætter google login op med en client key
GoogleSignin.configure({
  webClientId: '746354116982-hcrkafvh95lpb9vhvcqg3f138t8l4vfi.apps.googleusercontent.com',
});

// function til at retunere Google login knappen
function GoogleSignInButton() {
  return (
    <Button
      title="Google Sign-In"
      onPress={() => onGoogleSignInButtonPress().catch((e) => showMessage({message: e.toString(), type: "danger"}))}
    />
  );
}

// Når brugeren klikker på Google login knappen
async function onGoogleSignInButtonPress() {
  // Henter en token fra Google
  const { idToken } = await GoogleSignin.signIn();

  // Henter brugerdata fra Google med token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  // Logger ind med Google brugerdata
  return auth().signInWithCredential(googleCredential);
}

// Function til at retunere Facebook login knappen
function FacebookSignInButton() {
  return (
    <Button
      title="Facebook Sign-In"
      onPress={() => onFacebookSignInButtonPress().catch((e) => showMessage({message: e, type: "danger"}))}
    />
  );
}

// Når brugeren klikker på Facebook login knappen
async function onFacebookSignInButtonPress() {
  // Loader auth screen med facebook
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  
  if (result.isCancelled)
    throw 'Log ind annuleret';
  
  const data = await AccessToken.getCurrentAccessToken();
  if(!data)
    throw "Der skete en uventet fejl";
  
  // Henter brygerdata fra Facebook
  const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);

  // Logger ind med Facebook brugerdata
  return auth().signInWithCredential(facebookCredential);
}

export default class SignIn extends React.Component {
  componentDidMount(){
    // Skifter skærm så snart brugeren er logget ind (Der forventes at man ikke er logget ind og er på denne skærm)
    auth().onAuthStateChanged((user) => {
      if(user)
        this.props.navigation.navigate('ChatRoomList')
    });

    // Hvis denne skærm loader og man er logget ind, sendes man videre til ChatRum listen
    if(firebase.auth().currentUser)
      this.props.navigation.navigate('ChatRoomList')
  }
  render(){
    return (
      <View style={styles.container}>
        <Image 
          source={require("../assets/hoc_logo.png")}
          style={styles.logo} />
        <Text style={styles.text}>ChatApp</Text>
        <View style={styles.containerPadding}>
          <GoogleSignInButton />
        </View>
        <View style={styles.containerPadding}>
          <FacebookSignInButton />
        </View>
        <FlashMessage position="top" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 20
  },
  logo: {
    alignSelf: "center"
  },
  text: {
    alignSelf: "center",
    marginTop: -50,
    fontSize: 30,
    fontFamily: "sans-serif-thin",
    marginBottom: 10
  },
  containerPadding: {
    paddingVertical: 5
  }
});