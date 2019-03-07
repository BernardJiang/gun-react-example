import Gun from 'gun/gun'
import Sea from 'gun/sea' 

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