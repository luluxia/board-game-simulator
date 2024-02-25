<script setup lang="ts">
import interact from 'interactjs'
import { insertCoin, RPC, me } from 'playroomkit'
import type { State } from '~/interface'

const state = useState<State>('state', () => {
  return {
    items: [
      {
        id: '1',
        type: 'cardArea',
        pos: [2500 - 240 / 2, 2500 - 360 / 2],
        selected: false,
        data: {
          name: '牌堆',
          type: 'stack',
          areaType: 'public',
          cards: [
            { id: 'uno_80', name: 'UNO', front: 'uno/card80.svg', back: 'uno/back.svg' },
            { id: 'uno_80', name: 'UNO', front: 'uno/card80.svg', back: 'uno/back.svg' },
            { id: 'uno_80', name: 'UNO', front: 'uno/card80.svg', back: 'uno/back.svg' },
          ],
          isFlipped: false,
          rotate: 0,
          placeState: {
            show: false,
            pos: '',
          },
        }
      }
    ]
  }
})

const board = ref<HTMLElement>()

const getItem = (target: HTMLElement) => {
  return state.value.items.find(item => item.id === target.getAttribute('data-id'))
}

onMounted(async () => {
  await insertCoin()
  if (!board.value) return
  // 居中画布
  board.value.setAttribute('data-x', `${-(2500 - document.body.clientWidth / 2)}`)
  board.value.setAttribute('data-y', `${-(2500 - document.body.clientHeight / 2)}`)
  board.value.setAttribute('data-scale', '1')
  board.value.style.transform = `translate(${-(2500 - document.body.clientWidth / 2)}px, ${-(2500 - document.body.clientHeight / 2)}px)`
  // 监听滚轮滚动，缩放画布
  document.body.addEventListener('wheel', (event) => {
    if (!board.value) return
    // event.preventDefault()
    let scale = parseFloat(board.value.getAttribute('data-scale') || '1')
    let oldScale = scale
    let x = parseFloat(board.value.getAttribute('data-x') || '0')
    let y = parseFloat(board.value.getAttribute('data-y') || '0')
    if (event.deltaY > 0 && scale > 0.25) {
      scale -= 0.25
    } else if (event.deltaY < 0 && scale < 1) {
      scale += 0.25
    } else {
      return
    }

    let rect = board.value.getBoundingClientRect()

    // 获取屏幕中心点到画布左上角的距离
    let oldOriginX = document.body.clientWidth / 2 - rect.left
    let oldOriginY = document.body.clientHeight / 2 - rect.top

    // 画布本身的中心点
    let centerX = rect.width / 2
    let centerY = rect.height / 2

    // 缩放后的中心点到画布左上角的距离
    let newOriginX = centerX + (oldOriginX - centerX) * (scale / oldScale)
    let newOriginY = centerY + (oldOriginY - centerY) * (scale / oldScale)

    // 两者之间的差值
    let dx = newOriginX - oldOriginX
    let dy = newOriginY - oldOriginY

    x -= dx
    y -= dy

    board.value.setAttribute('data-x', `${x}`)
    board.value.setAttribute('data-y', `${y}`)
    board.value.setAttribute('data-scale', `${scale}`)
    board.value.style.transform = `translate(${x}px, ${y}px) scale(${scale})`
  })
  // 初始化画布拖拽
  interact(document.body)
    .draggable({
      listeners: {
        move(event) {
          const target = board.value
          if (!target) return
          const scale = parseFloat(target.getAttribute('data-scale') || '1')
          const x = parseFloat(target.getAttribute('data-x') || '0') + event.dx
          const y = parseFloat(target.getAttribute('data-y') || '0') + event.dy
          target.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale})`
          target.setAttribute('data-x', x.toFixed(2))
          target.setAttribute('data-y', y.toFixed(2))
        },
      }
    })
    .on('tap', (event) => {
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
        move(event) {
          const item = getItem(event.target)
          const scale = parseFloat(board.value?.getAttribute('data-scale') || '1')
          if (!item || !item.selected) {
            const x = parseFloat(board.value?.getAttribute('data-x') || '0') + event.dx
            const y = parseFloat(board.value?.getAttribute('data-y') || '0') + event.dy
            board.value && (board.value.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${scale})`)
            board.value?.setAttribute('data-x', x.toFixed(2))
            board.value?.setAttribute('data-y', y.toFixed(2))
          } else {
            let x = Math.round(item.pos[0] + event.dx * (1 / scale))
            let y = Math.round(item.pos[1] + event.dy * (1 / scale))
            item.pos = [x, y]
          }
        },
        end(event) {
          const item = getItem(event.target)
          if (item) {
            RPC.call('move', { id: item.id, pos: item.pos }, RPC.Mode.OTHERS)
          }
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
        console.log(dragItem, item)
        if (dragItem?.selected && item) {
          item.data.placeState.show = true
        }
        console.log('dropactivate')
      },
      ondropdeactivate: (event) => {
        const item = getItem(event.target)
        if (item) {
          item.data.placeState.show = false
        }
        console.log('dropdeactivate')
      },
      ondrop: (event) => {
        console.log('drop')
        const dragItem = getItem(event.relatedTarget)
        const item = getItem(event.target)
        if (dragItem?.selected && item) {
          item.data.placeState.show = false
          dragItem.data.cards.forEach(card => {
            item.data.cards.push(card)
          })
          state.value.items = state.value.items.filter(item => item.id !== dragItem.id)
        }
      }
    })
    .styleCursor(false)

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
      item.pos = data.pos
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
  <div class="w-screen h-screen overflow-hidden">
    <div ref="board" class="w-[5000px] h-[5000px] rounded-xl pattern-dots-xl bg-dark text-white/5">
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
.fade-enter-active, .fade-leave-active {  
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>