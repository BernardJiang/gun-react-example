import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import 'gun/lib/open'
import 'gun/lib/unset'
// import _ from 'lodash'
// import as from 'gun/as'
// import nts from 'gun/nts'


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
       chatbot{
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
export default class Entity {
    constructor(url: string) {

        // localStorage.clear();

        this.gun = new Gun(url)
        this.sign = this.gun.get('sign')
        this.user = this.gun.user()
        this.userAttributes = null; // it's null before sign in. this.user.get('attributes')
        this.chat = this.gun.get('chat')
        this.userlist = this.gun.get('userlist')
        // this.userlist.on(this.cbNewUser);
        this.msgs = {}
        this.attrs = {}
        this.name = ''
        this.cbUpdateUIChat = ''
        this.cbUpdateUIAttributes = ''
        this.cbUpdateUISign = ''
    }

    cbNewUser(newuser) {
        console.log("New user is on", newuser);

    }
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

    create(name, password) {
        return this.user.create(name, password);
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
                if (list[key] && !!Object.keys(list[key]).length && list[key].name) {
                    return [...newList, {
                        text: list[key].name,
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

    leave(name, password) {
        this.user.leave()
        var user = this.user.get(name)
        this.userlist.unset(user)
        this.userAttributes = null
        this.name = ""
        this.cbUpdateUISign && this.cbUpdateUISign({authenticated: false})
    }

    auth(name, password) {
        this.name = name;
        this.user.auth(name, password, ack => {
            if (ack.err) {
                console.log('err', ack.err);
                this.cbUpdateUISign && this.cbUpdateUISign({authenticated: false})
                return;
            }
            var user = this.user.get(name).put({
                name: name
            })
            this.userlist.set(user)
            this.userAttributes = this.user.get('Attributes')
            this.name = name;
            this.cbUpdateUISign && this.cbUpdateUISign({authenticated: true})
            this.cbUpdateUIChat && this.cbUpdateUIChat({name});
            this.cbUpdateUIAttributes && this.onAttributesChange(this.cbUpdateUIAttributes)
        });
    }

    // usercount(cb) {
    //     this.onSignChange(cb);
    // }

    saveMessage(key: string, obj: Object) {
        this.chat.path(key).put(obj);
        var c = obj.what.charAt(obj.what.length - 1)
        if (c === '?') { //a question
            this.user.get('lastquestion').put({
                what: obj.what
            });
            this.userAttributes.get(obj.what).put({
                what: obj.what,
                when: obj.when
            }, function (ack) {
                // console.log("save attribute", ack)
            });
        } else if (c === '.') { // an answer
            var userAttributes = this.userAttributes
            var user = this.user;
            var lq = this.user.get('lastquestion')
            if (lq) {
                lq.once(function (data) {
                    // console.log("get lastquestion object", data.what)
                    data && userAttributes.get(data.what).put({
                        answer: obj.what
                    })
                    user.get('lastquestion').put(null);
                })
            } else {
                //ignore answer without a question.
                console.log("Ignore an answer.", obj.what)
            }
        } else { //ignore chats.
            console.log("Ignore a messaage.")
        }
    }

    //prepare data for UI.
    onChatMessage(cbUpdateUIChat) {
        // console.log('Entity onChatMessage', 'entered')
        const tmpState = {}
        var chat = this.chat
        this.cbUpdateUIChat = cbUpdateUIChat
        this.chat.map().once((msg, key) => {
            tmpState[key] = msg
            // console.log('Entity onChatMessage', key)
            // var date = new Date(msg.when).toLocaleString().toLowerCase()
            // console.log('Entity onChatMessage', " key=" + key + " date=" + date + ". msg=" + msg.what)
            // console.log("local msgs len=", Object.keys(this.msgs).length)
            // console.log("tmpState len=", Object.keys(tmpState).length)
            this.msgs = Object.assign({}, this.msgs, tmpState)
            cbUpdateUIChat({
                msgs: this.msgs
            })
            var name = this.name
            if (this.userAttributes) {
                var c = msg.what.charAt(msg.what.length - 1)
                if (c === '?') { //a question
                    var ans = this.userAttributes.get(msg.what)
                    console.log("ans:", ans);
                    if (ans){
                        var user = this.user
                        var userAttributes = this.userAttributes

                        ans.once(function (data) {
                            if (!data){  //never hear this question. Save the question.
                                
                                user.get('lastquestion').put({
                                    what: msg.what
                                });
                                console.log("save question from others: ", msg.what)
                                userAttributes.get(msg.what).put({
                                    what: msg.what,
                                    when: msg.when
                                }, function (ack) {
                                    console.log("save question status=", ack.err)
                                });

                                return
                            } 
                            if (!data.answer) return //means question exists without an answer.
                            const when = Entity.time()
                            const key = `${when}_${Entity.random()}`
                            const who = name;
                            var answer = {
                                who,
                                when,
                                what: data.answer
                            }
                            // console.log("data answer", answer);
                            chat.path(key).put(answer);
                        })
                    }
                }
            }
        })
    }

    onAttributesChange(cbUpdateUIAttributes) {
        // console.log('Entity onAttributesChange', 'entered')
        this.cbUpdateUIAttributes = cbUpdateUIAttributes;
        const tmpState = {}
        if (this.userAttributes == null)
            return;
        this.userAttributes.map().on((msg, key) => {
            tmpState[key] = msg
            // console.log('Entity onAttributesChange : ' + key + ". Q=" + msg.what + ". A="+ msg.answer)
            // console.log('Entity onAttributesChange', msg)
            // console.log("local msgs len=", Object.keys(this.msgs).length)
            // console.log("tmpState len=", Object.keys(tmpState).length)
            this.attrs = Object.assign({}, this.attrs, tmpState)
            cbUpdateUIAttributes({
                msgs: this.attrs
            })
        })
    }

}