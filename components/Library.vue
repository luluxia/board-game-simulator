<template>
  <div class="fixed w-150 h-screen bg-white text-dark z-2 right-0 p-5 rounded">
    <div class="font-bold flex justify-between px-2 pb-2">
      <p>仓库</p>
      <p @click="state.libraryVisible = false" class="text-rose-5 cursor-pointer">关闭</p>
    </div>
    <div v-for="lib in data?.lib">
      <p class="font-bold p-2 bg-gray-1 rounded">{{ lib.name }}</p>
      <div
        v-for="item in lib.content"
        @click="addItem(item)"
        class="bg-gray-1 rounded w-max p-2 my-1 cursor-pointer transition-colors hover:bg-gray-2"
      >
        <img
          :style="{ width: `${item.width}px`, height: `${item.height}px` }"
          :src="`/img/cards/${item.id}/cover.svg`" alt=""
        >
        <div class="flex justify-between mt-2">
          <p>{{ item.name }}</p>
          <p>{{ item.size }} 张</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { State } from '~/interface'
const state = useState<State>('state')
const { data: data } = await useFetch<{lib: any}>('lib.json')
const addItem = (item: any) => {
  const pos = [(state.value.board.width - item.width) / 2, (state.value.board.height - item.height) / 2]
  state.value.items.push({
    id: new Date().getTime().toString(),
    type: 'cardArea',
    pos: [pos[0], pos[1]],
    data: {
      name: '',
      type: 'stack',
      areaType: 'public',
      cards: item.cards,
      isFlipped: false,
      rotate: 0,
      placeState: {
        show: false,
        pos: '',
      },
    },
    selected: false,
  })
  state.value.board.transition = true
  state.value.board.pos = [
    -pos[0] + (document.body.clientWidth - item.width) / 2 - 300,
    -pos[1] + (document.body.clientHeight - item.height) / 2,
  ]
}
</script>

<style>

</style>