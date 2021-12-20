// Idea to how to parse minzinc flags to json
export const configToJSONParser = (configString: string): {[key: string]: any} => {
    const _configToJSONParser = (configs: string[], result: {[key: string]: any}): {[key: string]: any} => {
        if(configs.length === 0)
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
        return _configToJSONParser(configs, result);
    }
    const resolveKey = (key: string) => {
        if(key.startsWith("--"))
            return key.slice(2, key.length);
        else 
            return key.slice(1, key.length);
    }
    return _configToJSONParser(configString.split(" "), {});
}