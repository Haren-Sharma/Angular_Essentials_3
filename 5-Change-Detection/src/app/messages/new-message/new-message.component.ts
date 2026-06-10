import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessagesService } from '../messages.service';

@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class NewMessageComponent {
  constructor(private messagesService: MessagesService) {}

  enteredText = '';

  get debugOutput() {
    console.log('[NewMessage] "debugOutput" binding re-evaluated.');
    return 'NewMessage Component Debug Output';
  }

  onSubmit() {
    this.messagesService.onAddMessage(this.enteredText);
    this.enteredText = '';
  }
}
