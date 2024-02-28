<template>
  <div class="fixed z-1 right-0 m-3 text-dark flex space-x-2">
    <div class="flex space-x-2 bg-white p-2 rounded">
      <span class="font-bold">视角</span>
      <span
        v-for="view in views"
        @click="changeView(view.id)"
        class="cursor-pointer"
        :class="state.view === view.id && 'text-blue-5 font-bold'"
      >{{ view.name }}</span>
    </div>
    <div @click="state.libraryVisible = true" class="bg-white p-2 rounded cursor-pointer">
      仓库
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { State } from '~/interface'
const state = useState<State>('state')
const views = [
  { id: 'top', name: '上' },
  { id: 'bottom', name: '下' },
  { id: 'left', name: '左' },
  { id: 'right', name: '右' },
]
const changeView = (view: any) => {
  const oldView = state.value.view
  const board = document.querySelector('.board') as HTMLElement
  setTimeout(() => {
    state.value.view = view
  }, 150)
  if (
    oldView === 'bottom' && view === 'top' ||
    oldView === 'top' && view === 'bottom' ||
    oldView === 'left' && view === 'right' ||
    oldView === 'right' && view === 'left'
  ) {
    state.value.boardTransition = true
    board.style.transform += 'rotate(180deg)'
    setTimeout(() => {
      state.value.boardTransition = false
      board.style.transform = board.style.transform.replace('rotate(180deg)', '')
      state.value.items.forEach(item => {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemWidth = rect!.width / state.value.scale
        const itemHeight = rect!.height / state.value.scale
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
    state.value.boardTransition = true
    board.style.transform += 'rotate(90deg)'
    setTimeout(() => {
      state.value.boardTransition = false
      board.style.transform = board.style.transform.replace('rotate(90deg)', '')
      state.value.items.forEach(item => {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemHeight = rect!.height / state.value.scale
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
    state.value.boardTransition = true
    board.style.transform += 'rotate(-90deg)'
    setTimeout(() => {
      state.value.boardTransition = false
      board.style.transform = board.style.transform.replace('rotate(-90deg)', '')
      state.value.items.forEach(item => {
        const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
        const itemWidth = rect!.width / state.value.scale
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