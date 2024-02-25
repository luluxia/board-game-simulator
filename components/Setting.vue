<template>
  <div class="fixed z-1 right-0 m-3 p-2 rounded bg-white text-dark">
    <div class="flex space-x-2">
      <span class="font-bold">视角</span>
      <span
        v-for="view in views"
        @click="changeView(view.id)"
        class="cursor-pointer"
        :class="state.view === view.id && 'text-blue-5 font-bold'"
      >{{ view.name }}</span>
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
  state.value.view = view
  if (
    oldView === 'bottom' && view === 'top' ||
    oldView === 'top' && view === 'bottom' ||
    oldView === 'left' && view === 'right' ||
    oldView === 'right' && view === 'left'
  ) {
    state.value.items.forEach(item => {
      const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
      const itemWidth = rect!.width / state.value.scale
      const itemHeight = rect!.height / state.value.scale
      // 进行中心对称变换
      item.pos[0] = 5000 - item.pos[0] - itemWidth
      item.pos[1] = 5000 - item.pos[1] - itemHeight
    })
  } else if (
    oldView === 'top' && view === 'left' ||
    oldView === 'bottom' && view === 'right' ||
    oldView === 'left' && view === 'bottom' ||
    oldView === 'right' && view === 'top'
  ) {
    state.value.items.forEach(item => {
      const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
      const itemHeight = rect!.height / state.value.scale
      // 进行顺时针旋转90度
      const x = item.pos[0]
      item.pos[0] = 5000 - item.pos[1] - itemHeight
      item.pos[1] = x
    })
  } else if (
    oldView === 'top' && view === 'right' ||
    oldView === 'bottom' && view === 'left' ||
    oldView === 'left' && view === 'top' ||
    oldView === 'right' && view === 'bottom'
  ) {
    state.value.items.forEach(item => {
      const rect = document.querySelector(`[data-id="${item.id}"]`)?.getBoundingClientRect()
      const itemWidth = rect!.width / state.value.scale
      // 进行逆时针旋转90度
      const y = item.pos[1]
      item.pos[1] = 5000 - item.pos[0] - itemWidth
      item.pos[0] = y
    })
  }
}
</script>

<style>

</style>