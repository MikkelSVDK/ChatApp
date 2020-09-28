import React, { useState, useEffect } from 'react'
import auth, { firebase } from "@react-native-firebase/auth"
import { View, Text, Button, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'
import Fire from '../Fire'

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

export default class SignInActivity extends React.Component {
    state = {
        messages: []
    }

    get user(){
        return {
            _id: Fire.uid,
            name: Fire.displayName
        }
    }

    componentDidMount() {
        auth().onAuthStateChanged((user) => {
            if(!user)
                this.props.navigation.navigate('SignIn')
        });

        Fire.get(message => 
            this.setState(previous => ({
                messages: GiftedChat.append(previous.messages, message)
            }))
        );
    }

    componentWillUnmount(){
        Fire.off();
    }

    render(){
        return (
            <KeyboardAvoidingView style={{flex: 1}} enabled>
                <GiftedChat messages={this.state.messages} onSend={Fire.send} user={this.user} />
            </KeyboardAvoidingView>
        );
        /*return (
            <View style={styles.container}>
                <View style={styles.containerPadding}>
                    <Text>Hello, World!</Text>
                </View>
                <View style={styles.containerPadding}>
                    <SignOutButton />
                </View>
                <View style={styles.containerPadding}>
                    <Button title="Go to Signin Screen" onPress={() => this.props.navigation.navigate('SignIn')} />
                </View>
            </View>
        );*/
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    containerPadding: {
        paddingVertical: 5
    }
});