import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import 'gun/lib/open'
import 'gun/lib/unset'

export default class Chatbot {
    constructor(gun) {
        this.gun = gun

        // this.userAttributes = userAttributes

    }
    process(obj) {
        console.log("In Chatbot")
        this.user = this.gun.user()
        this.userAttributes = this.user.get('Attributes')
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
}