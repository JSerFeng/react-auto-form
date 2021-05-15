import { ConfigItem, MainConfig } from "./interfaces"




let id = 0

export function createConfigItem(customConfig: Partial<ConfigItem>) {
  const configItem: ConfigItem = {
    name: customConfig.name || "initial" + ++id,
    label: customConfig.label || "",
    type: "text",
    layout: {
      w: 200,
      h: 32,
      x: 20,
      y: 20,
      zIndex: 0,
      labelAlign: "right",
      labelCol: { span: 8 }
    },
    required: true,
    style: {
      fontSize: 16,
      color: "black",
      backgroundColor: "",
      fontWeight: "normal"
    }
  }
  for (const k in customConfig) {
    /**@ts-ignore */
    const v = customConfig[k]
    /**@ts-ignore */
    configItem[k] = v
    if (typeof v === "object" && v !== null) {
      /**@ts-ignore */
      mergeMutable(v, configItem[k])
    }
  }

  return configItem
}

export function mergeConfig(customConfig: Record<string, any>): MainConfig {
  const config: MainConfig = {
    request: {
      method: "POST",
      url: "http://localhost:7001",
      contentType: "application/json"
    },
    components: [],
  }
  for (const option in customConfig) {
    const v = customConfig[option]
    /**@ts-ignore */
    config[option] = v
    if (typeof v === "object" && v !== null) {
      /**@ts-ignore */
      mergeMutable(v, config[option])
    }
  }
  return config
}

export function mergeMutable(customConfig: Record<string, any>, defaultConfig: Record<string, any>) {
  for (const k in defaultConfig) {
    const v = defaultConfig[k]
    if (typeof v === "object" && v !== null) {
      mergeMutable(customConfig[k], v)
    } else if (customConfig[k] === undefined) {
      customConfig[k] = v
    }
  }
}

export function createFormData(values: Record<string, any>) {
  const fd = new FormData()
  for (const key in values) {
    fd.append(key, values[key])
  }
  return fd
}