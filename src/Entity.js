import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import 'gun/lib/open'
import 'gun/lib/unset'
// import _ from 'lodash'
// import as from 'gun/as'
// import nts from 'gun/nts'

import chatAI from './ChatAI'
// import chatAI from './lib/chatAI'

/*
   class Entity {
       identity,
       attributes, //a list of Q/A that describes the person's attributes
       location,
       contacts, //a list of other Entities/persons that this has contact with.
          {
              nickname,
              description,
              relation tag: fan, star, friends, family, colleague, acquaintance, stranger
          }
       chats, //one-on-one talk
       {
           from self to others;
           from others to self;
       }
       topics, //a chain of Q/A that defines an automatic topic.
       {
           dating,
           making new friends of common interests.
           buy
           sell
           shoppingList
           business review
           opinions

       }
       chatAI{
           search for person to talk with. by distance, by max number of contacts.

           once a person X is found,

           Ask(){
              start to talk to X with a list of topic.
                each topic can have a list of question, seeking answer from X.
                if X doesn't have an answer to my question, leave the question and move on
                if X has the answer, then follow the logic of topic to finish the question.

           }
           Answer(){
              also, answer the question from X.
           }

       }
   }
*/

const PatternQuestionWithOptions = /(.*\x3F)(.*\x3B)*(.*\x2E$)/

export default class Entity {
    constructor(url: string) {

        localStorage.clear();

        this.gun = new Gun(url)
        // this.sign = this.gun.get('sign')
        this.user = this.gun.user()
        this.userAttributes = null; // it's null before sign in. this.user.get('attributes')
        this.userSettings = null; // it's null before sign in. this.user.get('settings')
        this.chat = this.gun.get('chat')
        this.userlist = this.gun.get('userlist')
        // this.userlist.on(this.cbNewUser);
        this.msgs = {}
        this.attrs = {}
        this.stageName = ''
        this.cbUpdateUIChat = ''
        this.cbUpdateUIChatBot = ''
        this.cbUpdateUIAttributes = ''
        this.cbUpdateUISettings = ''
        this.cbUpdateUISign = ''
        this.chatAI = new chatAI(this.gun);
    }

    // cbNewUser(newuser) {
    //     console.log("New user is on", newuser);

    // }
    // public chat() { return this.chat; }
    // public user() { return this.user; }
    static time() {
        var t = Gun.time.is();
        // console.log("chat", t);
        return t;
    }
    static random() {
        return Gun.text.random(4);
    }

    isUserOnline() {
        return this.user.is
    }

    create(stageName, password) {
        return this.user.create(stageName, password);
    }
    // listentouser(cb) {
    //     this.userlist.on(data => {
    //         this.usercount(cb)
    //     });
    // }

    onSignChange = UpdateUISign => {
        this.cbUpdateUISign = UpdateUISign
        this.userlist.open((list) => {
            const reducer = (newList, key) => {
                if (list[key] && !!Object.keys(list[key]).length && list[key].stageName) {
                    return [...newList, {
                        text: list[key].stageName,
                        key
                    }];
                } else {
                    return newList;
                };
            }
            const keylist = Object.keys(list);
            if (keylist === undefined) {
                return;
            }
            var userList1 = keylist.reduce(reducer, []);
            UpdateUISign && UpdateUISign({
                userlist: userList1 || [],
                mencnt :  userList1.length
            });
        });
    }

    leave(stageName, password) {
        this.user.leave()
        var user = this.user.get(stageName)
        this.userlist.unset(user)
        this.userAttributes = null
        this.userSettings = null
        this.stageName = ""
        this.chatAI.setSelf("")
        this.cbUpdateUISign && this.cbUpdateUISign({authenticated: false})
    }

    auth(stageName, password) {
        this.stageName = stageName;
        this.user.auth(stageName, password, ack => {
            if (ack.err) {
                console.log('err', ack.err);
                this.cbUpdateUISign && this.cbUpdateUISign({authenticated: false})
                return;
            }
            var user = this.user.get(stageName).put({
                stageName: stageName
            })
            this.userlist.set(user)
            this.userAttributes = this.user.get('Attributes')
            this.userSettings = this.user.get('Settings')
            this.stageName = stageName;
            this.chatAI.setSelf(stageName)
            this.cbUpdateUISign && this.cbUpdateUISign({authenticated: true})
            this.cbUpdateUIChat && this.cbUpdateUIChat({stageName});
            this.cbUpdateUIChatBot && this.cbUpdateUIChatBot({stageName});
            this.cbUpdateUIAttributes && this.onAttributesChange(this.cbUpdateUIAttributes)
            this.cbUpdateUISettings  && this.onSettingsChange(this.cbUpdateUISettings)
        });
    }

    // usercount(cb) {
    //     this.onSignChange(cb);
    // }

    sendMessage(msg) {
        var res = PatternQuestionWithOptions.exec(msg.message)
        if(res !== null){
            msg.message = res[1];
            if(res[2] === undefined){ 
                //just answer.
                msg.answer = res[3]

            }else{
                var options = res[2].split(';')
                options.push(res[3])
                msg.options = res[2] + res[3];
                // var msg2 = Object.assign({}, msg, {options: options})
                // this.chat.set(msg2);
                // this.chatAI.process(msg2);
                // return
            }
        }
        this.chat.set(msg);
        this.chatAI.process(msg);
    }

    //prepare data for UI.
    onChatMessage(cbUpdateUIChat) {
        // console.log('Entity onChatMessage', 'entered')
        const tmpState = {}
        var chat = this.chat
        var chatAI = this.chatAI;
        this.cbUpdateUIChat = cbUpdateUIChat
        this.chat.map().once(msg => {
            tmpState[msg.key] = msg
            // console.log('Entity onChatMessage', key)
            // var date = new Date(msg.when).toLocaleString().toLowerCase()
            console.log('Entity onChatMessage', " key=" + msg.key + " who=" + msg.stageName + ". msg=" + msg.message + ". bot=" + msg.bot)
            // console.log("local msgs len=", Object.keys(this.msgs).length)
            // console.log("tmpState len=", Object.keys(tmpState).length)
            this.msgs = Object.assign({}, this.msgs, tmpState)
            cbUpdateUIChat({
                msgs: this.msgs
            })

            msg && chatAI.processRespond(msg)
        })
    }

        //prepare data for UI.
    onChatBotMessage(cbUpdateUIChatBot) {
        //   console.log('Entity onChatBotMessage', 'entered')
          const tmpState = {}
          var chat = this.chat
          var chatAI = this.chatAI;
          this.cbUpdateUIChatBot = cbUpdateUIChatBot
          this.chat.map().once((msg) => {
              tmpState[msg._['#']] = msg
              // console.log('Entity onChatMessage', key)
              // var date = new Date(msg.when).toLocaleString().toLowerCase()
            //   console.log('Entity onChatBotMessage', " key .#=" + msg._['#'] + " who=" + msg.stageName + ". msg=" + msg.message + ". bot=" + msg.bot)
              // console.log("local msgs len=", Object.keys(this.msgs).length)
              // console.log("tmpState len=", Object.keys(tmpState).length)
              this.msgs = Object.assign({}, this.msgs, tmpState)
              cbUpdateUIChatBot({
                  msgs: this.msgs
              })

              chatAI.processRespond(msg)
          })
    }

    onAttributesChange(cbUpdateUIAttributes) {
        // console.log('Entity onAttributesChange', 'entered')
        this.cbUpdateUIAttributes = cbUpdateUIAttributes;
        const tmpState = {}
        if (this.userAttributes == null)
            return;
        this.userAttributes.map().on((msg) => {
            tmpState[msg.message] = msg
            // console.log('Entity onAttributesChange : ' + key + ". Q=" + msg.message + ". A="+ msg.answer)
            // console.log('Entity onAttributesChange', msg)
            // console.log("local msgs len=", Object.keys(this.msgs).length)
            // console.log("tmpState len=", Object.keys(tmpState).length)
            this.attrs = Object.assign({}, this.attrs, tmpState)
            cbUpdateUIAttributes({
                stageName: this.stageName,
                msgs: this.attrs
            })
        })
    }

    onSettingsChange(cbUpdateUISettings) {
        // console.log('Entity onSettingsChange', 'entered')
        this.cbUpdateUISettings = cbUpdateUISettings;
        const tmpState = {}
        if (this.userSettings == null)
            return;
        this.userSettings.map().on((msg, key) => {
            tmpState[key] = msg
             console.log('Entity onSettingsChange : ' + this.stageName)
             console.log('Entity onSettingsChange', ". key=" + key + ". msg = " + msg  )
            // console.log("local msgs len=", Object.keys(this.msgs).length)
            // console.log("tmpState len=", Object.keys(tmpState).length)
            this.attrs = Object.assign({}, this.attrs, tmpState)
            cbUpdateUISettings({
                stageName: this.stageName,
                msgs: this.attrs
            })
        })
    }

    changeSettings(key, msg) {
        if (this.userSettings == null)
            return;
        this.userSettings.get(key).put(msg);
        console.log('Entity changeSettings : ' +key + ". msg=" + msg)
    }


}
