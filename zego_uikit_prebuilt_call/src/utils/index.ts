export * from "./logger";

let listenerSeed = 0

export function makePrebuiltListenerID(): string {
    return `listener_${Date.now()}_${listenerSeed++}`
}

/**
 * 下划线转驼峰
 * @params 数组
 */ 
export function convertToCamelCase(data: any) {
    if (typeof data === 'object') {
        return data.map((obj: object) => {
            const camelCaseObj: object = {};
            for (const key in obj) {
                const camelCaseKey = key.replace(/_([a-z])/g, (_, group) => group.toUpperCase());
                // @ts-ignore
                camelCaseObj[camelCaseKey] = obj[key];
            }
            return camelCaseObj;
        })
    }
}

/**
 * 生成推流ID
 * @param roomID 
 * @param userID 
 * @param channel 
 * @returns 
 */
export function makeStreamID(roomID: string, userID: string, channel = 'main'): string {
    return `${roomID}_${userID}_${channel}`
}

// 深度合并函数
function mergeDeep(target: any, source: any) {
    for (const key in source) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], mergeDeep(target[key], source[key]));
        }
    }

    return Object.assign({}, target, source);
}

/**
 * 辅助函数：合并默认配置和用户配置
 * @param defaultConfig 
 * @param userConfig 
 * @returns 
 */
export function mergeConfigs<T>(defaultConfig: T, userConfig: Partial<T> | null | undefined): T {
    // 如果用户配置为 null 或 undefined，则直接返回默认配置
    if (!userConfig) {
        return defaultConfig;
    }

    // 使用深度合并函数合并默认配置和用户配置
    return mergeDeep(defaultConfig, userConfig) as T;
}