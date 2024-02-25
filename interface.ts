export interface State {
  /** 物件 */
  items: Item[]
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