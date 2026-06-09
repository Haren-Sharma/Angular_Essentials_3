import { Injectable, signal } from '@angular/core';
import { Task, TaskStatus } from './task.model';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private tasks = signal<Task[]>([]);

  allTasks = this.tasks.asReadonly();

  addTask(title: string, description: string) {
    const newTask: Task = {
      id: Math.random().toString(),
      title,
      description,
      status: 'OPEN',
    };
    this.tasks.update((oldTasks) => [...oldTasks, newTask]);
  }

  updateTaskStatus(taskId: string, newStatus: TaskStatus) {
    console.log('Update Tasks!!');
    this.tasks.update((oldTasks) => {
      return oldTasks.map((t) => {
        if (t.id === taskId) {
          console.log("ID Matched")
          return {
            ...t,
            status:newStatus
          }
        } else {
          return t;
        }
      });
    });
    console.log(this.tasks());
  }
}
