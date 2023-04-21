type DataSourceEvent = "onSet";
type ListenerStore = Record<
    DataSourceEvent,
    Record<string, ((data: unknown) => void)[]>
>;
type DataStore = Record<string, unknown>;

const dataStore: DataStore = Object.create(null) as DataStore;

const listenerStore: ListenerStore = {
    onSet: Object.create(null) as Record<string, ((data: unknown) => void)[]>,
};

function set(key: string, value: unknown) {
    dataStore[key] = value;
    if (Object.prototype.hasOwnProperty.apply(listenerStore.onSet, [key])) {
        Object.values(listenerStore.onSet[key]).forEach((listener) => {
            listener(value);
        });
    }
}

function get<T>(key: string): T {
    if (Object.prototype.hasOwnProperty.apply(dataStore, [key])) {
        return dataStore[key] as T;
    }
    throw new Error(`Error code: 1001. 1: ${key}`);
}

function addListener(
    type: DataSourceEvent,
    key: string,
    listener: (data: unknown) => void
) {
    if (!Object.prototype.hasOwnProperty.apply(listenerStore, [type])) {
        listenerStore[type] = Object.create(null) as Record<
            string,
            ((data: unknown) => void)[]
        >;
    }
    if (!Object.prototype.hasOwnProperty.apply(listenerStore[type], [key])) {
        listenerStore[type][key] = [];
    }
    const listenerList = listenerStore[type][key];
    !listenerList.includes(listener) && listenerList.push(listener);
}

function removeListener(
    type: DataSourceEvent,
    key: string,
    listener?: (data: unknown) => void
) {
    if (!Object.prototype.hasOwnProperty.apply(listenerStore, [type])) {
        return;
    }
    if (!Object.prototype.hasOwnProperty.apply(listenerStore[type], [key])) {
        return;
    }
    const listenerList = listenerStore[type][key];
    if (listener) {
        listenerList.includes(listener) &&
            listenerList.splice(listenerList.indexOf(listener), 1);
    } else {
        delete listenerStore[type][key];
    }
}

const DataSource = {
    set,
    get,
    addListener,
    removeListener,
};

export default DataSource;
