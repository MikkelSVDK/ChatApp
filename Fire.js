import firebase from '@react-native-firebase/app'
import database from '@react-native-firebase/database';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";

class Fire {
    constructor(){
        this.init();
    }

    init = () => {
        if(!firebase.apps.length){
            firebase.initializeApp({
                apiKey: "AIzaSyCCKNNywAS1CXjKbW69U0Dp26FOLOvRMUk",
                authDomain: "hoc-chatapp.firebaseapp.com",
                databaseURL: "https://hoc-chatapp.firebaseio.com",
                projectId: "hoc-chatapp",
                storageBucket: "hoc-chatapp.appspot.com",
                messagingSenderId: "746354116982",
                appId: "1:746354116982:web:6be064951329559edc5257"
            });
        }
    }

    send = (messages, imageURL, ref) => {
        messages.forEach(async element => {
            const message = {
                text: element.text,
                timestamp: database.ServerValue.TIMESTAMP,
                user: element.user
            }

            console.log(imageURL);
            if(imageURL != null)
                message["image"] = imageURL;

            database().ref(ref).push(message);
            database().ref(ref.replace("/messages", "")).update({last_message: database.ServerValue.TIMESTAMP});

            database().ref(ref.replace("/messages", "/subscribers/" + element.user._id)).once('value').then(snapshot => {
                if(snapshot.val() == null){
                    Alert.alert(
                        'Modtag notifikationer',
                        'Har du lyst til at modtage notifikationer når andre skriver i chatten?',
                        [
                          {
                            text: 'Nej',
                            onPress: () => {
                                database().ref(ref.replace("/messages", "/subscribers/" + element.user._id)).set(0);
                            },
                            style: 'cancel'
                          },
                          { text: 'Ja', onPress: () => {
                                database().ref(ref.replace("/messages", "/subscribers/" + element.user._id)).set(1);
                          } }
                        ],
                        { cancelable: false }
                    );
                }
            });

            var chatRoomName = null,
              tokens = [];
            await database().ref(ref.replace("/messages", "")).once('value').then(snapshot => {
                chatRoomName = snapshot.val().name;
            });

            await database().ref(ref.replace("/messages", "/subscribers")).once('value').then(async snapshot => {
                for (const property in snapshot.val()){
                    if(snapshot.val()[property] == 1){
                        var token = await firestore()
                          .collection('users')
                          .doc(property)
                          .get();

                        token.data().tokens.forEach(token => {
                            tokens.push(token);
                        });
                    }
                }
            });

            functions()
              .httpsCallable('sendNotifications')({recievers: JSON.stringify(tokens), chatRoomId: ref.replace("/messages", "").replace("chatroom/", ""), chatName: chatRoomName})
              .catch(() => console.log);
        });
    }

    parse = message => {
        const { user, text, timestamp, image } = message.val();
        const { key: _id } = message;
        const createdAt = new Date(timestamp);

        return {
            _id,
            createdAt,
            text,
            user,
            image
        }
    }

    get = (callback, history = false, ref) => {
        if(history == true)
            database().ref(ref).orderByChild("timestamp").on("child_added", snapshot => callback(this.parse(snapshot)))
        else
            database().ref(ref).limitToLast(50).on("child_added", snapshot => callback(this.parse(snapshot)))
    }

    off(ref){
        database().ref(ref).off();
    }

    get user(){
        const userInfo = firebase.auth().currentUser;
        return {
            _id: userInfo.uid,
            name: userInfo.displayName,
            avatar: userInfo.avatarUrl
        }
    }
}

export default new Fire();