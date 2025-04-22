const redisMock = require('redis-mock')

// redis-mock currently ignores callback argument, the following class fixes this
export default class RedisClient extends redisMock.RedisClient {
  private channels: Map<string, Function[]> = new Map()

  _executeCallback(...args: any[]) {
    if (typeof args[args.length - 1] === 'function') {
      const callback = args[args.length - 1]
      const argList = Array.prototype.slice.call(args, 0, args.length - 1)
      callback(null, argList)
    }
  }

  subscribe(channel: string, ...args: any[]) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, [])
    }
    const callback = args[args.length - 1]
    if (typeof callback === 'function') {
      this.channels.get(channel)?.push(callback)
    }
    this._executeCallback(channel, ...args)
  }

  publish(channel: string, message: string, ...args: any[]) {
    const subscribers = this.channels.get(channel)
    if (subscribers) {
      subscribers.forEach(callback => callback(message))
    }
    this._executeCallback(channel, message, ...args)
  }

  set(...args: any[]) {
    super.set(...args)
    this._executeCallback(...args)
  }
}
