import { Directive, Input } from "@angular/core";

@Directive({
    selector:'[appSafeLink]',
    standalone:true,
    host:{
        '(click)':'navigate($event)'
    }
})
export class SafeLinkDirective{
    @Input({alias:'appSafeLink'}) inputVar!:string

    constructor(){
        console.log("Safe Link Directive is active")
    }

    navigate(event:MouseEvent){
        const isNavigate=window.confirm("Do you want to navigate ?");
        if(isNavigate){
            let address=(event.target as HTMLAnchorElement).href;
            (event.target as HTMLAnchorElement).href=address+"?from="+this.inputVar ;
            return ;
        } 
        event.preventDefault();
    }
}