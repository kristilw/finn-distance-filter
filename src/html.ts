
export namespace HTML {
    export const lineBreak = '<br />';

    export function b(content: string): string {
        return '<b>' + content + '</b>';
    }

    export function a(href: string, content: string): string {
        return '<a href=\"' + href + '\">' + content +'</a>'
    }

    export function h3(content: string): string {
        return '<h3>' + content + '</h3>'
    }

    export function div(...content: string[]): string {
        return '<div>' + content.join('') + '</div>'
    }
    
    export function span(content: string): string {
        return '<span>' + content + '</span>'
    }
    
    export function table(content: string): string {
        return '<table>' + content + '</table>'
    }
    
    export function tr(content: string): string {
        return '<tr>' + content + '</tr>'
    }
    
    export function th(content: string): string {
        return '<th>' + content + '</th>'
    }
    
    export function td(content: string): string {
        return '<td>' + content + '</td>'
    }
    
    export function ul(...content: string[]): string {
        return '<ul>' + content.map((c) => '<li>' + c + '</li>').join('') + '</ul>'
    }
}