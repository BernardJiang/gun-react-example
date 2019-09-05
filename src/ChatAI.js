import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import 'gun/lib/open'
import 'gun/lib/unset'

export default class ChatAI {
    constructor(gun) {
        this.gun = gun

        // this.userAttributes = userAttributes
        this.stageName = ''
    }

    setSelf(stageName) {
        // this should be replaced with real id. stageName can be changed.
        this.stageName = stageName
    }
    process(msg) {  //process message of self.
        // console.log("In chatAI")
        this.user = this.gun.user()

        this.userAttributes = this.user.get('Attributes')
        if (!this.userAttributes) //validate attributes.
            return

        var c = msg.message.charAt(msg.message.length - 1)
        if (c === '?') { //a question
            this.user.get('lastquestion').put({
                message: msg.message
            });
            this.userAttributes.get(msg.message).put({
                message: msg.message,
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
                    // console.log("get lastquestion object", data.message)
                    data && userAttributes.get(data.message).put({
                        answer: msg.message,
                        bot: true
                    })
                    user.get('lastquestion').put(null);
                })
            } else {
                //ignore answer without a question.
                console.log("Ignore an answer.", msg.message)
            }
        } else { //ignore chats.
            console.log("Ignore a messaage.")
        }
    }


    
    processRespond(msg) { // respond the message from others and self.

        var chat = this.gun.get('chat')
        this.user = this.gun.user()

        if (!this.user.is)  //if not log in.
            return

        if (msg.stageName === this.stageName) {  
            //If the message is sent by myself, process self's messages.
            // this.process(msg)
            //return
        }

        //process others message.

        this.userAttributes = this.user.get('Attributes')
        if (!this.userAttributes)  //if no userAttributes
            return
        var stageName = this.stageName
        if(!msg.message)
            return
        var c = msg.message.charAt(msg.message.length - 1)
        if (c !== '?')
            return; //not a question, ignore.
        var ans = this.userAttributes.get(msg.message)
        // console.log("ans:", ans);
        if (!ans)
            return //answer is null, then ignore it.

        var user = this.user
        var userAttributes = this.userAttributes

        ans.once(function (data) {
            if (!data) { //never hear this question. Save the question.

                user.get('lastquestion').put({
                    message: msg.message
                });
                console.log("save question from others: ", msg.message)
                userAttributes.get(msg.message).put({
                    message: msg.message,
                    when: msg.when
                }, function (ack) {
                    console.log("save question status=", ack.err)
                });

                return
            }
            if (!data.answer)
                return //means question exists without an answer.
            const when = Gun.time.is()
            const key = `${when}_${Gun.text.random()}`
            // const who = stageName;
            var answer = {
                key,
                stageName,
                when,
                message: data.answer,
                bot: true
            }
            // console.log("data answer", answer);
            chat.set(answer);
        })

    }
}