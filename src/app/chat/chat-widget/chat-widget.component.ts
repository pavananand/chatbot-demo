import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core'
import { Subject } from 'rxjs'
import { fadeIn, fadeInOut } from '../animations'
import { DataService } from '../data.service'

const randomMessages = [
  'Nice to meet you',
  'We now support Angular 10!',
  'How are you?',
  'Not too bad, thanks',
  'What do you do?',
  'Is there anything else I can help you with?',
  'That\'s awesome',
  'Angular 10 Elements is the bomb 💣 ',
  'Can you explain in more detail?',
  'Anyway I\'ve gotta go now',
  'It was a pleasure to chat with you',
  'We are happy to make you a custom offer!',
  'Bye',
  ':)',
]

const rand = max => Math.floor(Math.random() * max)

const getRandomMessage = () => randomMessages[rand(randomMessages.length)]

@Component({
  selector: 'chat-widget',
  templateUrl: './chat-widget.component.html',
  styleUrls: ['./chat-widget.component.css'],
  animations: [fadeInOut, fadeIn],
})
export class ChatWidgetComponent implements OnInit {
  @ViewChild('bottom') bottom: ElementRef
  @Input() public theme: 'blue' | 'grey' | 'red' = 'blue'

  public _visible = false
  private _sessionId = '';

  public get visible() {
    return this._visible
  }

  @Input() public set visible(visible) {
    this._visible = visible
    if (this._visible) {
      setTimeout(() => {
        this.scrollToBottom()
        this.focusMessage()
      }, 0)
    }
  }

  public focus = new Subject()

  public operator = {
    name: 'Operator',
    status: 'online',
    avatar: `https://randomuser.me/api/portraits/women/${rand(100)}.jpg`,
  }

  public client = {
    name: 'Guest User',
    status: 'online',
    avatar: `https://randomuser.me/api/portraits/men/${rand(100)}.jpg`,
  }

  public messages = []

  public addMessage(from, text, type: 'received' | 'sent') {
    this.messages.unshift({
      from,
      text,
      type,
      date: new Date().getTime(),
    })
    this.scrollToBottom()
  }

  public scrollToBottom() {
    if (this.bottom !== undefined) {
      this.bottom.nativeElement.scrollIntoView()
    }
  }

  public focusMessage() {
    this.focus.next(true)
  }

  public randomMessage() {
    this.addMessage(this.operator, getRandomMessage(), 'received')
  }

  ngOnInit() {
    setTimeout(() => this.visible = true, 1000)
    setTimeout(() => {
      this.addMessage(this.operator, 'Hi, how can we help you?', 'received')
    }, 1500)
  }

  public toggleChat() {
    this.visible = !this.visible
  }

  public sendMessage({ message }) {
    if (message.trim() === '') {
      return
    }
    const obj = {
      text: message,
      sessionId: this._sessionId
    }
    this.addMessage(this.client, message, 'sent')
    this.dataService.getbotResponse(obj).subscribe(res => {
      if(res) {
        const botResponse = res.output.generic[0].text;      
        this._sessionId = res.context.global.session_id;
        console.log(this._sessionId);
         
        this.addMessage(this.operator, botResponse, 'received')
      }
      
    }, err => {
      console.log({err})
    })
    
    // setTimeout(() => this.randomMessage(), 1000)
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === '/') {
      this.focusMessage()
    }
    if (event.key === '?' && !this._visible) {
      this.toggleChat()
    }
  }

  constructor(private dataService: DataService){}

}
