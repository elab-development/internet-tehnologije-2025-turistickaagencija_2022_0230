import { Directive, ElementRef, HostBinding, HostListener, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appButtonHover]',
    standalone: true
})

export class ButtonHoverDirective {
    constructor(private el: ElementRef, private renderer: Renderer2) {}
    
    @HostBinding('style.backgroundColor') bg = 'black';
    @HostBinding('style.color') color = '#ffffff';
    @HostBinding('style.borderColor') border = '#ffffff55';

    @HostListener('mouseenter') onMouseEnter() {
        this.bg = '#FFD400';
        this.color = '#050606';
        this.border = '#FFD400';
    }
    @HostListener('mouseleave') onMouseLeave() {
        this.bg = 'black';
        this.color = '#ffffff';
        this.border = '#ffffff55';      
    }

}