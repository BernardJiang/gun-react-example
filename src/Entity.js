import Gun from 'gun/gun'
import Sea from 'gun/sea' 
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
    constructor( url : string){
        // localStorage.clear();
        this.gun = new Gun(url)
        this.sign = this.gun.get('sign')
        this.user = this.gun.user()
        this.chat = this.gun.get('chat2')
        this.userlist = this.gun.get('userlist2')
        this.userlist.on(this.cbNewUser);
    }

    cbNewUser(newuser){
        console.log("New user is on", newuser);
    }
    // public chat() { return this.chat; }
    // public user() { return this.user; }
    static time() { 
        var t = Gun.time.is();
        console.log("chat", t);
        return t;
    }
    static random() { return Gun.text.random(4);}

    create(name: string, password: string) {
        return this.user.create(name, password);
            // if(!ack.wait){ but.removeClass('pulse') }    
    
    }

    async auth(name: string, password: string, cb) {
        
        this.user.auth(name, password, ack=>{
            var user = this.user.get(name).put({name: name})
            this.userlist.set(user)
            console.log(user);
            cb(ack);
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
        var numberofusers = 0;
        this.userlist.once(data =>{
            //ui.list.user(user);
            console.log(data);
            numberofusers = data ? (Object.keys(data).length  -1): 0;
            console.log("usercount:", "callback number of users="+ numberofusers);
            cb(numberofusers);

          });
        // console.log(data);
        // numberofusers = Object.keys(data).length;
        
        //   return ;// numberofusers;
    }

    saveMessage(key: string, obj: Object){
        console.log("Entity", key);
        console.log("Entity", obj);
        this.chat.path(key).put(obj);    
    }

    
    
}