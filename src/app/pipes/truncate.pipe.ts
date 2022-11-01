import { Pipe, PipeTransform } from '@angular/core';

/**
 * Truncates string to given character length (default: 20)
 */
@Pipe({
    name: 'truncate',
})
export class TruncatePipe implements PipeTransform {
    transform(value: string, args?: any[]): string {
        const limit = args.length > 0 ? parseInt(args[0], 10) : 20;

        return value.length > limit ? `${value.substring(0, limit)}...` : value;
    }
}
