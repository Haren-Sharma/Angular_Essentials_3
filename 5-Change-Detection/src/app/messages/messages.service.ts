import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class MessagesService {
  constructor() {}
  
  private messages= signal<string[]>([]);

  allMessages=this.messages.asReadonly()

  onAddMessage(message:string){
    this.messages.update((oldTasks)=>[...oldTasks,message])
  }
}
