import Gun from 'gun/gun'
import Sea from 'gun/sea' 
import 'gun/lib/open'
import 'gun/lib/unset'
import _ from 'lodash'
/*
   class Entity {
       identity,
       self, //a list of Q/A that describes the person's attributes
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
    constructor( url: string){
        
        // localStorage.clear();

        this.gun = new Gun(url)
        this.sign = this.gun.get('sign')
        this.user = this.gun.user()
        this.chat = this.gun.get('chat')
        this.userlist = this.gun.get('userlist')
        // this.userlist.on(this.cbNewUser);
        this.msgs = {}
    }

    cbNewUser(newuser){
        console.log("New user is on", newuser);
        
    }
    // public chat() { return this.chat; }
    // public user() { return this.user; }
    static time() { 
        var t = Gun.time.is();
        // console.log("chat", t);
        return t;
    }
    static random() { return Gun.text.random(4);}
    isUserOnline(){
        return this.user.is
    }

    create(name: string, password: string) {
        return this.user.create(name, password);
            // if(!ack.wait){ but.removeClass('pulse') }    
    
    }
    listentouser(cb){
        this.userlist.on(data => {
            this.usercount(cb) 
        });
    }

    hookUserList = (UIcb) => {
        this.userlist.open((list) => {
            const reducer = (newList, key) => {
                if (list[key] && !!Object.keys(list[key]).length && list[key].name) {
                    // console.log("key", key)
                    // console.log("user", list[key].name)
                    // console.log("newList len=", newList.length);
                    // console.log("newList", newList);
                    return [...newList, {text: list[key].name, key} ];
                } else{
                    return newList;
                };
            }
            const keylist = Object.keys(list);
            if(keylist == undefined) {
                // console.log("keylist is undefined")
                return;
            }
            // console.log(keylist);
            var userList1 = keylist.reduce( reducer, []);
            // if(userList1 && userList1.length)
            //    console.log("hookUserList", "got user num=" + (userList1.length ? userList1 : 0));
            // else
            //    console.log("hookUsersLilst", "no user found!");
            if(UIcb)
                UIcb({list: userList1 || []});
        });
    }

    leave(name: string, password: string, Signcb) {
        this.user.leave()
        var user = this.user.get(name)
        // console.log("leave", "unset "+ user)
        this.userlist.unset(user)
        Signcb(false)
    }

    async auth(name: string, password: string, Signcb) {
        this.user.auth(name, password, ack=>{
            if(ack.err){
                console.log('err', ack.err);
                Signcb && Signcb(false);
                return;
            }
            var user = this.user.get(name).put({name: name})
            this.userlist.set(user)
            // this.userlist.set({text: name})
            // console.log(user);
            // this.hookUserList(UIcb);
            Signcb(true);
        });
        // console.log("Bernard");
        // var numberofusers = 0;
        // this.user.once(data => {
        //     console.log(data);
        //     numberofusers = Object.keys(data).length;
        // } );
        // console.log("bernard:", "numberof users="+ numberofusers);
        // var userlistkeys = Object.keys(this.userlist);
        // console.log(userlistkeys);
        // console.log("len="+userlistkeys.length);
        // return numberofusers;
    }

    usercount(cb){

        this.hookUserList(cb);
        // var numberofusers = 0;
        // this.userlist.once(data =>{
        //     //ui.list.user(user);
        //     console.log(data);
        //     numberofusers = data ? (Object.keys(data).length  -1): 0;
        //     console.log("usercount:", "callback number of users="+ numberofusers);
        //     cb(numberofusers);

        //   });
        // console.log(data);
        // numberofusers = Object.keys(data).length;
        
        //   return ;// numberofusers;
    }

    saveMessage(key: string, obj: Object){
        // console.log("Entity", key);
        // console.log("Entity", obj);
        this.chat.path(key).put(obj);    
    }

    //prepare data for UI.
    onChatMessage(CMcb) {
        console.log('Entity onChatMessage', 'entered')
        const tmpState = {}
        // let msgs = {};
        this.chat.map().once((msg, key) => {
            tmpState[key] = msg
            // console.log('Entity onChatMessage', key)
            // console.log('Entity onChatMessage', msg)
            // console.log("local msgs len=", Object.keys(this.msgs).length)
            // console.log("tmpState len=", Object.keys(tmpState).length)
            this.msgs = Object.assign({}, this.msgs, tmpState)
            CMcb({msgs: this.msgs})
          })
        // console.log(msgs)
        // CMcb({msgs});    
    }
    
}