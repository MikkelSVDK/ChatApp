import React from 'react';
import { View, Image, Text, Button, StyleSheet } from 'react-native';
import auth, { firebase } from "@react-native-firebase/auth"
import { GoogleSignin } from '@react-native-community/google-signin';
import { LoginManager, AccessToken } from 'react-native-fbsdk';
import FlashMessage, { showMessage, hideMessage } from "react-native-flash-message";

GoogleSignin.configure({
  webClientId: '746354116982-3hstbknau7g3f68uu8ivvp6ore3rpc49.apps.googleusercontent.com',
});

function GoogleSignInButton() {
  return (
    <Button
      title="Google Sign-In"
      onPress={() => onGoogleSignInButtonPress().catch((e) => showMessage({message: e.toString(), type: "danger"}))}
    />
  );
}

async function onGoogleSignInButtonPress() {
  const { idToken } = await GoogleSignin.signIn();
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);
  return auth().signInWithCredential(googleCredential);
}

function FacebookSignInButton() {
  return (
    <Button
      title="Facebook Sign-In"
      onPress={() => onFacebookSignInButtonPress().catch((e) => showMessage({message: e, type: "danger"}))}
    />
  );
}

async function onFacebookSignInButtonPress() {
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);
  
  if (result.isCancelled)
    throw 'Log ind annuleret';
  
  const data = await AccessToken.getCurrentAccessToken();
  if(!data)
    throw "Der skete en uventet fejl";
  
  const facebookCredential = auth.FacebookAuthProvider.credential(data.accessToken);
  return auth().signInWithCredential(facebookCredential);
}

export default class SignIn extends React.Component {
  componentDidMount(){
    auth().onAuthStateChanged((user) => {
      if(user)
        this.props.navigation.navigate('ChatRoomList')
    });

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