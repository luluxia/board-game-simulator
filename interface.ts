export interface State {
  /** 物件 */
  items: Item[]
  /** 桌布 */
  board: {
    width: number
    height: number
    /** 视角 */
    view: 'top' | 'bottom' | 'left' | 'right'
    /** 位置 */
    pos: [number, number]
    /** 缩放比例 */
    scale: number
    /** 旋转 */
    rotate: number
    /** 激活桌布过渡 */
    transition: boolean
  }
  /** 仓库 */
  libraryVisible: boolean
}

export interface Player {
  /** 昵称 */
  nick: string
  /** 头像 */
  avatar: string
  /** 颜色 */
  color: string
  /** playroom 状态 */
  state: any
  /** 视角 */
  view: 'top' | 'bottom' | 'left' | 'right'
}

export interface Item {
  /** 物件ID */
  id: string
  /** 物件类型 */
  type: 'cardArea'
  /** 物件位置 */
  pos: [number, number]
  /** 物件数据 */
  data: CardArea
  /** 是否选中 */
  selected: boolean
  /** 控制者 */
  controller?: any
}

export interface CardArea {
  /** 区域名 */
  name: string
  /** 放置类型 */
  type: 'stack' | 'tile'
  /** 区域类型 */
  areaType: 'public' | 'hand'
  /** 卡牌堆 */
  cards: Card[]
  /** 是否翻面 */
  isFlipped: boolean
  /** 旋转角度 */
  rotate: number
  /** 放置状态 */
  placeState: {
    /** 是否显示放置 */
    show: boolean
    /** 放置位置 */
    pos: 'front' | 'back' | ''
  }
}

export interface Card {
  /** 卡牌ID */
  id: string
  /** 卡牌名称 */
  name: string
  /** 卡面 */
  front: string
  /** 卡背 */
  back: string
}