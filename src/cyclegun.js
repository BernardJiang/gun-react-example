import xs, {Listener, Stream} from 'xstream'
// import * as Gun from 'gun'
import Gun from 'gun/gun'
import Sea from 'gun/sea'
import path from 'gun/lib/path'
import {promOnce, promPut, promSet, promOn} from 'gun/lib/path'
import open from 'gun/lib/open'
import 'gun/lib/open'
import 'gun/lib/unset'

export class GunSource {
//   private gun: any
//   private path: Array<string>

  constructor(gun, path) {
    this.gun = gun
    this.path = path
  }

  select(key) {
    return new GunSource(this.gun, this.path.concat(key))
  }
  
  selectUser() {
    return new GunSource(this.gun.user(), '')
  }

  isOnline() {
    const self = this
    return xs.periodic(1000);
    
    // xs.create({
    //   id:0,
    //   start(listener) {
    //     console.log('isOnline: ', id)
    //     // self.gun.user().on((x) => {
    //       setInterval(() => {listener.next(id); id=id+1}, 1000)
    //       // listener.next()
    //     // })
    //   },
    //   stop() {
    //   },
    // })

  }

  getUserList() {
    const self = this
    return xs.create({
      start(listener) {
        // console.log('shallow: ' + self.path)
        self.gun.get(...self.path).on((state) => {
          // console.log('shallow: ' + self.path + ". state= ")
          // console.log(state)
          let newlist = []
          for (let key in state) {
            let row = state[key];
            if (row === null || key === '_')
              continue;
            // console.log( "key=", key, ". row=", row)
            newlist.push(key)
          }
          // console.log("newlist = ", newlist);
          listener.next({userlist: newlist})
        })
      },
      stop() {
      },
    })
  }
  getSignStatus() {
    const self = this
    return xs.create({
      start(listener) {
        // console.log('shallow: ' + self.path)
        self.gun.get(...self.path).on((state) => {
          // console.log('shallow: ' + self.path + ". state= ")
          // console.log(state)
          let auth = false
          let name = ''
          for (let key in state) {
            let row = state[key];
            if (key === 'stageName')
              name = row
            if (key === 'signin')
              auth = row
            // console.log("key=", key, ". row=", row)
          }
          let newstatus = { authenticated: auth, stageName: name }
          // console.log("newstatus = ", newstatus);
          listener.next(newstatus)
        })
      },
      stop() {
      },
    })
  }



  shallow() {
    const self = this

    return xs.create({
      start(listener) {
        // console.log('shallow: ' + self.path)
        self.gun.get(...self.path).on((x) => {
          // console.log('shallow: ' + self.path + ". x= ")
          // console.log(x)
          listener.next(x)
        })
      },
      stop() {
      },
    })
  }

  each() {
    const self = this
    return xs.create({
      start(listener) {
        // console.log('each: ' + self.path)
        self.gun.get(...self.path).map().on((value, key) => {
          listener.next({key, value})
        })
      },
      stop() {
      },
    })
  }
}

export type Command = (gun) => void

export function makeGunDriver(opts) {
  // console.log('gun opts.root--------------------------------------')
  // console.log(opts)
  // console.log('-----------------------------------------------------')

  const gun = Gun(opts)

  return function gunDriver(sink) {
    sink.addListener({
      next: (command) => {
          if( typeof command === "function"){
            // console.log("command is ", command)
            command(gun)
          } 
          // else
          //   console.log('command is not a function!!!')
          //   console.log(command)
        },
    })

    return new GunSource(gun, [])
  }
}
