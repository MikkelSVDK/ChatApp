import React, { useState, useEffect } from 'react';
import { View, Image, Text, Button, StyleSheet } from 'react-native';
import auth, { firebase } from "@react-native-firebase/auth";

export default class ChatRoomList extends React.Component {
    componentDidMount() {
        auth().onAuthStateChanged((user) => {
            if(!user)
                this.props.navigation.navigate('SignIn')
        });
    }

    render(){
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{marginVertical: 5}}>
                    <Button
                        title="Go to ChatRoom 42"
                        onPress={() => {
                        /* 1. Navigate to the Details route with params */
                        this.props.navigation.navigate('ChatRoom', {
                            chatRoomId: 42,
                            chatName: 'ChatRoom 42',
                        });
                        }}
                    />
                </View>
                <View style={{marginVertical: 5}}>
                    <Button
                        title="Go to ChatRoom 86"
                        onPress={() => {
                        /* 1. Navigate to the Details route with params */
                        this.props.navigation.navigate('ChatRoom', {
                            chatRoomId: 86,
                            chatName: 'ChatRoom 86',
                        });
                        }}
                    />
                </View>
                <View style={{marginVertical: 5}}>
                    <Button
                        title="Sign out"
                        onPress={() => auth().signOut()}
                    />
                </View>
            </View>
        );
    }
}