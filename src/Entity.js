import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import {promOnce, promPut, promSet, promOn} from 'gun/lib/path'
import open from 'gun/lib/open'
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

In async function () {
Var bob = gun.get(‘people).get(‘bob’).promOnce();
Console.log((await bob).data)
}
*/

const PatternQuestionWithOptions = /(.*\x3F)(.*\x3B)*(.*\x2E$)/
const PatternQuestionWithOptions2 = /((.*?)(\x3F)+)((.*)(\x3B)+)*((.*?)(\x2E)+$)/

export default class Entity {
    constructor(url) {

        localStorage.clear();

        this.gun = new Gun(url)
        // this.sign = this.gun.get('sign')
        this.user = this.gun.user()
        this.userAttributes = null; // it's null before sign in. this.user.get('attributes')
        this.userTalks = null;
        this.userSettings = null; // it's null before sign in. this.user.get('settings')
        this.chat = this.gun.get('chat')
        this.userlist = this.gun.get('userlist')
        // this.userlist.on(this.cbNewUser);
        this.msgs = {}
        this.attrs = {}
        this.stageName = ''
        // this.cbUpdateUIChat = ''
        this.cbUpdateUIChatBot = ''
        this.cbUpdateUIAttributes = ''
        this.cbUpdateUITalks = ''
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

    getStageName(){
        return this.stageName;
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
        if(this.cbUpdateUISign){
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
    
        } else{
                //should unregister callback here.
        }
    }

    leave(stageName, password) {
        this.user.leave()
        var user = this.user.get(stageName)
        this.userlist.unset(user)
        this.userAttributes = null
        this.userTalks = null
        this.userSettings = null
        this.stageName = ""
        this.chatAI.setSelf("")
        this.cbUpdateUISign && this.cbUpdateUISign({authenticated: false})
    }

    auth(stageName, password) {
        this.stageName = stageName;
        this.myself = "";
        this.user.auth(stageName, password, ack => {
            if (ack.err) {
                console.log('err', ack.err);
                this.cbUpdateUISign && this.cbUpdateUISign({authenticated: false})
                return;
            }
            this.myself = this.user.get(stageName).put({
                stageName: stageName
            })
            this.userlist.set(this.myself)
            this.userAttributes = this.user.get('Attributes')
            this.userSettings = this.user.get('Settings')
            this.stageName = stageName;
            this.chatAI.setSelf(this.myself)
            this.cbUpdateUISign && this.cbUpdateUISign({authenticated: true})
            // this.cbUpdateUIChat && this.cbUpdateUIChat({stageName});
            this.cbUpdateUIChatBot && this.cbUpdateUIChatBot({stageName});
            this.cbUpdateUIAttributes && this.onAttributesChange(this.cbUpdateUIAttributes)
            this.cbUpdateUITalks && this.onTalksChange(this.cbUpdateUITalks)
            this.cbUpdateUISettings  && this.onSettingsChange(this.cbUpdateUISettings)
        });
    }

    // usercount(cb) {
    //     this.onSignChange(cb);
    // }

    sendMessage(msg) {
        var optionobj = {}
        var optionsarray = []
        var res = PatternQuestionWithOptions.exec(msg.message)
        if(res !== null){
            msg.message = res[1];
            if(res[2] === undefined){ 
                //just answer.
                msg.answer = res[3]

            }else{

                optionsarray = res[2].substr(0, res[2].length-1).split(';')
                optionsarray.push(res[3].substr(0, res[3].length-1))
                // var cnt = optionsarray.length;
                // msg.count = cnt
                // optionobj.when = msg.when
                msg.options = {}
                //{ value: 'op2', label: 'Option 2', trigger: '6' },
                
                //The first option is my own answer if more than one option.
                msg.answer = optionsarray[0]+"."

                optionsarray.forEach((opt, idx) => {
                    // console.log("Opt opt=", opt)
                    // console.log("Opt idx=", idx)
                    msg.options = Object.assign({}, msg.options, {['op' + idx]: {value: "op"+idx, label: opt, trigger: '6'}}) 
                })
                // msg.options = res[2] + res[3];
                // var msg2 = Object.assign({}, msg, {options: options})
                // this.chat.set(msg2);
                // this.chatAI.process(msg2);
                // return
            }
        }
        var gmsg = this.chat.set(msg);
        console.log("Entity Send message=", msg)
        // console.log("Entity myself=", this.myself)
        if(gmsg == undefined){
            console.log("err", gmsg)
        }
        
        gmsg.path('author').put(this.myself);
        this.myself.path('post').set(gmsg);
        // if(optionsarray.length>0){
            // console.log("Entity optionobj=", optionobj)
            // var gOptions = this.chat.set(optionobj)
            // newmsg.path('options').put(gOptions)
            // gOptions.path('questions').put(newmsg)
            // gOptions.path('author').put(this.myself)
            // this.myself.path('post').set(gOptions)
            // console.log("Entity goption=", gOptions)

            // gOptions.open( optionobj => {
            //     console.log("open nested object", optionobj)
            // })

        // }

        this.chatAI.process(gmsg);
    }

    // //prepare data for UI.
    // onChatMessage(cbUpdateUIChat) {
    //     // console.log('Entity onChatMessage', 'entered')
    //     const tmpState = {}
    //     var chat = this.chat
    //     var chatAI = this.chatAI;
    //     this.cbUpdateUIChat = cbUpdateUIChat
    //     this.chat.map().once(msg => {
    //         tmpState[msg.key] = msg
    //         // console.log('Entity onChatMessage', key)
    //         // var date = new Date(msg.when).toLocaleString().toLowerCase()
    //         console.log('Entity onChatMessage', " key=" + msg.key + " who=" + msg.stageName + ". msg=" + msg.message + ". bot=" + msg.bot)
    //         // console.log("local msgs len=", Object.keys(this.msgs).length)
    //         // console.log("tmpState len=", Object.keys(tmpState).length)
    //         this.msgs = Object.assign({}, this.msgs, tmpState)
    //         cbUpdateUIChat({
    //             msgs: this.msgs
    //         })

    //         msg && chatAI.processRespond(msg)
    //     })
    // }

        //prepare data for UI.
    onChatBotMessage(cbUpdateUIChatBot) {
        //   console.log('Entity onChatBotMessage', 'entered')
          const tmpState = {}
          var chat = this.chat
          var chatAI = this.chatAI;
          this.cbUpdateUIChatBot = cbUpdateUIChatBot
          var counter=0;
          this.chat.map().once(async (msg) => {
            // console.log('Entity counter=', counter++ )
            // console.log('Entity msg=', msg )
            if(msg.message === undefined && msg.options === undefined){
                console.log("wrong message", msg)
                return
            }
  //regular message
                tmpState[msg._['#']] = msg
                var author = await this.userlist.get(msg.author).then();
                // console.log('Entity n=', author )
                if(author == undefined){
                    // console.log('Entity onChatBotMessage n name=', "unknown" )
                    tmpState[msg._['#']].stageName = "unknown"
                }else{
                    // console.log('Entity onChatBotMessage n name=', author.stageName )
                    tmpState[msg._['#']].stageName = author.stageName
                }

                // console.log("msg.options=", msg.options)
                if(msg.options){  //this is an option 
                    var opts = {}
                    var optarr = []
                    opts = await this.gun.get(msg.options['#']).then();
                    // console.log("opts=", opts)
                        // Object.keys(opts).map( (key, idx) => {
                        //     console.log("option  ==== key", key)
                        //     console.log("option ===== idx" , idx)
                        //     if(key === '_')
                        //         return
                        //     var opt = this.gun.get(opts[key]['#']).then()
                        //     console.log("option now =", opt)
                        //     optarr.push(opt)
                        // })
                        // var op0 = await this.gun.get(opts.op0['#']).then();
                        // var op1 = await this.gun.get(opts.op1['#']).then();
                        var self = this.gun;
                        if (opts ){
                            
                            Object.keys(opts).forEach(async function(key){
                                if(key.startsWith("op")){
                                // console.log('key= '+key, opts[key])
                                    var currop = await self.get(opts[key]['#']).then();
                                    optarr.push(currop)    
                                }
                            })
                        }
                        // console.log("option all =", optarr)
                    // msg.options = optarr
                    // msg = Object.assign({}, ...msg, {options: optarr})
                    // tmpState[msg._['#']].options = optarr
                    tmpState[msg._['#']] = await Object.assign(tmpState[msg._['#']],  {options: optarr})
    
                    // var opt1 = await this.gun.get(opts.idx).then();
                    // console.log("options1=", opt1)
                    // var optionobj = await this.gun.get(msg._['#']).open().then(); 
                    // console.log("open nested object", optionobj)
                }

            //   this.userlist.get(msg.author)
              // console.log('Entity onChatMessage', key)
              // var date = new Date(msg.when).toLocaleString().toLowerCase()
            //   console.log('Entity onChatBotMessage', " key .#=" + msg._['#'] + " who=" + msg.stageName + ". msg=" + msg.message + ". bot=" + msg.bot)
              // console.log("local msgs len=", Object.keys(this.msgs).length)
            //   console.log("tmpState =", tmpState[msg._['#']])
            //   if(tmpState[msg._['#']].options){
            //     console.log("tmpState options total=", Object.keys(tmpState[msg._['#']].options).length)
            //   }else{
            //       console.log("No options.")
            //   }
              this.msgs = Object.assign({}, this.msgs, tmpState)
                // console.log("Entity: all msgs=", this.msgs)
              cbUpdateUIChatBot({
                  msgs: this.msgs
              })

              chatAI.processRespond(msg)
          })
    }

    onAttributesChange(cbUpdateUIAttributes) {
        // console.log('Entity onAttributesChange', 'entered')
        this.cbUpdateUIAttributes = cbUpdateUIAttributes;
        if(this.cbUpdateUIAttributes){
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
    
        }else{
            const tmpState = {}
            if (this.userAttributes == null)
                return;
            this.userAttributes.map().off()
    
        }
    }

    onTalksChange(cbUpdateUITalks) {
        console.log('Entity onTalksChange', 'entered')
        this.cbUpdateUITalks = cbUpdateUITalks;
        const tmpState = {}
        if (this.userTalks == null)
            return;
        this.userTalks.map().on((msg) => {
            tmpState[msg.message] = msg
            // console.log('Entity onAttributesChange : ' + key + ". Q=" + msg.message + ". A="+ msg.answer)
            // console.log('Entity onAttributesChange', msg)
            // console.log("local msgs len=", Object.keys(this.msgs).length)
            // console.log("tmpState len=", Object.keys(tmpState).length)
            this.talks = Object.assign({}, this.talks, tmpState)
            cbUpdateUITalks({
                stageName: this.stageName,
                msgs: this.talks
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
            //  console.log('Entity onSettingsChange : ' + this.stageName)
            //  console.log('Entity onSettingsChange', ". key=" + key + ". msg = " + msg  )
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
        // console.log('Entity changeSettings : ' +key + ". msg=" + msg)
    }

    addNewAttribute(newattr){
        // { this.state.question, this.state.answer, this.state.options}
        console.log("Attributes", 'question: ' + newattr.question);
        console.log("Attributes", 'answer: ' + newattr.answer);
        console.log("Attributes", 'options: ' + newattr.options);
        var msg = {when: Entity.time()}
        var optionobj = {}
        var optionsarray = []
        var res = PatternQuestionWithOptions2.exec(newattr.question) // +"?"+ newattr.answer + ";" + newattr.options + ".")
        console.log("Attributes", res);

        if(res === null)  //no match
            return
        //0: whole match string.
        
        //1: question with ?
        //2: question without ?
        //3: ? 

        //4: options except last option
        //5: options without last ;
        //6: ;

        //7: last option
        //8: last option without .
        //9: .

        msg.message = res[2];  //question without ?
        if(res[4] === undefined){ 
            //just answer.
            msg.answer = res[8]
        }else{
                optionsarray = res[5].split(';')
                optionsarray.push(res[8])
                // var cnt = optionsarray.length;
                // msg.count = cnt
                // optionobj.when = msg.when
                msg.options = {}
                //{ value: 'op2', label: 'Option 2', trigger: '6' },
                
                //The first option is my own answer if more than one option.
                msg.answer = optionsarray[0]+"."

                optionsarray.forEach((opt, idx) => {
                    // console.log("Opt opt=", opt)
                    // console.log("Opt idx=", idx)
                    msg.options = Object.assign({}, msg.options, {['op' + idx]: {value: "op"+idx, label: opt, trigger: '6'}}) 
                })
                // msg.options = res[2] + res[3];
                // var msg2 = Object.assign({}, msg, {options: options})
                // this.chat.set(msg2);
                // this.chatAI.process(msg2);
                // return
        }
        console.log("After Attributes", msg)
        this.userAttributes && this.userAttributes.get(msg.message).put(msg, function (ack) {
            // console.log("save attribute", ack)
        });

    }
}
