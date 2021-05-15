import { FC } from "react";
import { ConfigItem } from "../../render/interfaces";
import { Dispatch } from 'redux'
import { connect } from "react-redux"
import { BaseState } from "../../store/reducer";

const WidgetConfig: FC<{
  config: ConfigItem | null,
  dispatch: Dispatch
}> = (props) => {
  
  return (
    <div>
      <ul className="config-list">
        <li>
          层级
        </li>
      </ul>
    </div>
  )
}

export default connect(
  (state: BaseState) => ({
    config: state.mainConfig.components[state.selectedIndex]
  }),
  dispatch => ({ dispatch })
)(WidgetConfig)
