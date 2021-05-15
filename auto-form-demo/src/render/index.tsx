import { Button, Form, Input, Switch, Radio } from 'antd'
import { FC, ReactElement } from 'react';
import axios from 'axios';
import { mergeConfig, mergeMutable, createConfigItem, createFormData } from "./utils"
import { MainConfig, ConfigItem, ContentType } from "./interfaces"
export { mergeMutable, createConfigItem }





const inst = axios.create({})

const AutoForm: FC<{ config: MainConfig }> = (props) => {
  const config = mergeConfig(props.config)
  const mainConfig = config
  const components = mainConfig.components

  const handleFinish = (values: any) => {
    console.log(values);
    const { method, url, contentType } = mainConfig.request
    inst.request({
      method: method,
      url: url,
      headers: {
        contentType
      },
      data: contentType === ContentType.ApplicationJson ? values : createFormData(values)
    })
  }

  return (
    <Form
      { ...mainConfig.layout }
      onFinish={ handleFinish }
    >
      { components.map(item => getFormItem(item)) }
    </Form>
  )
}

export const getFormItem = (config: ConfigItem) => {
  const rules = config.rules || []
  if (config.required) {
    rules.unshift({
      required: true,
      message: "输入不能为空"
    })
  }

  const formFields: Record<string, any> = {
    label: config.label,
    name: config.name,
    initialValue: config.defaultValue,
    rules: rules,
    className: "form-item",
    noStyle: !!config.layout.noStyle,
    labelAlign: config.layout.labelAlign,
    labelCol: config.layout.labelCol,
  }

  let FormComponent: ReactElement | null = null

  switch (config.type) {
    case "text":
    case "url":
    case "password":
      FormComponent = config.type === "password"
        ? <Input.Password
          style={ {
            height: config.layout.h
          } }
          placeholder={ config.placeholder } />
        : <Input
          style={ {
            height: config.layout.h
          } }
          placeholder={ config.placeholder } />
      break
    case "submit":
      formFields.label = ""
      FormComponent = <Button
        style={ {
          height: config.layout.h,
          width: config.layout.w,
        } }
        type="primary" htmlType="submit">
        { config.label }
      </Button>
      break
    case "switch":
      formFields.valuePropName = "checked"
      FormComponent = <Switch />
      break
    case "radio":
      FormComponent = <Radio.Group
        style={ {
          width: config.layout.w,
          height: config.layout.h
        } }
      >
        {
          config.props?.options?.map(opt => (
            <Radio.Button
              key={ opt.value }
              value={ opt.value }
            >{ opt.label }</Radio.Button>
          ))
        }
      </Radio.Group>
      break
  }

  return (
    <Form.Item { ...formFields }>
      { FormComponent || "" }
    </Form.Item>
  )
}

export default AutoForm