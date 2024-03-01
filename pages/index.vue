<script setup lang="ts">
import interact from 'interactjs'
import { insertCoin, RPC, me, isHost, onPlayerJoin } from 'playroomkit'
import type { State, Player } from '~/interface'
import { throttle } from '~/utils'

const state = useState<State>('state', () => {
  return {
    items: [
      // {
      //   id: '0',
      //   type: 'cardArea',
      //   pos: [2500 - 240 / 2, 2500 - 360 / 2],
      //   selected: false,
      //   data: {
      //     name: '牌堆',
      //     type: 'stack',
      //     areaType: 'public',
      //     cards: [
      //       { id: 'uno_80', name: 'UNO', front: 'uno/card80.svg', back: 'uno/back.svg' },
      //       { id: 'uno_80', name: 'UNO', front: 'uno/card80.svg', back: 'uno/back.svg' },
      //       { id: 'uno_80', name: 'UNO', front: 'uno/card80.svg', back: 'uno/back.svg' },
      //     ],
      //     isFlipped: false,
      //     rotate: 0,
      //     placeState: {
      //       show: false,
      //       pos: '',
      //     },
      //   }
      // }
    ],
    board: {
      width: 5000,
      height: 5000,
      view: 'bottom',
      pos: [0, 0],
      scale: 1,
      rotate: 0,
      transition: false,
    },
    hand: [],
    libraryVisible: false,
  }
})

const players = ref<Map<String, Player>>(new Map())
provide('players', players)

const board = ref<HTMLElement>()

const getItem = (target: HTMLElement) => {
  return state.value.items.find(item => item.id === target.getAttribute('data-id'))
}

onMounted(async () => {
  await insertCoin()
  // 居中画布
  state.value.board.pos = [-(2500 - document.body.clientWidth / 2), -(2500 - document.body.clientHeight / 2)]
  // 监听滚轮滚动，缩放画布
  document.body.addEventListener('wheel', (event) => {
    state.value.board.transition = true

    let oldScale = state.value.board.scale
    let x = state.value.board.pos[0]
    let y = state.value.board.pos[1]

    if (event.deltaY > 0 && oldScale > 0.25) {
      state.value.board.scale -= 0.25
    } else if (event.deltaY < 0 && oldScale < 1) {
      state.value.board.scale += 0.25
    } else {
      return
    }

    let originalWidth = 5000
    let originalHeight = 5000

    let newWidth = originalWidth * oldScale
    let newHeight = originalHeight * oldScale

    let newX = x + (originalWidth - newWidth) / 2
    let newY = y + (originalHeight - newHeight) / 2

    let rect = {
      top: newY,
      left: newX,
      width: newWidth,
      height: newHeight,
      right: newX + newWidth,
      bottom: newY + newHeight
    }

    // 获取屏幕中心点到画布左上角的距离
    let oldOriginX = document.body.clientWidth / 2 - rect.left
    let oldOriginY = document.body.clientHeight / 2 - rect.top

    // 画布本身的中心点
    let centerX = rect.width / 2
    let centerY = rect.height / 2

    // 缩放后的中心点到画布左上角的距离
    let newOriginX = centerX + (oldOriginX - centerX) * (state.value.board.scale / oldScale)
    let newOriginY = centerY + (oldOriginY - centerY) * (state.value.board.scale / oldScale)

    // 两者之间的差值
    let dx = newOriginX - oldOriginX
    let dy = newOriginY - oldOriginY

    x -= dx
    y -= dy

    state.value.board.pos = [x, y]
  })
  // 初始化画布拖拽
  interact(document.body)
    .draggable({
      listeners: {
        start() {
          state.value.board.transition = false
        },
        move(event) {
          const x = +(state.value.board.pos[0] + event.dx).toFixed(2)
          const y = +(state.value.board.pos[1] + event.dy).toFixed(2)
          state.value.board.pos = [x, y]
        },
        end() {
          state.value.board.transition = true
        }
      }
    })
    .on('tap', (event) => {
      // 取消选中
      if (board.value === event.target) {
        state.value.items.forEach(item => item.selected = false)
        RPC.call('noSelect', { player: me().getProfile().name }, RPC.Mode.OTHERS)
      }
    })
    .styleCursor(false)
  // 初始化物件拖拽
  interact('.item')
    .on('tap', (event) => {
      const item = getItem(event.currentTarget)
      if (item) {
        state.value.items.forEach(item => item.selected = false)
        item.selected = true
        RPC.call('select', { id: item.id, player: me().getProfile() }, RPC.Mode.OTHERS)
      }
    })
    .draggable({
      listeners: {
        start() {
          state.value.board.transition = false
        },
        move(event) {
          const item = getItem(event.target)
          if (!item || !item.selected) {
            const x = +(state.value.board.pos[0] + event.dx).toFixed(2)
            const y = +(state.value.board.pos[1] + event.dy).toFixed(2)
            state.value.board.pos = [x, y]
          } else {
            let x = Math.round(item.pos[0] + event.dx * (1 / state.value.board.scale))
            let y = Math.round(item.pos[1] + event.dy * (1 / state.value.board.scale))
            item.pos = [x, y]
          }
        },
        end(event) {
          const item = getItem(event.target)
          if (item) {
            RPC.call('move', { id: item.id, pos: item.pos, view: state.value.board.view }, RPC.Mode.OTHERS)
          }
          state.value.board.transition = true
        }
      },
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: board.value,
        })
      ]
    })
    .dropzone({
      accept: '.item',
      ondropactivate: (event) => {
        const dragItem = getItem(event.relatedTarget)
        const item = getItem(event.target)
        if (dragItem?.selected && item) {
          item.data.placeState.show = true
        }
      },
      ondropdeactivate: (event) => {
        const item = getItem(event.target)
        if (item) {
          item.data.placeState.show = false
        }
      },
      ondrop: (event) => {
        const dragItem = getItem(event.relatedTarget)
        const item = getItem(event.target)
        if (dragItem?.selected && item) {
          item.data.placeState.show = false
          if (item.data.placeState.pos === 'front') {
            item.data.cards.unshift(...dragItem.data.cards)
          } else {
            item.data.cards.push(...dragItem.data.cards)
          }
          state.value.items = state.value.items.filter(item => item.id !== dragItem.id)
        }
      }
    })
    .styleCursor(false)

  onPlayerJoin((player) => {
    players.value.set(player.id, {
      nick: player.getProfile().name,
      avatar: player.getProfile().photo,
      color: player.getProfile()?.color?.hexString,
      state: player,
      view: 'bottom',
    })
    player.onQuit(() => {
      players.value.delete(player.id)
    })
  })
  RPC.call('setColor', {
    id: me().id,
    color: me().getProfile().color.hexString
  })
  RPC.register('setColor', data => new Promise(resolve => {
    console.log(data)
    const player = players.value.get(data.id)
    if (player) {
      player.color = data.color
    }
    resolve('ok')
  }))
  RPC.register('changeView', data => new Promise(resolve => {
    const player = players.value.get(data.id)
    if (player) {
      player.view = data.view
    }
    resolve('ok')
  }))
  RPC.register('select', data => {
    const item = state.value.items.find(item => item.id === data.id)
    if (item) {
      item.controller = data.player
      console.log(item)
    }
    return 'ok' as any
  })
  RPC.register('noSelect', data => {
    state.value.items.forEach(item => item.controller.name === data.player && (item.controller = undefined))
    return 'ok' as any
  })
  RPC.register('move', (data) => {
    console.log(data)
    const item = state.value.items.find(item => item.id === data.id)
    if (item) {
      const oldView = data.view
      const newView = state.value.board.view
      if (
        oldView === 'bottom' && newView === 'top' ||
        oldView === 'top' && newView === 'bottom' ||
        oldView === 'left' && newView === 'right' ||
        oldView === 'right' && newView === 'left'
      ) {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemWidth = rect!.width / state.value.board.scale
        const itemHeight = rect!.height / state.value.board.scale
        // 进行中心对称变换
        item.pos[0] = 5000 - data.pos[0] - itemWidth
        item.pos[1] = 5000 - data.pos[1] - itemHeight
      } else if (
        oldView === 'top' && newView === 'left' ||
        oldView === 'bottom' && newView === 'right' ||
        oldView === 'left' && newView === 'bottom' ||
        oldView === 'right' && newView === 'top'
      ) {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemWidth = rect!.width / state.value.board.scale
        // 进行顺时针旋转90度
        const x = data.pos[0]
        item.pos[0] = 5000 - data.pos[1] - itemWidth
        item.pos[1] = x
      } else if (
        oldView === 'top' && newView === 'right' ||
        oldView === 'bottom' && newView === 'left' ||
        oldView === 'left' && newView === 'top' ||
        oldView === 'right' && newView === 'bottom'
      ) {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemHeight = rect!.height / state.value.board.scale
        // 进行逆时针旋转90度
        const y = data.pos[1]
        item.pos[1] = 5000 - data.pos[0] - itemHeight
        item.pos[0] = y
      } else {
        item.pos = data.pos
      }
    }
    return 'ok' as any
  })
  RPC.register('flip', data => {
    console.log(data)
    const item = state.value.items.find(item => item.id === data.id)
    if (item) {
      item.data.isFlipped = data.isFlipped
    }
    return 'ok' as any
  })
})
</script>

<template>
  <Transition name="slide-in-right">
    <Library v-if="state.libraryVisible" />
  </Transition>
  <Setting />
  <PlayerOverlay />
  <HandArea />
  <div class="w-screen h-screen overflow-hidden">
    <div
      ref="board"
      class="board rounded-xl pattern-dots-xl bg-dark text-white/5"
      :class="state.board.transition && 'transition-transform duration-150'"
      :style="{
        width: `${state.board.width}px`,
        height: `${state.board.height}px`,
        transform: `
          translate(${state.board.pos[0]}px, ${state.board.pos[1]}px) 
          scale(${state.board.scale}) 
          rotate(${state.board.rotate}deg)`,
      }"
    >
      <div
        v-for="item in state.items"
        class="item absolute w-max h-max rounded transition-duration-150 ring-transparent ring-2 group hover:(ring-white/50 bg-dark/80)"
        :class="
          item.selected && '!ring-white/100 bg-dark/80',
          item.data.placeState.show && 'z-9999',
          item.controller && 'cursor-not-allowed pointer-events-none transition-transform'
        "
        :style="[
          {
            transform: `translate(${item.pos[0]}px, ${item.pos[1]}px)`,
            transitionProperty: `background-color, box-shadow ${item.controller ? ', transform' : ''}`,
          },
          item.controller && `--un-ring-color: ${item.controller.color.hexString}`
        ]"
        :data-x="item.pos[0]" :data-y="item.pos[1]" :data-id="item.id"
      >
        <CardArea :item="item" />
      </div>
    </div>
  </div>
</template>

<style>
body {
  overflow: hidden;
}
.fade-enter-active, .fade-leave-active {  
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
.slide-in-right-enter-active, .slide-in-right-leave-active {
  transition: transform 0.3s;
}
.slide-in-right-enter-from, .slide-in-right-leave-to {
  transform: translateX(100%);
}
</style>