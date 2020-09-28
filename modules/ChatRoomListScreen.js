import React, { useState, useEffect } from 'react';
import { View, Image, Text, Button, StyleSheet } from 'react-native';

export default class ChatRoomList extends React.Component {
    render(){
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text>Home Screen</Text>
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
            </View>
        );
    }
}