<template>
  <div v-if="player?.size" class="fixed w-full h-full z-1 pointer-events-none">
    <!-- 底部 -->
    <div
      v-for="(group, index) in playerGroup"
      class="absolute flex justify-center space-x-5"
      :class="[
        index === 'left' && 'left-5 h-full',
        index === 'right' && 'right-5 h-full',
        index === 'top' && 'w-full top-5',
        index === 'bottom' && 'w-full bottom-48'
      ]"
    >
      <div v-for="item in group" class="flex flex-col justify-center items-center font-bold">
        <div
          class="relative w-12 h-12 bg-white border-white border-2 rounded-full"
          :style="{
            borderColor: item.color
          }"
        >
          <img :src="item.avatar" alt="">
          <span class="absolute bg-blue-5 text-white px-1 rounded -right-2 -top-2">7</span>
        </div>
        <p class="text-white mt-2">{{ item.nick }}</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { State, Player } from '~/interface'
const state = useState<State>('state')
const player = inject<Ref<Map<String, Player>>>('players')
const playerGroup = computed(() => {
  const group: {
    left: Player[],
    right: Player[],
    top: Player[],
    bottom: Player[],
  } = {
    'left': [],
    'right': [],
    'top': [],
    'bottom': [],
  }
  if (player?.value) {
    Array.from(player?.value.values()).forEach((item, index) => {
      let targetView: 'left' | 'right' | 'top' | 'bottom' = 'bottom'
      if (state.value.board.view === 'top') {
        if (item.view === 'top') {
          targetView = 'bottom'
        } else if (item.view === 'bottom') {
          targetView = 'top'
        } else if (item.view === 'left') {
          targetView = 'right'
        } else if (item.view === 'right') {
          targetView = 'left'
        }
      } else if (state.value.board.view === 'bottom') {
        if (item.view === 'top') {
          targetView = 'top'
        } else if (item.view === 'bottom') {
          targetView = 'bottom'
        } else if (item.view === 'left') {
          targetView = 'left'
        } else if (item.view === 'right') {
          targetView = 'right'
        }
      } else if (state.value.board.view === 'left') {
        if (item.view === 'top') {
          targetView = 'left'
        } else if (item.view === 'bottom') {
          targetView = 'right'
        } else if (item.view === 'left') {
          targetView = 'bottom'
        } else if (item.view === 'right') {
          targetView = 'top'
        }
      } else if (state.value.board.view === 'right') {
        if (item.view === 'top') {
          targetView = 'right'
        } else if (item.view === 'bottom') {
          targetView = 'left'
        } else if (item.view === 'left') {
          targetView = 'top'
        } else if (item.view === 'right') {
          targetView = 'bottom'
        }
      }
      group[targetView].push(item)
    })
  }
  return group
})
</script>

<style>

</style>