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

    send = messages => {
        messages.forEach(element => {
            const message = {
                text: element.text,
                timestamp: database.ServerValue.TIMESTAMP,
                user: element.user
            }

            this.db.push(message);
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

    get = callback => {
        this.db.on("child_added", snapshot => callback(this.parse(snapshot)))
    }

    off(){
        this.db.off();
    }

    get db(){
        return database().ref("messages");
    }

    get uid(){
        return (firebase.auth().currentUser || {}).uid
    }

    get displayName(){
        return (firebase.auth().currentUser || {}).displayName
    }
}

export default new Fire();