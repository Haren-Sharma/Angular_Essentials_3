import {
  Component,
  Input,
  OnInit,
  OnChanges,
  DoCheck,
  AfterContentInit,
  AfterContentChecked,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';

@Component({
  selector: 'app-lifecycle',
  standalone: true,
  imports: [],
  templateUrl: './lifecycle.component.html',
  styleUrl: './lifecycle.component.css',
})
export class LifecycleComponent
  implements
    OnInit,
    OnChanges,
    DoCheck,
    AfterContentInit,
    AfterContentChecked,
    AfterViewInit,
    AfterViewChecked,
    OnDestroy
{
  @Input() text?: string;

  constructor() {
    console.log('CONSTRUCTOR');
    console.log(this.text) //this will give me undefined because right now text is not available
  }

  ngOnInit() {
    //we should do our main component initialization work here
    console.log('ngOnInit');
  }

  ngOnChanges(changes: SimpleChanges) {
    //fires before ngOnInit with initial values, then again whenever an input value changes
    //here we can update internal state as well depending on the input changes
    console.log('ngOnChanges');
    console.log(changes);
  }

  ngDoCheck() {
    //it is related to angular's change detection mechanism 
    //everytime angualr thinks that an event has occured(anywhere in this application,not just this 
    // component) or UI update is needed,this method will be invoked
    //avoid using this
    console.log('ngDoCheck');
  }

  ngAfterContentInit() {
    //Content is basically the content that might be projected in a View(template)
    // <ng-content />
    console.log('ngAfterContentInit');
  }

  ngAfterContentChecked() {
    console.log('ngAfterContentChecked');
  }

  ngAfterViewInit() {
    //A View is basically the template of the component
    //Technically,the View is an internally managed data structure that holds references 
    //to the DOM elements rendered by a component
    console.log('ngAfterViewInit');
  }

  ngAfterViewChecked() {
    console.log('ngAfterViewChecked');
  }

  ngOnDestroy() {
    console.log('ngOnDestroy');
  }
}
