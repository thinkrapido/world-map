
export const zip = (a: any[], b: any[]): any[][] => a.map((k: any, i: number): any[] => [k, b[i]])

export const pairs = (a: any[]): any[][] => zip([a[a.length-1],...a],[...a, a[0]])
