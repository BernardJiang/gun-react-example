import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import 'gun/lib/open'
import 'gun/lib/unset'

// ? 0x3F; . 0x2E; ; 0x3B; ! 0x21
const PatternQuestion = /\x3F$/g
const PatternAnswer = /\x2E$/g
const PatternQuestionWithOptions = /.*\x3F(.*\x3B)+.*\x2E/g
    
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
    process(msg) {  //process message of self. This process handles attributes process. It doesn't respond to questions.
        // console.log("In chatAI")
        this.user = this.gun.user()

        this.userAttributes = this.user.get('Attributes')
        if (!this.userAttributes) //validate attributes.
            return
        // var c = msg.message.charAt(msg.message.length - 1)
        // var resans2 = PatternAnswer.test(msg.message)
        // console.log("new messaage." + msg.message + ". " + PatternAnswer.test(msg.message))
        var resans = PatternAnswer.test(msg.message)

        if (PatternQuestion.test(msg.message)) { //a question
            this.user.get('lastquestion').put({
                message: msg.message
            });
            // console.log("attr", "save key=" + msg.message + ". message=" + msg.when)
            this.userAttributes.get(msg.message).put({
                message: msg.message,
                when: msg.when
            }, function (ack) {
                // console.log("save attribute", ack)
            });
        } else if ( resans ) { // an answer
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
            console.log("Ignore a messaage." + msg.message)
        }
    }


    
    processRespond(msg) { // respond the message from others and self.

        var chat = this.gun.get('chat')
        this.user = this.gun.user()

        if (!this.user.is)  //if not log in.
            return

        this.userAttributes = this.user.get('Attributes')
        if (!this.userAttributes)  //if no userAttributes
            return
        var stageName = this.stageName
        if(!msg.message)
            return
        var c = msg.message.charAt(msg.message.length - 1)
        if (c !== '?')
            return; //not a question, ignore.
        // var resans = PatternQuestion.test(msg.message)
        // if(!resans) 
        //     return; //not a question, ignore.

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
            if (!("answer" in data))
                return //means question exists without an answer.
            
            const when = Gun.time.is()

            var answer = {
                stageName,
                when,
                message: data.answer,
                bot: true,
            }
                       
            // console.log("ChatAI msg", msg);
            // console.log("ChatAI answer", answer);

            var gAns = chat.set(answer);

            var soul = msg._['#'];
            var gQuestion = chat.get(soul);

            console.log("ChatAI question soul", soul)
            console.log("ChatAI answer soul ", gAns._.get);  //why is this undefined?

            gQuestion.get('downlink').put(gAns);   //link question to answer.
            gAns.get('uplink').put(gQuestion);    //link answer to question.
            
            console.log("ChatAI gQuestion", gQuestion);  
            console.log("ChatAI gAns", gAns);

            //get both question and answer from questin node.
            gQuestion.get('message').once( msg => {
                console.log("ChatAI from question Q=", msg)
            })
            gQuestion.get('downlink').once( msg => {
                console.log("ChatAI from question A.message=", msg.message)
                console.log("ChatAI from question answer soul=", msg._['#'])
            })
            // gQuestion.get('_').once( msg => {
               console.log("ChatAI from question Question soul=", gQuestion._.get)
               console.log("ChatAI from question Question =", gQuestion._.put.message)
               console.log("ChatAI from question answer soul =", gQuestion._.put.downlink)
            // })

            //get both question and answer from answer node.
            gAns.get('uplink').once( ques => {
                console.log("ChatAI from gAns questione=", ques.message)
            })
            gAns.get('message').once( ans => {
                console.log("ChatAI from gAns answer=", ans)
            })
            console.log("ChatAI from answer answer soul=", gAns._.get)
            console.log("ChatAI from answer answer =", gAns._.put.message)
            console.log("ChatAI from answer question soul =", gAns._.put.uplink)

        })

    }
}