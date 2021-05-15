import { PageHeader } from "antd";
import { FC } from "react";
import { connect } from "react-redux";
import { Dispatch } from 'redux'
import { ConfigItem } from "../../render/interfaces";
import { createConfigItem } from "../../render/utils"
import { Actions } from "../../store/reducer";
import "./widgets.scss"


const { actAddItem } = Actions

let id = 0
function getId() {
  return ++id
}


const widgets: { name: string, id: number, config: ConfigItem }[] = [
  {
    name: "输入框",
    id: getId(),
    config: createConfigItem({
      type: "text",
      label: "输入框",
      name: "input",
    })
  }
  , {
    name: "开关",
    id: getId(),
    config: createConfigItem({
      type: "switch",
      label: "开关",
      name: "label" + getId(),
    })
  }, {
    name: "单选框",
    id: getId(),
    config: createConfigItem({
      type: "radio",
      label: "单选框",
      name: "radio",
      props: {
        options: [
          {
            label: "示例A",
            value: 1
          }, {
            label: "示例B",
            value: 2
          }, {
            label: "示例C",
            value: 3
          }
        ]
      }
    }),
  }, {
    name: "密码框",
    id: getId(),
    config: createConfigItem({
      type: "password",
      label: "密码",
      name: "password"
    })
  }, {
    name: "网址",
    id: getId(),
    config: createConfigItem({
      type: "url",
      label: "网址",
      name: "url",
    })
  }, {
    name: "提交按钮",
    id: getId(),
    config: createConfigItem({
      type: "submit",
      label: "提交",
      name: "submit",
    })
  }
]


const Widgets: FC<{
  dispatch: Dispatch
}> = (props) => {
  const createWidget = (widget: { name: string, config: ConfigItem }) => {
    const config = createConfigItem(widget.config)
    config.name = getId().toString()
    props.dispatch(actAddItem(config))
  }
  return (
    <div className="widgets">
      <PageHeader title="组件" subTitle="点击生成组件" />
      <ul>
        {
          widgets.map((widget, i) => (
            <li
              className="flex jc ac"
              key={ i }
              onClick={ createWidget.bind(null, widget) }
            >
              { widget.name }
            </li>
          ))
        }
      </ul>
    </div>
  )
}

export default connect()(Widgets)