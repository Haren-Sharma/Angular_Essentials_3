import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { MessagesService } from '../messages.service';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  templateUrl: './messages-list.component.html',
  styleUrl: './messages-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent implements OnInit {
  constructor(
    private messagesService: MessagesService,
    private cdRef: ChangeDetectorRef,
    private desRef: DestroyRef,
  ) {}

  messages:string[]=[]

  ngOnInit(): void {
    const subscription = this.messagesService.messages$.subscribe(
      //this method will be executed every time a new value is emitted
      (messages) => {
        this.messages=messages
        this.cdRef.markForCheck(); //manually trigeering change detection 
      },
    );
    this.desRef.onDestroy(() => {
      //cleanup
      subscription.unsubscribe();
    });
  }

  get debugOutput() {
    console.log('[MessagesList] "debugOutput" binding re-evaluated.');
    return 'MessagesList Component Debug Output';
  }
}
