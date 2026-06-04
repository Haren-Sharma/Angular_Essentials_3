import { Directive, ElementRef, Input } from "@angular/core";

@Directive({
    selector:'[appSafeLink]',
    standalone:true,
    host:{
        '(click)':'navigate($event)'
    }
})
export class SafeLinkDirective{
    @Input({alias:'appSafeLink'}) inputVar!:string

    constructor(private hostElementRef:ElementRef<HTMLAnchorElement>){ 
        //injecting host element same as we do in components
        //we can also use the inject function
    }

    navigate(event:MouseEvent){
        const isNavigate=window.confirm("Do you want to navigate ?");
        if(isNavigate){
            let address=this.hostElementRef.nativeElement.href;
            this.hostElementRef.nativeElement.href=address+"?from="+this.inputVar ;
            return ;
        } 
        event.preventDefault();
    }
}