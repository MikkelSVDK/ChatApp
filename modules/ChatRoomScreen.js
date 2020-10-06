import Fire from '../Fire';
import React from 'react'
import auth from "@react-native-firebase/auth"
import { KeyboardAvoidingView, View, Text, Image } from 'react-native';
import { Icon } from 'react-native-elements';
import { Actions, GiftedChat, Bubble } from 'react-native-gifted-chat';
import ImagePicker from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';

export default class ChatRoom extends React.Component {
  // Få navigation parametere, som indeholder Navn og ID
  chatData = typeof this.props.route.params !== 'undefined' ? this.props.route.params : {chatName: null, chatRoomId: null};

  // Default state
  state = {
    isLoadingEarlier: false,
    showingHistory: false,
    messageHistory: [],
    imageURL: null,
    messages: []
  }

  // Loader tidligere beskeder, når knappen 'Load earlier' klikkes
  onLoadEarlier = async () => {
    var doneWithHistory = false;

    // Henter alle beskeder (Denne gang uden en limit på 50)
    Fire.get(message => this.setState(previous => {
      // Filtere alle beskeder fra som allerede er i messages arrayet
      if (previous.messages.filter(m => m._id === message._id).length == 0){
        previous.messageHistory.push(message); // Sætter beskeden i besked historikken.
        return { 
            messageHistory: previous.messageHistory, 
            isLoadingEarlier: true
        };
      }

      // Hvis beskeder ikke findes i arrayet køre denne i stedet for
      if(doneWithHistory == false){ // Tjekker om den er kørt 1 gang
          doneWithHistory = true;
          // Vender arrayet om så det passer med resten af beskederne
          var reveredHistory = previous.messageHistory.reverse(); 
          return { 
              messages: GiftedChat.append(reveredHistory, previous.messages), // sætter dem ind i slutningen af messages arrayet 
              isLoadingEarlier: false,
              showingHistory: true
          };
      }

    }), 
    true, // Siger ja til at loade alle beskeder uden en limit
    "chatroom/" + this.chatData.chatRoomId + "/messages" // Giver chatroom ID og hvor chatrummet ligger i Firebase db.
    );
  }

  componentDidMount() {
    // Sætter titlen til chatrummets titel
    this.props.navigation.setOptions({headerTitle: this.chatData.chatName});

    // Sender brugeren til login skærmen hvis de er blevet logget ud
    auth().onAuthStateChanged((user) => {
      if(!user)
        this.props.navigation.navigate('SignIn')
    });

    // Henter de sidste 50 beskeder fra firebase db
    Fire.get(message => 
      this.setState(previous => ({
          messages: GiftedChat.append(previous.messages, message)
      })), 
      false, // Siger nej til at loade alle beskeder men kun 50
      "chatroom/" + this.chatData.chatRoomId + "/messages" // Giver chatroom ID og hvor chatrummet ligger i Firebase db.
    );
  }

  componentWillUnmount(){
    // Lukker forbindelsen til DB når skærm unloades
    Fire.off("chatroom/" + this.chatData.chatRoomId + "/messages");
  }

  // Rendere boblen på beskederne
  renderBubble(props) {
    // Hvis bruger og dato er den samme på nuværende og sidste besked sender den bare en boble med teksten
    if (props.currentMessage.user._id == (props.previousMessage.user || {})._id && new Date(props.currentMessage.createdAt).getDay() == new Date(props.previousMessage.createdAt).getDay()) {
      return (
        <Bubble
          {...props}
        />
      );
    }

    // Hvis bruger og dato ikke er ens sender den en boble med senderens navn over.
    return (
      <View>
        <Text style={{textAlign: "right", color: "#aaa"}}>{props.currentMessage.user.name}</Text>
        <Bubble
          {...props}
        />
      </View>
    );
  }

  // Bruges da Gifted chat bruger et abandoned library til at vise billeder.
  renderMessageImage(props){
    // Retunere et Image tag med billedets url og lidt style
    return (
      <Image
        style={{width:200,height:250,borderRadius:15,borderTopRightRadius:2}}
        source={{uri: props.currentMessage.image}}
      />
    );
  }

  // Rendere knappen med en papirklip nede i venstre hjørne og siger hvad den skal gøre/vise
  renderActions(props) {
    return (
      <Actions
        {...props}
        options={{
          // Laver en knap som hedder Send billede og giver knappen en funktion (Den er lavet inde i render action pga. det virkede ikke undenfor i this)
          'Send Billede': (props) => {
            // Sætter et par indstillinger for ImagePicker libraryet
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
                // Hvis brugeren ikke har annuleret eller der skete en fejl køres dette som uploader billedet til firebase storage med et random navn.
                const task = storage().ref((Math.random()*10000) + '.png').putFile(response.uri);
                task.then(async (snapshot) => {
                  // Efter det er uploadet finder vi urlen og sætter state ImageURL til billedets url.
                  const downloadURL = await storage().ref(snapshot.metadata.fullPath).getDownloadURL();
                  this.state.imageURL = downloadURL;
                });
              }
            });
          }
        }}
        icon={() => (
          <Icon name={'attachment'} size={28} /> //Ikonet som vises i venstre bund
        )}
      />
    )
  }

  render(){      
    return (
      <KeyboardAvoidingView style={{flex: 1}} enabled>
        <GiftedChat 
          renderActions={this.renderActions.bind(this)} // Kalder render action som gør det muligt at sende billeder bindes til this for at kunne ændre state
          renderBubble={this.renderBubble} // Kalder render boble når der skal vises en bobel
          renderMessageImage={this.renderMessageImage} // Rendere billede, ikke nødvendigt hvis MessageImage virkede
          /*onInputTextChanged={text => {if(/\r|\n/.exec(text)){ console.log("Send") }}}*/ //Eksperiment med send, kunne ikke finde send functionen
          loadEarlier={this.state.messages.length >= 50 && !this.state.showingHistory} // Vis load tidligere hvis beskeder er lig eller over 50
          onLoadEarlier={this.onLoadEarlier} // Når load tidligere klikkes
          isLoadingEarlier={this.state.isLoadingEarlier}// Viser at den loader tidlere når der klikkes
          showUserAvatar={true}
          messages={this.state.messages} // Beskederne som er i state messages arrayet
          onSend={(m) => { // Når en besked sendes
              Fire.send(
                m, // Beskeden med bruger
                this.state.imageURL, // Sender billede med hvis der er et
                "chatroom/" + this.chatData.chatRoomId + "/messages" // Chatrum ID og firebase db info
              ); 
              this.state.imageURL = null; // sætter billedet til null efter besked er blevet sendt.
            }}
          user={Fire.user} // Brugeren som er logget ind
        />
      </KeyboardAvoidingView>
    );
  }
}