import firebase from '@react-native-firebase/app'
import database from '@react-native-firebase/database';

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

    send = (messages, ref) => {
        messages.forEach(element => {
            const message = {
                text: element.text,
                timestamp: database.ServerValue.TIMESTAMP,
                user: element.user
            }

            database().ref(ref).push(message);
            database().ref(ref.replace("/messages", "")).update({last_message: database.ServerValue.TIMESTAMP});
        });
    }

    parse = message => {
        const { user, text, timestamp } = message.val();
        const { key: _id } = message;
        const createdAt = new Date(timestamp);

        return {
            _id,
            createdAt,
            text,
            user
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