<template>
  <div class="fixed w-150 h-screen bg-white text-dark z-2 right-0 p-5 rounded">
    <div class="font-bold flex justify-between">
      <p class="p-2">仓库</p>
      <p @click="state.libraryVisible = false" class="p-2 text-rose-5 cursor-pointer">关闭</p>
    </div>
    <div v-for="lib in data?.lib">
      <p class="font-bold p-2 bg-gray-2 rounded">{{ lib.name }}</p>
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
  state.value.items.push({
    id: new Date().getTime().toString(),
    type: 'cardArea',
    pos: [2500, 2500],
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
  console.log(state.value.items)
}
</script>

<style>

</style>