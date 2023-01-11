
export const debouncer = (fn: (...rest: any[]) => void, timer?: number) => {
    timer = timer || 500;
    let handle: NodeJS.Timeout;
    function out (...rest: any[]) {
        clearTimeout(handle);
        handle = setTimeout(() => {
            fn.apply(this, rest);
        }, timer);
    };
    return out;
};



