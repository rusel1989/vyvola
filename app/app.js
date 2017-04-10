// @flow
import React, { Component } from 'react'
import io from 'socket.io-client'
import db from './storage'

export default class Home extends Component {
  constructor () {
    super()
    document.onkeydown = (e) => {
      if (/^\d$/.test(e.key)) {
        this.setState({ number: this.state.number + e.key })
      }
      if (e.key === 'Backspace' && this.state.number.length) {
        const newLength = this.state.number.length - 1
        this.setState({ number: this.state.number.substr(0, newLength) })
      }
      if (e.key === 'Enter' && this.state.number.length) {
        this.addNumber(this.state.number)
      }
    }
    this.socket = io('http://localhost:8000')
    this.socket.on('connect', function () {
      console.log('connect')
    })
    this.socket.on('sync_board_request', () => {
      this.socket.emit('sync_board_response', this.state.queue)
    })
    this.state = {
      number: '',
      queue: []
    }
  }

  addNumber () {
    if (this.state.number) {
      if (this.findNumber(this.state.number)) {
        return
      }
      const data = { number: this.state.number, status: 'Vyřizuje se', createdAt: new Date(), progress: 0 }
      this.socket.emit('add_number', data)
      this.setState({ queue: [ data, ...this.state.queue ], number: '' })
    }
  }

  findNumber (number) {
    return this.state.queue.find((item) => item.number == number)
  }

  finishNumber (number) {
    const item = this.findNumber(number)
    if (item) {
      item.status = 'Připraveno'
      this.socket.emit('update_number', item)
      const queue = this.state.queue.filter((n) => n.number !== number)
      queue.unshift(item)
      this.setState({ queue })
    }
  }

  ringNumber (number) {
    const item = this.findNumber(number)
    if (item) {
      this.socket.emit('ring_number', item)
    }
  }

  removeNumber (number) {
    const item = this.findNumber(number)
    if (item) {
      this.socket.emit('remove_number', item)
      const queue = this.state.queue.filter((n) => n.number !== number)
      this.setState({ queue })
    }
  }

  componentDidMount () {
    console.log('did mount')
    db.find({}, (err, docs) => {
      if (err) {
        console.log('load docs err', err)
      }
      console.log('have docs', docs.length)
      this.setState({ queue: docs })
    })
  }

  render() {
    return (
      <div id="container">
        <div className="pull-left">
          <div className="text-input">
            {this.state.number}
          </div>
          <ul id="keyboard">
            <li className="letter" onClick={() => this.setState({ number: this.state.number + '1'})}> 1</li>
            <li className="letter" onClick={() => this.setState({ number: this.state.number + '2'})}>2</li>
            <li className="letter" onClick={() => this.setState({ number: this.state.number + '3'})}>3</li>
            <li className="letter clearl" onClick={() => this.setState({ number: this.state.number + '4'})}>4</li>
            <li className="letter" onClick={() => this.setState({ number: this.state.number + '5'})}>5</li>
            <li className="letter" onClick={() => this.setState({ number: this.state.number + '6'})}>6</li>
            <li className="letter clearl" onClick={() => this.setState({ number: this.state.number + '7'})}>7</li>
            <li className="letter" onClick={() => this.setState({ number: this.state.number + '8'})}>8</li>
            <li className="letter" onClick={() => this.setState({ number: this.state.number + '9'})}>9</li>
            <li className="letter clearl" onClick={() => this.setState({ number: this.state.number + '0'})}>0</li>
            <li className="return" onClick={() => this.addNumber()}>ODESLAT</li>
          </ul>
        </div>
        <div className="pull-right">
          <ul id='queue'>
            {this.state.queue.map((item, i) => {
              return (
                <li className='queue-item' key={i}>
                  <div style={{ marginBottom: 15 }}>
                    <strong>{item.number}</strong> {item.status}
                  </div>
                  {item.status !== 'Připraveno'
                  ? (
                  <button className='btn' onClick={() => this.finishNumber(item.number)}>
                    Vyřídit
                  </button>
                  ) : null}
                  <button className='btn btn-remove' onClick={() => this.removeNumber(item.number)}>
                    Odstranit
                  </button>
                  {item.status === 'Připraveno'
                  ? (
                  <button className='btn btn-ring' onClick={() => this.ringNumber(item.number)}>
                    Zazvonit
                  </button>
                  ) : null}
                </li>
              )
              })}
          </ul>
        </div>
      </div>
    );
  }
}
