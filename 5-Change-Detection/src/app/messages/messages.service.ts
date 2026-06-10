import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor() {}
  
  messages: string[] = [];

  onAddMessage(message:string){
    this.messages=[...this.messages,message]
  }
}
