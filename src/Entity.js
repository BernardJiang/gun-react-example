import Gun from 'gun/gun'
import Sea from 'gun/sea' 

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
        this.gun = new Gun(url)
        this.sign = this.gun.get('sign')
        this.user = this.gun.user()
        this.chat = this.gun.get('chat2')
        this.userlist = this.gun.get('userlist')
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

    auth(name: string, password: string) {
        
        this.user.auth(name, password).then(this.userlist.set({name, password}));
        var userlistkeys = Object.keys(this.userlist);
        console.log(userlistkeys);
        console.log("len="+userlistkeys.length);
        return userlistkeys.length;
    }

    usercount(){
        this.userlist.map().once(function(user, id){
            //ui.list.user(user);
            console.log("user =", user);
            console.log("id =", id);
          });
    }

    saveMessage(key: string, obj: Object){
        console.log("Entity", key);
        console.log("Entity", obj);
        this.chat.path(key).put(obj);    
    }

    
    
}