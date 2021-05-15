import { FC, memo } from "react";
import "./operators.scss"
import { Tabs } from "antd"
import GeneralConfig from "./GeneralConfig";
import WidgetConfig from "./WidgetConfig";
import { connect } from "react-redux";
import { BaseState } from "../../store/reducer";
import DrawView from "./DrawView";

const { TabPane } = Tabs

const options = [
  {
    tab: "通用",
    component: GeneralConfig
  }, {
    tab: "组件",
    component: WidgetConfig
  }
]

const Operators: FC<{
  selectedIndex: number
}> = ({ selectedIndex }) => {
  return (
    <div className="operators">
      <Tabs style={ { width: "100%" } }>
        {
          selectedIndex === -1
            ? <DrawView />
            : options.map(({ tab, component: C }) => (
              <TabPane tab={ tab } key={ tab }>
                <C />
              </TabPane>
            ))
        }
      </Tabs>
    </div>
  )
}

export default memo(connect(
  (state: BaseState) => ({ selectedIndex: state.selectedIndex })
)(Operators))
