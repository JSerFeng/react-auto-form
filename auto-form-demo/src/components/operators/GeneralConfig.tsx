import { FC } from "react";
import { ConfigItem } from "../../render/interfaces";
import { Dispatch } from 'redux'
import { connect } from "react-redux"
import { Input, InputNumber, Radio, Row, Col, Switch } from 'antd'
import { Actions, BaseState } from "../../store/reducer";
import produce from "immer";
import { WritableDraft } from "immer/dist/internal";


const { actConfigItem } = Actions

const GeneralConfig: FC<{
  config: ConfigItem | null,
  dispatch: Dispatch
}> = ({ config, dispatch }) => {
  if (!config) return <div>未选择组件</div>

  const dispatchChange = (cb: (config: WritableDraft<ConfigItem>) => void) => {
    dispatch(actConfigItem(produce(config, (it) => {
      cb(it)
    })))
  }

  const changeZIndex = (idx: number) => {
    dispatchChange((it) => {
      it.layout.zIndex = idx
    })
  }

  const changeFontSize = (fontSize: number) => {
    dispatchChange((it) => {
      if (!it.style) {
        it.style = {
          fontSize,
          fontWeight: 500,
          color: "black",
          backgroundColor: ""
        }
      }
      it.style.fontSize = fontSize
    })
  }

  const changeWidth = (w: number) => {
    dispatchChange((it) => {
      it.layout.w = w
    })
  }

  const changeHeight = (h: number) => {
    dispatchChange(it => {
      it.layout.h = h
    })
  }

  return (
    <div>
      <Row className="config-list" align="middle">
        <Col span={ 8 }>
          层级
        </Col>
        <Col >
          <InputNumber
            value={ config.layout.zIndex }
            onChange={ (num) => {
              changeZIndex(num)
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          字体大小
        </Col>
        <Col span={ 8 }>
          <InputNumber
            value={ config.style?.fontSize }
            onChange={ (num) => {
              changeFontSize(num)
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          宽
        </Col>
        <Col span={ 8 }>
          <InputNumber
            style={ {
              width: "100%!important"
            } }
            value={ config.layout.w }
            onChange={ (num) => {
              changeWidth(num)
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          x坐标
        </Col>
        <Col span={ 8 }>
          <InputNumber
            value={ config.layout.x }
            onChange={ (num) => {
              dispatchChange(it => it.layout.x = num)
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          y坐标
        </Col>
        <Col span={ 8 }>
          <InputNumber
            style={ {
              width: "100%!important"
            } }
            value={ config.layout.y }
            onChange={ (num) => {
              dispatchChange(it => it.layout.y = num)
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          高
        </Col>
        <Col span={ 8 }>
          <InputNumber
            value={ config.layout.h }
            onChange={ (num) => {
              changeHeight(num)
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          文字
        </Col>
        <Col span={ 16 }>
          <Input value={ config.label } onChange={ e => {
            dispatchChange(it => {
              it.label = e.target.value
            })
          } } />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          默认值
        </Col>
        <Col span={ 16 }>
          {
            config.type === "switch"
              ? <Switch checked={ config.defaultValue as boolean } onChange={
                bool => {
                  dispatchChange(it => {
                    it.defaultValue = bool
                  })
                }
              } />
              : <Input value={ config.defaultValue as string } onChange={ e => {
                dispatchChange(it => {
                  it.defaultValue = e.target.value
                })
              } } />
          }
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          文字宽度
        </Col>
        <Col span={ 8 }>
          <InputNumber
            value={ config.layout.labelCol?.span }
            onChange={ (span) => {
              dispatchChange((config) => {
                if (!config.layout.labelCol) {
                  config.layout.labelCol = { span }
                } else {
                  config.layout.labelCol.span = span
                }
              })
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          文字偏移
        </Col>
        <Col span={ 8 }>
          <InputNumber
            value={ config.layout.labelCol?.offset || 0 }
            onChange={ (offset) => {
              dispatchChange((config) => {
                if (!config.layout.labelCol) {
                  config.layout.labelCol = { offset }
                } else {
                  config.layout.labelCol.offset = offset
                }
              })
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          文字排版
        </Col>
        <Col span={ 16 }>
          <Radio.Group
            onChange={ (e => {
              dispatchChange((it) => {
                it.layout.labelAlign = e.target.value
              })
            }) }
            value={ config.layout.labelAlign }
          >
            <Radio value="left">靠左</Radio>
            <Radio value="right">靠右</Radio>
          </Radio.Group>
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          字段名(英文)
        </Col>
        <Col span={ 16 }>
          <Input value={ config.name } onChange={ e => {
            dispatchChange(it => {
              it.name = e.target.value
            })
          } } />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>
          必填
        </Col>
        <Col span={ 16 }>
          <Radio.Group
            onChange={ (e => {
              dispatchChange((it) => {
                it.required = e.target.value
              })
            }) }
            value={ !!config.required }
          >
            <Radio value={ true } >是</Radio>
            <Radio value={ false } >否</Radio>
          </Radio.Group>
        </Col>
      </Row >

      <Row>
        <Col span={ 8 }>不添加标题</Col>
        <Switch checked={ config.layout.noStyle } onChange={ bool => dispatchChange(it => {
          console.log(bool);
          it.layout.noStyle = bool
        }) } />
      </Row>

      <Row>
        <Col span={ 8 }>占位文字</Col>
        <Col span={ 16 }>
          <Input value={ config.placeholder } onChange={
            e => {
              dispatchChange(it => {
                it.placeholder = (e.target as HTMLInputElement).value
              })
            }
          } />
        </Col>
      </Row>

    </div >
  )
}

export default connect(
  (state: BaseState) => ({
    config: state.mainConfig.components[state.selectedIndex]
  }),
  dispatch => ({ dispatch })
)(GeneralConfig)
