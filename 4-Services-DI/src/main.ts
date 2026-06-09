import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from './app/app.component';
import { InjectionToken } from '@angular/core';
import { TasksService } from './app/tasks/tasks.service';

export const taskServiceToken = new InjectionToken<TasksService>(
  'task-service-token',
);

// bootstrapApplication(AppComponent).catch((err) => console.error(err));

bootstrapApplication(AppComponent, {
  providers: [
    {
      provide: taskServiceToken,
      useClass: TasksService,
    },
  ],
}).catch((err) => console.error(err));
