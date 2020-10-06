import Fire from '../Fire';
import React from 'react';
import { View, FlatList, SafeAreaView, RefreshControl, StyleSheet, Text, TouchableOpacity, Button } from 'react-native';
import auth from "@react-native-firebase/auth";
import { Icon } from 'react-native-elements';
import database from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import FlashMessage, { showMessage } from "react-native-flash-message";

export default class ChatRoomList extends React.Component {
    // Henter alle chatrooms fra firestore database
    getAvailableChatRooms = async () => {
        var chatRoom = [];
        await database().ref("chatroom").orderByChild("last_message").once('value').then(function(snapshot) {
            for (const property in snapshot.val()){
                chatRoom.push({
                    chatRoomId: property,
                    chatName: snapshot.val()[property].name || "NONE",
                    chatDescription: snapshot.val()[property].description || "NONE",
                    last_message: snapshot.val()[property].last_message
                });
            }
        });

        // Sotere chatrummene efter nyeste besked, siden .orderByChild("last_message") ikke ser ud til at gøre det
        const sorted = chatRoom.sort(function(a, b) {
            return a.last_message - b.last_message;
        })

        // Soteringen retunere ascending så det reverses 
        this.setState(() => {
            return {chatRooms: sorted.reverse()}
        });
    }

    // Default state
    state = {
        chatRooms: [],
        refreshing: true
    };

    // Pull to refesh 
    onRefresh = () => {
        this.setState(() => {return {refreshing: true}});
        this.getAvailableChatRooms().then(() => {
            this.setState(() => {return {refreshing: false}});
        });
    }

    componentDidMount() {
        // Hvis brugeren logger ud sendes de til login skærmen
        auth().onAuthStateChanged((user) => {
            if(!user)
                this.props.navigation.navigate('SignIn')
        });

        // Hvis de sidder i chatroom listen og modtager en noti vises den med showMessage func.
        messaging().onMessage(async remoteMessage => {
            showMessage({onPress: () => this.props.navigation.navigate('ChatRoom', {chatRoomId: remoteMessage.data.chatRoomId, chatName: remoteMessage.data.chatName}), message: remoteMessage.notification.title, duration: 5000, type: "info"});
        });

        // Notifikations handler når de klikker på noti uden for appen. (Sender brugeren til det rigtige chatrum)
        messaging().onNotificationOpenedApp(remoteMessage => {
            this.props.navigation.navigate('ChatRoom', {chatRoomId: remoteMessage.data.chatRoomId, chatName: remoteMessage.data.chatName});
        });

        // Kalder chatroom func og sætter refreshing til false
        this.getAvailableChatRooms().then(() => {
            this.setState(() => {return {refreshing: false}});
        });
    }

    render(){
        // Func til at render hver chatroom som en TouchableOpacity
        function Item({ navigation, id, title, description, date }) {
            return (
                <TouchableOpacity
                  style={styles.chatRooms}
                  onPress={() => {
                    navigation.navigate('ChatRoom', {
                        chatRoomId: id,
                        chatName: title,
                        chatDescription: description
                    })
                  }}
                >
                    <View style={styles.chatRoomButtom}>
                        <Text style={{ fontSize: 16 }}>{title}</Text>
                        <Icon name="arrow-right"/>
                    </View>
                    <Text>{description}</Text>  
                    <Text style={{ fontSize: 10 }}>Sidste besked: {new Date(date).toString().slice(0, 24)}</Text>  
                </TouchableOpacity>
            );
        }

        return (
            <SafeAreaView style={styles.container}>
                <FlatList
                    data={this.state.chatRooms}
                    renderItem={({ item }) => <Item navigation={this.props.navigation} id={item.chatRoomId} title={item.chatName} description={item.chatDescription} date={item.last_message} />}
                    keyExtractor={item => item.chatRoomId}
                    refreshControl={
                        <RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
                    }
                />
                <View style={{marginVertical: 5}}>
                    <Button
                        title="Sign out"
                        onPress={() => auth().signOut()}
                    />
                </View>
                <FlashMessage position="top" />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1
    },
    chatRooms: {
        padding: 15,
        backgroundColor: "#fff",
        borderColor: "#000000",
        borderTopWidth: 0,
        borderWidth: 1
    },
    chatRoomButtom: {
        flexDirection: "row",
        justifyContent: "space-between", 
        alignItems: "center"
    }
  });