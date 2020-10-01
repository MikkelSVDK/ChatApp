import React from 'react'
import auth, { firebase } from "@react-native-firebase/auth"
import { KeyboardAvoidingView } from 'react-native'
import { Avatar, GiftedChat } from 'react-native-gifted-chat'
import FlashMessage, { showMessage } from "react-native-flash-message";
import database from '@react-native-firebase/database';
import Fire from '../Fire';

export default class ChatRoom extends React.Component {
    chatData = typeof this.props.route.params !== 'undefined' ? this.props.route.params : {chatName: null, chatRoomId: null};
    state = {
        isLoadingEarlier: false,
        showingHistory: false,
        messageHistory: [],
        messages: []
    }

    onLoadEarlier = async () => {
        var doneWithHistory = false;
        Fire.get(message => this.setState(previous => {
            if (previous.messages.filter(m => m._id === message._id).length == 0){
                previous.messageHistory.push(message);
                return { 
                    messageHistory: previous.messageHistory, 
                    isLoadingEarlier: true
                };
            }

            if(doneWithHistory == false){
                doneWithHistory = true;
                var reveredHistory = previous.messageHistory.reverse();
                return { 
                    messages: GiftedChat.append(reveredHistory, previous.messages), 
                    isLoadingEarlier: false,
                    showingHistory: true
                };
            }

        }), true, "chatroom/" + this.chatData.chatRoomId + "/messages");
    }

    componentDidMount() {
        this.props.navigation.setOptions({headerTitle: this.chatData.chatName});

        auth().onAuthStateChanged((user) => {
            if(!user)
                this.props.navigation.navigate('SignIn')
        });

        Fire.get(message => 
            this.setState(previous => ({
                messages: GiftedChat.append(previous.messages, message)
            })), false, "chatroom/" + this.chatData.chatRoomId + "/messages"
        );
    }

    componentWillUnmount(){
        Fire.off("chatroom/" + this.chatData.chatRoomId + "/messages");
    }
    
    render(){      
        return (
            <KeyboardAvoidingView style={{flex: 1}} enabled>
                <GiftedChat 
                  loadEarlier={this.state.messages.length >= 50 && !this.state.showingHistory}
                  onLoadEarlier={this.onLoadEarlier}
                  isLoadingEarlier={this.state.isLoadingEarlier}
                  showUserAvatar={true}
                  messages={this.state.messages}
                  onSend={(m) => Fire.send(m, "chatroom/" + this.chatData.chatRoomId + "/messages")}
                  user={Fire.user} />
                <FlashMessage position="top" />
            </KeyboardAvoidingView>
        );
    }
}