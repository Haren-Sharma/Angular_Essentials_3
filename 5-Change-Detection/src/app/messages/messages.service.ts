import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor() {}

  messages=signal<string[]>([]);
  messages$ = new BehaviorSubject<string[]>([]);

  onAddMessage(message: string) {
    this.messages.update((oldMsgs)=>[...oldMsgs,message])
    this.messages$.next(this.messages());
  }
}
