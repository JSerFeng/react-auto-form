import produce from 'immer'
import { Reducer } from 'redux'
import { ConfigItem, MainConfig } from '../render/interfaces'
import { message } from "antd"


export interface Pos { //画布位置坐标信息
  w: number,
  h: number,
  x: number,
  y: number
}

export interface BaseState {
  mainConfig: MainConfig, //全局最终配置
  selectedIndex: number
  canvas: { //画布位置坐标信息
    x: number,
    y: number,
    scale: number //缩放
  },
  undoStack: BaseState[],
  redoStack: BaseState[]
}

export enum Types {
  MainConfig = "MainConfig",
  Select = "Select",
  AddItem = "AddItem",
  ConfigItem = "ConfigItem",
  DeleteItem = "DeleteItem",
  CopySelected = "CopySelected",
  ResetDraw = "ResetDraw",
  ChangeWorkingPos = "ChangeWorkingPos",
  Undo = "Undo",
  Redo = "Redo",
}

const AC = <T extends Types, P = null>(type: T, payload: P): { type: T, payload: P } => ({ type, payload })


export const Actions = {
  actSelect: (idx: number) => AC(Types.Select, idx),
  actMainConfig: (config: MainConfig) => AC(Types.MainConfig, config),
  actAddItem: (config: ConfigItem) => AC(Types.AddItem, config),
  actConfigItem: (config: ConfigItem) => AC(Types.ConfigItem, config),
  actDeleteItem: () => AC(Types.DeleteItem, null),
  actCopySelectedItem: () => AC(Types.CopySelected, null),
  actResetDraw: () => AC(Types.ResetDraw, null),
  actChangeWorkingPos: (pos: { x: number, y: number, scale: number }) => AC(Types.ChangeWorkingPos, pos),
  actUndo: () => AC(Types.Undo, null),
  actRedo: () => AC(Types.Redo, null),
}

export type GetActionTypes<A extends { [k: string]: (...args: any[]) => { type: Types, payload: any } }> = { [K in keyof A]: ReturnType<A[K]> }[keyof A]


const defaultConfig: MainConfig = {
  request: {
    method: "POST",
    url: "http://localhost:7001",
    contentType: "application/json"
  },
  components: [],
  layout: {
    labelCol: { span: 4 },
    wrapperCol: { span: 12 },
    w: 400,
    h: 600,
  }
}

const defaultBaseState = {
  mainConfig: defaultConfig,
  selectedIndex: -1,
  canvas: {
    x: 0,
    y: 0,
    scale: 1
  },
  undoStack: [],
  redoStack: []
}

const reducer: Reducer<BaseState, GetActionTypes<typeof Actions>> = (state = defaultBaseState, action) => {
  const newState = produce(state, (state) => {
    switch (action.type) {
      case Types.MainConfig: {
        state.mainConfig = action.payload
        break
      }
      case Types.Select: {
        const idx = action.payload
        state.selectedIndex = idx
        break
      }
      case Types.ConfigItem: {
        const idx = state.selectedIndex
        if (idx !== -1) {
          state.mainConfig.components[idx] = action.payload
        }
        break
      }
      case Types.AddItem: {
        state.mainConfig.components.push(action.payload)
        break
      }
      case Types.DeleteItem: {
        if (state.selectedIndex !== -1) {
          state.mainConfig.components.splice(state.selectedIndex, 1)
          state.selectedIndex = -1
        } else {
          message.info("选择组件后才能删除")
        }
        break
      }
      case Types.CopySelected: {
        let idx: number
        if ((idx = state.selectedIndex) !== -1) {
          const newConfig = { ...state.mainConfig.components[idx] }
          state.mainConfig.components.push(newConfig)
          state.selectedIndex = state.mainConfig.components.length - 1
        }
        break
      }
      case Types.ResetDraw: {
        state.selectedIndex = -1
        state.mainConfig.components = []
        break
      }
      case Types.ChangeWorkingPos: {
        const { x, y, scale } = action.payload
        state.canvas.x = x
        state.canvas.y = y
        state.canvas.scale = scale
      }
    }
  })

  switch (action.type) {
    case Types.Undo: {
      const _undoStack = [...newState.undoStack]

      const popState = _undoStack.pop()
      if (popState) {
        const _redoStack = [...newState.redoStack]
        _redoStack.push(popState)
        return {
          ...popState,
          undoStack: _undoStack,
          redoStack: _redoStack
        }
      } else {
        return newState
      }
    }
    case Types.Redo: {
      const _redoStack = [...newState.redoStack]

      const popState = _redoStack.pop()
      if (popState) {
        const _undoStack = [...newState.undoStack]
        _redoStack.push(popState)
        return {
          ...popState,
          undoStack: _undoStack,
          redoStack: _redoStack
        }
      } else {
        return newState
      }
    }
  }
  return newState
}

export default reducer
