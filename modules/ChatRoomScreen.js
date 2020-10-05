import React from 'react'
import auth, { firebase } from "@react-native-firebase/auth"
import { KeyboardAvoidingView, View, Text, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { Actions, GiftedChat, Bubble, MessageImage } from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-picker';
import FlashMessage, { showMessage } from "react-native-flash-message";
import storage from '@react-native-firebase/storage';
import Fire from '../Fire';

export default class ChatRoom extends React.Component {
    chatData = typeof this.props.route.params !== 'undefined' ? this.props.route.params : {chatName: null, chatRoomId: null};
    state = {
        isLoadingEarlier: false,
        showingHistory: false,
        messageHistory: [],
        imageURL: null,
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
    
    renderBubble(props){
        console.log(props);
        return(
            <Bubble {...props} />
        );
    }

    renderBubble(props) {
        if (props.currentMessage.user._id == (props.previousMessage.user || {})._id && new Date(props.currentMessage.createdAt).getDay() == new Date(props.previousMessage.createdAt).getDay()) {
          return (
            <Bubble
              {...props}
            />
          );
        }
        return (
          <View>
            <Text style={{textAlign: "right", color: "#aaa"}}>{props.currentMessage.user.name}</Text>
            <Bubble
              {...props}
            />
          </View>
        );
    }

    renderMessageImage(props){
        return (
            <Image
              style={{width:200,height:250,borderRadius:15,borderTopRightRadius:2}}
              source={{uri: props.currentMessage.image}}
            />
          );
    }

    renderActions(props) {
        return (
          <Actions
            {...props}
            options={{
                'Send Billede': (props) => {
                    const options = {
                        title: 'Vælg billede',
                        storageOptions: {
                          skipBackup: true,
                          path: 'images',
                        },
                      };
                    ImagePicker.showImagePicker(options, async response => {
                        if(response.didCancel)
                            console.log('User cancelled image picker');
                        else if(response.error)
                            console.log('ImagePicker Error: ', response.error);
                        else{
                            const task = storage().ref((Math.random()*10000) + '.png').putFile(response.uri);
                            task.then(async (snapshot) => {
                                const downloadURL = await storage().ref(snapshot.metadata.fullPath).getDownloadURL();
                                this.state.imageURL = downloadURL;
                            });
                        }
                    });
                }
            }}
            icon={() => (
              <Icon name={'attachment'} size={28} />
            )}
            onSend={args => console.log(args)}
          />
        )
    }

    render(){      
        return (
            <KeyboardAvoidingView style={{flex: 1}} enabled>
                <GiftedChat 
                  renderActions={this.renderActions.bind(this)}
                  renderBubble={this.renderBubble}
                  renderMessageImage={this.renderMessageImage}
                  /*onInputTextChanged={text => {if(/\r|\n/.exec(text)){ console.log("Send") }}}*/
                  loadEarlier={this.state.messages.length >= 50 && !this.state.showingHistory}
                  onLoadEarlier={this.onLoadEarlier}
                  isLoadingEarlier={this.state.isLoadingEarlier}
                  showUserAvatar={true}
                  messages={this.state.messages}
                  onSend={(m) => {
                      Fire.send(m, this.state.imageURL, "chatroom/" + this.chatData.chatRoomId + "/messages"); 
                      this.state.imageURL = null;
                    }}
                  user={Fire.user} />
                <FlashMessage position="top" />
            </KeyboardAvoidingView>
        );
    }
}