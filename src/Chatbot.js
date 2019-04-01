import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import 'gun/lib/open'
import 'gun/lib/unset'

export default class Chatbot {
    constructor(gun) {
        this.gun = gun

        // this.userAttributes = userAttributes
        this.name = ''
    }

    setSelf(name){
        this.name = name
    }
    process(msg) {
        console.log("In Chatbot")
        this.user = this.gun.user()
        this.userAttributes = this.user.get('Attributes')
        if(!this.userAttributes)
            return

        
        if(this.name == msg.who){
            var c = msg.what.charAt(msg.what.length - 1)
            if (c === '?') { //a question
                this.user.get('lastquestion').put({
                    what: msg.what
                });
                this.userAttributes.get(msg.what).put({
                    what: msg.what,
                    when: msg.when
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
                            answer: msg.what
                        })
                        user.get('lastquestion').put(null);
                    })
                } else {
                    //ignore answer without a question.
                    console.log("Ignore an answer.", msg.what)
                }
            } else { //ignore chats.
                console.log("Ignore a messaage.")
            }
    
        } else { // message from others.

            var chat = this.gun.get('chat')
            var name = this.name
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
                            const when = this.gun.time()
                            const key = `${when}_${this.gun.random()}`
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
    }





}