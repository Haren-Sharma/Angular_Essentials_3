// HOW TO MAKE A STRUCTURAL DIRECTIVE
// -----------------------------------
// A structural directive conditionally adds or removes DOM elements.
// Unlike attribute directives (which change appearance), structural directives
// change the DOM structure — similar to *ngIf, *ngFor, etc.
//
// Steps to create one:
//   1. Decorate a class with @Directive and give it an attribute selector: '[appMyDir]'
//   2. Inject TemplateRef  — the blueprint of the <ng-template> content
//   3. Inject ViewContainerRef — the slot in the DOM where content will be inserted
//   4. Use createEmbeddedView() to render the template, and clear() to remove it

import {
  Directive,
  effect,
  inject,
  input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { AuthService } from './auth.service';
import { Permission } from './auth.model';

// @Directive marks this class as an Angular directive (not a component — no template of its own).
// selector: '[appAuth]' means it activates on any element/ng-template that has the appAuth attribute.
@Directive({
  selector: '[appAuth]',
  standalone: true,
})
export class AuthDirective {
  // input.required reads the value passed to appAuth="admin|user|guest".
  // The alias maps the attribute name 'appAuth' to the property 'userType' inside this class.
  userType = input.required<Permission>({ alias: 'appAuth' });

  // AuthService holds a signal with the currently logged-in user's permission level.
  private authService = inject(AuthService);

  // TemplateRef gives the reference to the content between the <ng-template> tags.
  private templateRef = inject(TemplateRef);

  // ViewContainerRef represents the specific DOM position/slot right where the <ng-template> sits.
  // It is NOT the ng-template element itself (that's TemplateRef), and NOT the whole template file.
  // createEmbeddedView() inserts content at this position; clear() removes it.
  private viewContainerRef = inject(ViewContainerRef);

  constructor() {
    // effect() re-runs its callback whenever any signal it reads changes.
    // Here it reacts to changes in activePermission (login/logout) or userType (the input).
    effect(() => {
      if (this.authService.activePermission() === this.userType()) {
        // Render the <ng-template> content into the DOM at this directive's position.
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      } else {
        // Remove any previously rendered content from the DOM.
        this.viewContainerRef.clear();
      }
    });
  }
}
