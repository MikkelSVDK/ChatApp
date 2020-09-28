import React, { useState, useEffect } from 'react'
import auth, { firebase } from "@react-native-firebase/auth"
import { Button, StyleSheet, KeyboardAvoidingView } from 'react-native'
import { GiftedChat } from 'react-native-gifted-chat'
import Fire from '../Fire'

export default class ChatRoom extends React.Component {
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
        this.props.navigation.setOptions({headerTitle: this.props.route.params.chatName});

        auth().onAuthStateChanged((user) => {
            if(!user)
                this.props.navigation.navigate('SignIn')
        });

        //console.log(this.props.route.params.chatRoomId);

        Fire.get(message => 
            this.setState(previous => ({
                messages: GiftedChat.append(previous.messages, message)
            })), "chatroom-" + this.props.route.params.chatRoomId
        );
    }

    componentWillUnmount(){
        Fire.off("chatroom-" + this.props.route.params.chatRoomId);
    }

    render(){
        return (
            <KeyboardAvoidingView style={{flex: 1}} enabled>
                <GiftedChat messages={this.state.messages} onSend={(m) => Fire.send(m, "chatroom-" + this.props.route.params.chatRoomId)} user={this.user} />
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
        paddingVertical: 5,
    }
});