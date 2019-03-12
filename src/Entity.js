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
   }
*/
export default class Entity {
    constructor( url : string){
        this.gun = new Gun(url)
        this.sign = this.gun.get('sign')
        this.user = this.gun.user()
        this.chat = this.gun.get('chat2')
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
        return this.user.auth(name, password);
    }

    saveMessage(key: string, obj: Object){
        console.log("Entity", key);
        console.log("Entity", obj);
        this.chat.path(key).put(obj);    
    }

    
    
}