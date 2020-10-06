import firebase from '@react-native-firebase/app'
import database from '@react-native-firebase/database';
import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';
import { Alert } from "react-native";

class Fire {
    // Køre når Fire classen konstrueres
    constructor(){
        this.init();
    }

    // Initialisere firebase APP
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

    // Når besked sendes i gifted chat
    send = (messages, imageURL, ref) => {
        // Looper igennem bekseder
        messages.forEach(async element => {
            // Laver et array med besked som skal gemmes i databasen
            const message = {
                text: element.text,
                timestamp: database.ServerValue.TIMESTAMP,
                user: element.user
            }

            // Hvis der er et billede i state tilføj til array
            if(imageURL != null)
                message["image"] = imageURL;

            // Push beskeden til databasen
            database().ref(ref).push(message);

            // Sætter last_message for chat room listen
            database().ref(ref.replace("/messages", "")).update({last_message: database.ServerValue.TIMESTAMP});

            // Tjekker om brugeren er en subscriber
            database().ref(ref.replace("/messages", "/subscribers/" + element.user._id)).once('value').then(snapshot => {
                if(snapshot.val() == null){
                    // Hvis ikke sprøg om de har lyst til at modtage notifikationer
                    Alert.alert(
                        'Modtag notifikationer',
                        'Har du lyst til at modtage notifikationer når andre skriver i chatten?',
                        [
                            {
                                text: 'Nej', // Hvis de ikke vil laves der en row med 0 for at indikere nej
                                onPress: () => {
                                    database().ref(ref.replace("/messages", "/subscribers/" + element.user._id)).set(0);
                                },
                                style: 'cancel'
                            },
                            { 
                                text: 'Ja', // Hvis de siger ja opret en row med 1 for at indigere ja
                                onPress: () => {
                                    database().ref(ref.replace("/messages", "/subscribers/" + element.user._id)).set(1);
                                } 
                            }
                        ],
                        { cancelable: false }
                    );
                }
            });

            // Finder navnet på nuværende chatrum 
            var chatRoomName = null,
              tokens = [];
            await database().ref(ref.replace("/messages", "")).once('value').then(snapshot => {
                chatRoomName = snapshot.val().name;
            });

            // Finder alle subscibers og noti tokens
            await database().ref(ref.replace("/messages", "/subscribers")).once('value').then(async snapshot => {
                for (const property in snapshot.val()){
                    if(snapshot.val()[property] == 1){
                        var token = await firestore()
                          .collection('users')
                          .doc(property)
                          .get();

                        token.data().tokens.forEach(token => {
                            tokens.push(token); // Laver et array med alle tokens
                        });
                    }
                }
            });

            // Kalder en firebase cloud function som sender notifikationen ud til alle i token arrayet 
            functions()
              .httpsCallable('sendNotifications')({recievers: JSON.stringify(tokens), chatRoomId: ref.replace("/messages", "").replace("chatroom/", ""), chatName: chatRoomName})
              .catch(() => console.log);
        });
    }

    // Gør besked klar til at gemmes i databasen eller appended ind i gifted chat
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

    // Henter beskeder ned fra firebase DB (Med eller unden limit)
    get = (callback, history = false, ref) => {
        if(history == true)
            database().ref(ref).orderByChild("timestamp").on("child_added", snapshot => callback(this.parse(snapshot)))
        else
            database().ref(ref).limitToLast(50).on("child_added", snapshot => callback(this.parse(snapshot)))
    }

    // Lukker listeneren for ændringer til databasen
    off(ref){
        database().ref(ref).off();
    }

    // Gør et bruger array klar til gifted chat og firebase databasen
    get user(){
        const userInfo = firebase.auth().currentUser;
        return {
            _id: userInfo.uid,
            name: userInfo.displayName,
            avatar: userInfo.avatarUrl
        }
    }
}

// Kalder Fire classen og init func
export default new Fire();