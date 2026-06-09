import { Component, computed, inject, signal } from '@angular/core';

import { TaskItemComponent } from './task-item/task-item.component';
import { TasksService } from '../tasks.service';
import { Task } from '../task.model';
import { taskServiceToken } from '../../../main';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  templateUrl: './tasks-list.component.html',
  styleUrl: './tasks-list.component.css',
  imports: [TaskItemComponent],
})
export class TasksListComponent {
  private selectedFilter = signal<string>('all');
  private taskService = inject(taskServiceToken);
  tasks = computed(() => {
    return this.taskService.allTasks().filter((task) => {
      const filter = this.selectedFilter().toUpperCase();
      if (filter === 'ALL') {
        return true;
      } else {
        return task.status === filter;
      }
    });
  });

  onChangeTasksFilter(filter: string) {
    this.selectedFilter.set(filter);
  }
}
