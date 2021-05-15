import { Modal } from "antd"


const SPACE = 20 /**参考线显示距离 */
const STICK_SPACE = 5 /**吸附距离 */

export enum StickFlags {
  STICK_ROW = /**  */ 1 << 0,
  STICK_COL = /**  */ 1 << 1,
  NO_STICK = /**   */ 0,
}


export const createRefLine = (
  { x: l, w: width, h: height, y: t }: { x: number, w: number, h: number, y: number },
  others: { x: number, y: number, w: number, h: number }[],
  stickTo: StickFlags = StickFlags.NO_STICK
): [[number, number, number][], number, number] => {
  const midX = l + width / 2
  const midY = t + height / 2
  const b = t + height
  const r = l + width
  const lines: [number, number, number][] = []

  others.forEach(({ x, y, w, h }) => {
    /**判断一下长或者宽是否相等 */
    let equalWidth = false
    if (w === width) {
      equalWidth = true
    }
    let equalHeight = false
    if (h === height) {
      equalHeight = true
    }

    /**中线 */
    const mX = w / 2 + x
    const mY = h / 2 + y
    let space: number

    /**水平中线和中线对齐 */
    if ((space = Math.abs(mX - midX)) < SPACE) {
      /**能吸附 */
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_ROW) {
        l = equalWidth ? x : mX - width / 2
      } else {
        lines.push([1, midX, 1])
      }
      lines.push([1, mX, 0])
    }
    /**垂直方向中线和中线对齐 */
    if ((space = Math.abs(mY - midY)) < SPACE) {
      /**能吸附 */
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_COL) {
        t = equalHeight ? y : mY - height / 2
      } else {
        lines.push([0, midY, 1])
      }
      lines.push([0, mY, 0])
    }
    /**当前选择顶部，和其它顶部吸附 */
    if ((space = Math.abs(t - y)) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_COL) {
        t = y
      } else {
        lines.push([0, t, 1])
      }
      lines.push([0, y, 0])
    }
    /**当前选择顶部，和其它底部吸附 */
    if ((space = Math.abs(t - (y + h))) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_COL) {
        t = y + h
      } else {
        lines.push([0, t, 1])
      }
      lines.push([0, y + h, 0])
    }
    /**当前选择底部，和其它顶部吸附 */
    if ((space = Math.abs(b - y)) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_COL) {
        t = y - height
      } else {
        lines.push([0, b, 1])
      }
      lines.push([0, y, 0])
    }
    /**当前选择底部，和其它底部吸附 */
    if ((space = Math.abs(b - (y + h))) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_COL) {
        t = y + h - height
      } else {
        lines.push([0, b, 1])
      }
      lines.push([0, y + h, 0])
    }
    /**当前选择左边，和其它左边吸附 */
    if ((space = Math.abs(l - x)) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_ROW) {
        l = x
      } else {
        lines.push([1, l, 1])
      }
      lines.push([1, x, 0])
    }
    /**当前选择左边，和其它右边吸附 */
    if ((space = Math.abs(l - (x + w))) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_ROW) {
        l = x + w
      } else {
        lines.push([1, l, 1])
      }
      lines.push([1, x + w, 0])
    }
    /**当前选择右边，和其它左边吸附 */
    if ((space = Math.abs(r - x)) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_ROW) {
        l = x - width
      } else {
        lines.push([1, r, 1])
      }
      lines.push([1, x, 0])
    }
    /**当前选择右边，和其它右边吸附 */
    if ((space = Math.abs(r - (x + w))) < SPACE) {
      if (space <= STICK_SPACE && stickTo & StickFlags.STICK_ROW) {
        l = x + w - width
      } else {
        lines.push([1, r, 1])
      }
      lines.push([1, x + w, 0])
    }
  })

  return [lines, l, t]
}


const { confirm } = Modal;

export function withConfirm(message: string, cb: () => void) {
  confirm({
    title: message,
    onOk: cb,
    okText: "确认",
    cancelText: "取消"
  })
}