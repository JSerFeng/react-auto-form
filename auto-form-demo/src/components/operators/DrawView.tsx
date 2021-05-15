import { FC } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { MainConfig } from "../../render/interfaces";
import { Actions, BaseState } from "../../store/reducer";
import { Row, Col, InputNumber, Button } from 'antd'
import { WritableDraft } from "immer/dist/internal";
import produce from "immer";

const { actMainConfig, actResetDraw } = Actions

const DrawView: FC<{
  dispatch: Dispatch,
  mainConfig: MainConfig
}> = ({ dispatch, mainConfig }) => {

  const dispatchChange = (cb: (draft: WritableDraft<MainConfig>) => void) => dispatch(actMainConfig(produce(mainConfig, cb)))

  return (
    <div>
      <Row gutter={ [0, 16] } align="middle">
        <Col span={ 24 }>
          <Button danger type="primary" onClick={ () => {
            dispatch(actResetDraw())
          } }>重置画布</Button>
        </Col>

        <Col span={ 8 }>宽度</Col>
        <Col span={ 16 }>
          <InputNumber value={ mainConfig.layout!.w }
            onChange={ w => {
              dispatchChange(it => { it.layout!.w = w })
            } }
          />
        </Col>
      </Row>
      <Row>
        <Col span={ 8 }>高度</Col>
        <Col span={ 16 }>
          <InputNumber value={ mainConfig.layout!.h }
            onChange={ h => {
              dispatchChange(it => { it.layout!.h = h })
            } }
          />
        </Col>
      </Row>
    </div>
  )
}

export default connect(
  (state: BaseState) => ({ mainConfig: state.mainConfig }),
  dispatch => ({ dispatch })
)(DrawView)
