<template>
  <div v-if="player?.size" class="fixed w-full h-full z-1 pointer-events-none">
    <div class="absolute w-full bottom-5 flex justify-center space-x-5">
      <div v-for="item in player.values()" class="flex flex-col justify-center items-center font-bold">
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
import type { Player } from '~/interface'
const player = inject<Map<String, Player>>('players')
</script>

<style>

</style>