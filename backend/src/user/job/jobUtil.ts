// Idea to how to parse minzinc flags to json
export const configToJSON = (configString: string, result: {[key: string]: any} = {}): {[key: string]: any} => {
    const _configToJSONParser = (configs: string[]): {[key: string]: any} => {
        if(configs.length === 0 || configs[0].length === 0)
            return result;
        if(configs.length === 1) {
            result[resolveKey(configs[0])] = true;
            return result;
        }
        const key = resolveKey(configs.shift()!);
        if(configs[0].startsWith("-"))
            result[key] = true;
        else
            result[key] = configs.shift()!;
        return _configToJSONParser(configs);
    }
    const resolveKey = (key: string) => {
        if(key.startsWith("--"))
            return key.slice(2, key.length);
        else 
            return key;
    }
    return _configToJSONParser(configString.split(" "));
}