import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor() {}

  messages: string[] = [];
  messages$ = new BehaviorSubject<string[]>([]);

  onAddMessage(message: string) {
    this.messages = [...this.messages, message];
    this.messages$.next(this.messages);
  }
}
