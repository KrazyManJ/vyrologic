import {ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function uniqueArray<T,>(array: T[]): T[] {
    return array.filter((val,i,arr) => arr.indexOf(val) === i)
}

