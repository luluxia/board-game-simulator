<template>
  <div class="fixed z-1 right-0 m-3 text-dark flex space-x-2">
    <div class="flex space-x-2 bg-white p-2 rounded">
      <span class="font-bold">视角</span>
      <span
        v-for="view in views"
        @click="changeView(view.id)"
        class="cursor-pointer"
        :class="state.board.view === view.id && 'text-blue-5 font-bold'"
      >{{ view.name }}</span>
    </div>
    <div @click="state.libraryVisible = true" class="bg-white p-2 rounded cursor-pointer">
      仓库
    </div>
  </div>
</template>

<script lang="ts" setup>
import { RPC, me } from 'playroomkit'
import type { State, Player } from '~/interface'
const state = useState<State>('state')
const player = inject<Ref<Map<String, Player>>>('players')
const views = [
  { id: 'top', name: '上' },
  { id: 'bottom', name: '下' },
  { id: 'left', name: '左' },
  { id: 'right', name: '右' },
]
const changeView = (view: any) => {
  state.value.items.forEach(item => {
    item.selected = false
  })
  const oldView = state.value.board.view
  setTimeout(() => {
    state.value.board.view = view
    RPC.call('changeView', { id: me().id, view }, RPC.Mode.OTHERS)
    const targetPlayer = player?.value.get(me().id)
    if (targetPlayer) {
      targetPlayer.view = view
    }
  }, 150)
  if (
    oldView === 'bottom' && view === 'top' ||
    oldView === 'top' && view === 'bottom' ||
    oldView === 'left' && view === 'right' ||
    oldView === 'right' && view === 'left'
  ) {
    state.value.board.transition = true
    state.value.board.rotate = 180
    setTimeout(() => {
      state.value.board.transition = false
      state.value.board.rotate = 0
      state.value.items.forEach(item => {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemWidth = rect!.width / state.value.board.scale
        const itemHeight = rect!.height / state.value.board.scale
        // 进行中心对称变换
        item.pos[0] = 5000 - item.pos[0] - itemWidth
        item.pos[1] = 5000 - item.pos[1] - itemHeight
      })
    }, 150)
  } else if (
    oldView === 'top' && view === 'left' ||
    oldView === 'bottom' && view === 'right' ||
    oldView === 'left' && view === 'bottom' ||
    oldView === 'right' && view === 'top'
  ) {
    state.value.board.transition = true
    state.value.board.rotate = 90
    setTimeout(() => {
      state.value.board.transition = false
      state.value.board.rotate = 0
      state.value.items.forEach(item => {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemHeight = rect!.height / state.value.board.scale
        // 进行顺时针旋转90度
        const x = item.pos[0]
        item.pos[0] = 5000 - item.pos[1] - itemHeight
        item.pos[1] = x
      })
    }, 150)
  } else if (
    oldView === 'top' && view === 'right' ||
    oldView === 'bottom' && view === 'left' ||
    oldView === 'left' && view === 'top' ||
    oldView === 'right' && view === 'bottom'
  ) {
    state.value.board.transition = true
    state.value.board.rotate = -90
    setTimeout(() => {
      state.value.board.transition = false
      state.value.board.rotate = 0
      state.value.items.forEach(item => {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemWidth = rect!.width / state.value.board.scale
        // 进行逆时针旋转90度
        const y = item.pos[1]
        item.pos[1] = 5000 - item.pos[0] - itemWidth
        item.pos[0] = y
      })
    }, 150)
  }
}
</script>

<style>

</style>