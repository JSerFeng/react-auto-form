import { Rule } from "antd/lib/form";



export enum ContentType {
  ApplicationJson = "application/json",
  MultipartFormData = "multipart/form-data",
}


export type ItemTypes = "text" | "password" | "url" |
  "switch" | "slider" | "radio" | "checkbox" | "submit"


export interface MainConfig {
  request: {
    method: "GET" | "POST" | "DELETE" | "PUT",
    url: string,
    contentType?: "application/json" | "multipart/form-data" | "multipart/url-encoded",
  },
  components: ConfigItem[],
  layout?: {
    labelCol: { span?: number, offset?: number },
    wrapperCol: { span?: number, offset?: number },
    w: number,
    h: number,
  }
}

export interface ConfigItem {
  id?: Symbol,
  type: ItemTypes,
  label: string,
  name: string,
  layout: {
    x: number,
    y: number,
    w: number,
    h: number,
    zIndex: number,
    labelAlign: "left" | "right",
    labelCol?: { span?: number, offset?: number },
    noStyle?: boolean
  },
  /**组件特有参数 */
  props?: {
    options?: { label: string, value: any }[],
  }
  placeholder?: string,
  defaultValue?: string | boolean,
  required?: boolean,
  rules?: Rule[],
  style?: {
    fontSize: number,
    color: string,
    backgroundColor: string,
    fontWeight: number | string
  }
}