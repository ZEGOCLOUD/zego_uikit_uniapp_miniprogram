type Listener<T> = {
    key: string;
    data: T;
};

export class NotifyList<T> {
    private listeners: Listener<T>[] = [];

    public addListener(key: string, data: T): void {
        this.listeners.push({key, data });
    }

    public removeListener(key:string): void {
        this.listeners = this.listeners.filter(listener => listener.key !== key);
    }

    public notifyAllListener(notifier: (data: T) => void): void {
        this.listeners.forEach(listener => {
            notifier(listener.data);
        });
    }

    public clear(): void {
        this.listeners = [];
    }
}