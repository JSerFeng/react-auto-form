import { FC, useEffect, useRef, useState } from "react";
import { Dispatch } from 'redux'
import { Form } from 'antd'
import { connect } from 'react-redux'
import "./view.scss"
import { BaseState, Actions } from "../../store/reducer";
import { MainConfig } from "../../render/interfaces";
import Wrapper from "./Wrapper";
import { fromEvent } from "rxjs";
import { filter, map, switchMapTo, tap } from "rxjs/operators";


const { actCopySelectedItem, actDeleteItem, actSelect, actChangeWorkingPos } = Actions

export function getPos(x: number, y: number, container: HTMLElement, node: HTMLElement) {
  return {
    x: Math.max(Math.min(x, container.offsetWidth - node.offsetWidth), 0),
    y: Math.max(Math.min(y, container.offsetHeight - node.offsetHeight), 0),
  }
}


const View: FC<{
  dispatch: Dispatch,
  mainConfig: MainConfig,
  canvas: { x: number, y: number, scale: number }
}> = ({ dispatch, mainConfig, canvas }) => {
  const container = useRef<HTMLDivElement>(null)
  const [refLines, setRefLines] = useState<[number, number, number][]>([])
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 })
  const [canvasPos, setCanvasPos] = useState(canvas)

  /**初始化让画布处于正中间位置 */
  useEffect(() => {
    const { offsetWidth, offsetHeight } = container.current!.offsetParent as HTMLDivElement

    const { w, h } = mainConfig.layout!
    const initPos = {
      x: offsetWidth / 2 - w / 2,
      y: offsetHeight / 2 - h / 2,
      scale: 1,
    }
    dispatch(actChangeWorkingPos(initPos))
    setCanvasPos(initPos)
  }, [mainConfig.layout, dispatch])

  useEffect(() => {
    const _container = container.current!
    const mouseMove$ = fromEvent(_container, "mousemove")
    const mouseDown$ = fromEvent(_container, "mousedown")
    const keyDown$ = fromEvent(document, "keydown").pipe(
      tap(e => console.log((e as KeyboardEvent).key))
    )

    const cmd$ = keyDown$.pipe(
      filter(e => (e as KeyboardEvent).key === "Control")
    )

    const subDeleteItem = keyDown$.pipe(
      filter(e => (e as KeyboardEvent).key === "Delete")
    ).subscribe(() => {
      dispatch(actDeleteItem())
    })

    const subCopy = cmd$.pipe(
      switchMapTo(keyDown$.pipe(
        filter(e => (e as KeyboardEvent).key.toLowerCase() === "c"),
      ))
    ).subscribe(() => {
      dispatch(actCopySelectedItem())
    })

    const offsetLeft = (_container.offsetParent as HTMLElement).offsetLeft + _container.offsetLeft
    const offsetTop = (_container.offsetParent as HTMLElement).offsetTop + _container.offsetTop

    const showCursorPos = mouseMove$.pipe(
      map(e => {
        const pageX = (e as MouseEvent).pageX - offsetLeft
        const pageY = (e as MouseEvent).pageY - offsetTop

        return {
          x: pageX,
          y: pageY,
        }
      })
    ).subscribe(setCursorPos)

    const selectMain = mouseDown$
      .subscribe(() => {
        dispatch(actSelect(-1))
      })

    return () => {
      showCursorPos.unsubscribe()
      selectMain.unsubscribe()
      subCopy.unsubscribe()
      subDeleteItem.unsubscribe()
    }
  }, [dispatch])

  return (
    <Form className="dev-view flex jc ac"
      style={ {
        minWidth: mainConfig.layout!.w
      } }>
      <div className="absolute" style={ {
        bottom: "1%"
      } }>
        x:{ cursorPos.x } y:{ cursorPos.y }
      </div>
      <div
        className="display-view absolute"
        ref={ container }
        style={ {
          width: mainConfig.layout?.w + "px",
          height: mainConfig.layout?.h + "px",
          left: canvasPos.x + "px",
          right: canvasPos.y + "px",
          transform: `scale(${canvasPos.scale})`
        } }
      >
        {
          mainConfig.components.map((config, idx) => (
            <Wrapper
              container={ container } setRefLines={ setRefLines }
              config={ config } idx={ idx } key={ idx }
            />
          ))
        }
        {
          refLines.map(([isCol, pos, isSelectOne], i) => (
            <div
              key={ i }
              {
              ...(isCol ?
                {
                  className: "ref-line-col",
                  style: {
                    left: pos + "px",
                    background: isSelectOne ? "red" : "blue"
                  }
                } : {
                  className: "ref-line-row",
                  style: {
                    top: pos + "px",
                    background: isSelectOne ? "red" : "blue"
                  }
                })
              }
            ></div>
          ))
        }
      </div>
    </Form>
  )
}

export default connect(
  (state: BaseState) => {
    return ({
      mainConfig: state.mainConfig,
      canvas: state.canvas
    })
  },
  (dispatch) => ({
    dispatch
  })
)(View)