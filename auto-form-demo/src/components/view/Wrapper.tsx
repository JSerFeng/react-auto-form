import {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
  Dispatch as SetState
} from "react";
import { fromEvent, Subject } from "rxjs";
import { connect } from 'react-redux'
import { Dispatch } from "redux"
import { filter, map, switchMap, takeUntil, tap } from "rxjs/operators";
import { getFormItem } from "../../render";
import { ConfigItem } from "../../render/interfaces"
import { Actions, BaseState } from "../../store/reducer";
import produce from "immer";
import { createRefLine, StickFlags } from "../../utils";

const { actConfigItem, actSelect } = Actions

/**处理移动和缩放功能 */
const Wrapper: FC<{
  config: ConfigItem,
  allConfigs: ConfigItem[],
  container: RefObject<HTMLElement>,
  selectedId: number,
  dispatch: Dispatch,
  idx: number,
  setRefLines: SetState<[number, number, number][]>
}> = ({ config, allConfigs, container, dispatch, idx, setRefLines, selectedId }) => {
  const [layout, setLayout] = useState(config.layout)
  console.log("render");

  const setPos = useCallback(({ x, y }: { x: number, y: number }) => {
    setLayout(lay => ({ ...lay, x, y }))
  }, [])
  const thisDiv = useRef<HTMLDivElement>(null)

  const setReferenceLine = useCallback((
    pos: {
      x: number,
      y: number,
      w: number,
      h: number
    },
    stickTo: StickFlags = StickFlags.NO_STICK
  ): [number, number] => {
    /**
     * 坐标轴数据结构, 第三个参数0：其它元素参考线 | 1：当前选择的参考线
     * [0, 45, 0] --- 平行于x轴, 坐标 0 45， 宽度100%
     * [1, 45, 0] --- 平行于y轴, 坐标 45 0， 高度100%
     */
    const otherPositions = allConfigs
      .filter((_, i) => (i !== idx)) //排除掉当前选中的
      .map((config) => {
        const { x, y, w, h } = config.layout
        return ({ x, y, w, h })
      })

    otherPositions.push({
      x: 0,
      y: 0,
      w: container.current!.offsetWidth,
      h: container.current!.offsetHeight
    })

    const [lines, left, top] = createRefLine(pos, otherPositions, stickTo)
    setRefLines(lines)
    return [left, top]
  }, [allConfigs, container, idx, setRefLines])

  useEffect(() => {
    const ele = thisDiv.current!
    const containerOffsetTop = (container.current!.offsetParent as HTMLElement).offsetTop + container.current!.offsetTop
    const containerOffsetLeft = (container.current!.offsetParent as HTMLElement).offsetLeft + container.current!.offsetLeft

    let currLayout: { x: number, y: number, w: number, h: number } = { ...config.layout }
    /**
     * TIP: 这里我为什么要用一个局部临时变量保存坐标信息？
     * 因为如果直接访问layout的话，根据react的eslint标准会将layout作为
     * useEffect的依赖项，在每一次移动的时候layout会改变，然后该useEffect
     * 会重新执行，导致触发useEffect的清理函数，导致移动操作失败。但是如果
     * 我用临时变量最开始就保存好坐标信息，然后在移动过程中setLayout采用函
     * 数形式的更新，这样layout就不会作为useEffect的依赖，就不会在移动过程
     * 重新执行useEffect导致滑动失败
     */

    /** */
    const mouseDown$ = fromEvent(ele, "mousedown").pipe(
      tap(e => {
        e.stopPropagation()
        dispatch(actSelect(idx))
      })
    )
    const mouseMove$ = fromEvent(document, "mousemove")

    /**每次鼠标移动之后改变mainConfig中的layout */
    const mouseUp$ = fromEvent(document, "mouseup")
    const mouseUp2PosChange$ = mouseUp$.pipe(
      tap(() => {
        dispatchPosChange(currLayout)
      })
    )

    const subClearRefLines = mouseUp$.subscribe(() => {
      setRefLines([])
    })

    const subMove = mouseDown$.pipe(
      map((e) => ({
        offsetLeft: (e as MouseEvent).pageX - containerOffsetLeft - ele.offsetLeft,
        offsetTop: (e as MouseEvent).pageY - containerOffsetTop - ele.offsetTop
      })),
      switchMap(({ offsetLeft, offsetTop }) => mouseMove$.pipe(
        map(e => ({
          x: (e as MouseEvent).pageX - containerOffsetLeft - offsetLeft || 0,
          y: (e as MouseEvent).pageY - containerOffsetTop - offsetTop || 0,
        })),
        map((res) => {
          const [x, y] = setReferenceLine({
            x: res.x,
            y: res.y,
            w: currLayout.w,
            h: currLayout.h
          }, StickFlags.STICK_COL | StickFlags.STICK_ROW)
          return { x, y }
        }),
        tap(({ x, y }) => {
          currLayout.x = x
          currLayout.y = y
        }),
        takeUntil(mouseUp2PosChange$),
      )),
    ).subscribe(setPos)

    /**控制放大缩小的几个小圆点div, L:left T:Top R:right B:bottom */
    const dotLT = dLT.current!
    const dotLB = dLB.current!
    const dotRT = dRT.current!
    const dotRB = dRB.current!
    const dotLM = dLM.current!
    const dotRM = dRM.current!
    const dotMT = dMT.current!
    const dotMB = dMB.current!

    const resizeMouseDown$ = new Subject<
      "lt" | "mt" | "rt" |
      "lm" | /****/ "rm" |
      "lb" | "rb" | "mb">()

    const subResize = resizeMouseDown$.pipe(
      map((dir:
        "lt" | "mt" | "rt" |
        "lm" | /****/ "rm" |
        "lb" | "rb" | "mb"
      ) => ({
        dir,
        _layout: config.layout
      })),
      switchMap(({ dir, _layout }) => mouseMove$.pipe(
        map((e) => {
          let newX = (e as MouseEvent).pageX - containerOffsetLeft
          let newY = (e as MouseEvent).pageY - containerOffsetTop

          let newHeight = config.layout.h
          let newWidth = config.layout.w

          switch (dir) {
            case "lt": {
              /**当前是点击左上角，应该找右下角坐标 */
              const rbX = config.layout.x + config.layout.w
              const rbY = config.layout.y + config.layout.h

              newWidth = rbX - newX
              newHeight = rbY - newY
              break
            }
            case "lb": {
              /**当前是点击左下角，应该找右上角坐标 */
              const rtX = config.layout.x + config.layout.w
              const rtY = config.layout.y

              newWidth = rtX - newX
              newHeight = newY - rtY

              newY = newY - newHeight
              break
            }
            case "rb": {
              /**当前点击右下角，找左上角坐标 */
              const ltX = config.layout.x
              const ltY = config.layout.y

              newWidth = newX - ltX
              newHeight = newY - ltY

              newX = newX - newWidth
              newY = newY - newHeight
              break
            }
            case "rt": {
              /**当前点击右上角，找左下角坐标 */
              const lbX = config.layout.x
              const lbY = config.layout.y + config.layout.h

              newWidth = newX - lbX
              newHeight = lbY - newY

              newX = newX - newWidth
              break
            }
            case "lm": {
              /**点击左侧中间小圆点，可以左右移动 */
              newWidth = config.layout.x + config.layout.w - newX

              newY = config.layout.y
              break
            }
            case "rm": {
              /**点击右侧中间小圆点，可以左右移动 */
              newWidth = newX - config.layout.x

              newX = config.layout.x
              newY = config.layout.y
              break
            }
            case "mt": {
              /**点击中间上方圆点 */
              newHeight = config.layout.h + config.layout.y - newY

              newX = config.layout.x
              break
            }
            case "mb": {
              /**点击中间下方圆点 */
              newHeight = newY - config.layout.y

              newX = config.layout.x
              newY = config.layout.y
              break
            }
            default: return _layout
          }

          /**
          * Tips:
          * 此时newX,newY,newWidth,newHeight是下一次页面上应该
          * 渲染的坐标信息，算一下参考线和吸附。复杂原因在于，吸
          * 附后，x和y坐标吸附上去了，但是宽和高都没有变，这样不
          * 符合常理，例如：
          * 点击右上角，右上角吸附到了边界这个时候你会发现左下角
          * 对应也移动了一小段吸附的距离，但是我点击右上角进行缩
          * 放，左下角应该是钉死的。因此根据不同情况来“钉死”某些
          * 坐标，因此记录下当前四个坐标
          **/

          const posLT = [newX, newY]
          const posRT = [newX + newWidth, newY]
          const posLB = [newX, newY + newHeight]
          const posRB = [newX + newWidth, newY + newHeight]

          const [stickX, stickY] = setReferenceLine({
            x: newX,
            y: newY,
            w: newWidth,
            h: newHeight,
          },
            dir === "lm" || dir === "rm"
              ? StickFlags.STICK_ROW
              : dir === "mt" || dir === "mb"
                ? StickFlags.STICK_COL
                : StickFlags.STICK_ROW | StickFlags.STICK_COL
          )

          /**吸附后四个坐标值 */
          const stickedLT = [stickX, stickY]
          const stickedRT = [stickX + newWidth, stickY]
          const stickedLB = [stickX, stickY + newHeight]
          const stickedRB = [stickX + newWidth, stickY + newHeight]

          switch (dir) {
            case "lt":
              newWidth = posRB[0] - stickedLT[0]
              newHeight = posRB[1] - stickedLT[1]
              newX = stickX
              newY = stickY
              break
            case "mt":
              newHeight = posLB[1] - stickedLT[1]
              newY = stickY
              break
            case "rt":
              newWidth = stickedRB[0] - posLT[0]
              newHeight = stickedRB[1] - posLT[1]
              break
            case "lm":
              newWidth = posRT[0] - stickedLT[0]
              newX = stickX
              break
            case "rm":
              newWidth = stickedRT[0] - posLT[0]
              break
            case "lb":
              newWidth = posRB[0] - stickedLT[0]
              newHeight = stickedLB[1] - posLT[1]
              newX = stickX
              break
            case "mb":
              newHeight = stickedLB[1] - posLT[1]
              break
            case "rb":
              newWidth = stickedRB[0] - posLT[0]
              newHeight = stickedRB[1] - posLT[1]
              break
          }
          return {
            x: newX,
            y: newY,
            w: newWidth,
            h: newHeight
          }
        }),
        filter(l => l.h >= 10 && l.w >= 10), /**要求高度大于10，宽度大于10 */
        tap(l => currLayout = l), /**将当前坐标信息存在一个临时变量用于下面提交更新 */
        takeUntil(mouseUp2PosChange$)
      ))
    ).subscribe(({ x, y, w, h }) => {
      setLayout(l => ({
        ...l, x, y, w, h,
      }))
    })

    const dispatchPosChange = (pos: {
      x?: number, y?: number, w?: number, h?: number
    }) => {
      dispatch(actConfigItem(produce(config, it => {
        Reflect.ownKeys(pos).forEach(k => {
          /**@ts-ignore */
          it.layout[k] = pos[k]
        })
      })))
    }

    const resizeLT = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("lt")
    }
    const resizeRT = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("rt")
    }
    const resizeLB = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("lb")
    }
    const resizeRB = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("rb")
    }
    const resizeLM = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("lm")
    }
    const resizeRM = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("rm")
    }
    const resizeMT = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("mt")
    }
    const resizeMB = (e: Event) => {
      e.stopPropagation()
      resizeMouseDown$.next("mb")
    }

    dotLT.addEventListener("mousedown", resizeLT)
    dotRT.addEventListener("mousedown", resizeRT)
    dotLB.addEventListener("mousedown", resizeLB)
    dotRB.addEventListener("mousedown", resizeRB)
    dotLM.addEventListener("mousedown", resizeLM)
    dotRM.addEventListener("mousedown", resizeRM)
    dotMT.addEventListener("mousedown", resizeMT)
    dotMB.addEventListener("mousedown", resizeMB)

    return () => {
      subMove.unsubscribe()
      subClearRefLines.unsubscribe()
      subResize.unsubscribe()
      dotLT.removeEventListener("mousedown", resizeLT)
      dotRT.removeEventListener("mousedown", resizeRT)
      dotLB.removeEventListener("mousedown", resizeLB)
      dotRB.removeEventListener("mousedown", resizeRB)
      dotLM.removeEventListener("mousedown", resizeLM)
      dotRM.removeEventListener("mousedown", resizeRM)
      dotMT.removeEventListener("mousedown", resizeMT)
      dotMB.removeEventListener("mousedown", resizeMB)
    }
  }, [config, container, dispatch, idx, setPos, setRefLines, setReferenceLine])

  /**LT代表left top，左上角的div，其它同理 */
  const dLT = useRef<HTMLDivElement>(null)
  const dMT = useRef<HTMLDivElement>(null)
  const dRT = useRef<HTMLDivElement>(null)
  const dLM = useRef<HTMLDivElement>(null)
  const dRM = useRef<HTMLDivElement>(null)
  const dLB = useRef<HTMLDivElement>(null)
  const dMB = useRef<HTMLDivElement>(null)
  const dRB = useRef<HTMLDivElement>(null)

  /**监听config改变并且重新赋值给layout */
  useEffect(() => {
    setLayout(config.layout)
  }, [config])

  return (
    <div
      className={ `absolute wrap-widget ${idx === selectedId ? "select" : ""}` }
      ref={ thisDiv }
      style={ {
        left: layout.x + "px",
        top: layout.y + "px",
        width: layout.w + "px",
        height: layout.h + "px",
        zIndex: config.layout.zIndex,
      } }
      title={ `x:${layout.x} y:${layout.y} w:${layout.w} h:${layout.h}` }
    >
      {
        /**让组件的宽高用layout的 */
        getFormItem(produce(config, it => {
          it.layout.w = layout.w
          it.layout.h = layout.h
          it.layout.x = layout.x
          it.layout.y = layout.y
        }))
      }
      <div className="move-dot lt" ref={ dLT }></div>
      <div className="move-dot mt" ref={ dMT }></div>
      <div className="move-dot rt" ref={ dRT }></div>
      <div className="move-dot lm" ref={ dLM }></div>
      <div className="move-dot rm" ref={ dRM }></div>
      <div className="move-dot lb" ref={ dLB }></div>
      <div className="move-dot mb" ref={ dMB }></div>
      <div className="move-dot rb" ref={ dRB }></div>
    </div>
  )
}

export default connect(
  (state: BaseState) => ({
    allConfigs: state.mainConfig.components,
    selectedId: state.selectedIndex
  }),
  dispatch => ({ dispatch })
)(Wrapper)
