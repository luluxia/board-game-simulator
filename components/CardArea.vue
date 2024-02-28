<script setup lang="ts">
import { RPC } from 'playroomkit'
import type { State, Item } from '~/interface'
const state = useState<State>('state')
defineProps({
  item: {
    type: Object as PropType<Item>,
    required: true
  }
})
const takeState = reactive({
  visible: false,
  position: 'front',
  target: 'hand',
  num: 1
})
const calcRotate = (deg: number) => {
  let viewRotate = 0
  switch (state.value.board.view) {
    case 'right':
      viewRotate = 90
      break
    case 'top':
      viewRotate = 180
      break
    case 'left':
      viewRotate = 270
      break
  }
  return (deg + viewRotate) % 360
}
const take = () => {
  const selectedItem = state.value.items.find(item => item.selected)
  if (selectedItem) {
    const newCards = takeState.position === 'front'
      ? selectedItem.data.cards.splice(0, takeState.num)
      : selectedItem.data.cards.splice(-takeState.num)
    const newItem: Item = {
      id: String(Date.now()),
      type: 'cardArea',
      pos: [selectedItem.pos[0] + 50, selectedItem.pos[1] + 50],
      data: {
        ...JSON.parse(JSON.stringify(selectedItem.data)),
        name: '',
        cards: newCards,
      },
      selected: false
    }
    state.value.items.push(newItem)
    takeState.visible = false
  }
}
const flip = () => {
  const selectedItem = state.value.items.find(item => item.selected)
  if (selectedItem) {
    selectedItem.data.isFlipped = !selectedItem.data.isFlipped
    RPC.call('flip', { id: selectedItem.id, isFlipped: selectedItem.data.isFlipped }, RPC.Mode.OTHERS)
  }
}
const rotate = () => {
  const selectedItem = state.value.items.find(item => item.selected)
  if (selectedItem) {
    if (selectedItem.data.rotate === 270) {
      selectedItem.data.rotate = 0
    } else {
      selectedItem.data.rotate += 90
    }
  }
}
const shuffleDom = ref<HTMLElement>()
const shuffle = () => {
  if (shuffleDom.value) {
    shuffleDom.value.style.animation = 'shuffle 0.3s'
    setTimeout(() => {
      shuffleDom.value && (shuffleDom.value.style.animation = '')
    }, 300)
  }
}
</script>

<template>
  <!-- 操作 -->
  <div
    class="flex absolute bottom-[100%] -m-1.5 mb-2 opacity-0 transition-opacity group-hover:(opacity-100)"
    :class="item.selected && 'opacity-100'"
  >
    <div v-if="item.data.cards.length > 1" class="flex justify-center relative text-dark font-bold">
      <Transition name="fade">
        <div v-if="takeState.visible" class="absolute bg-white bottom-12 rounded w-max p-2 space-y-1">
          <p>
            从
            <span
              @click="takeState.position = 'front'"
              class="cursor-pointer"
              :class="takeState.position === 'front' && 'text-blue-5'"
            >顶部</span>
            /
            <span
              @click="takeState.position = 'back'"
              class="cursor-pointer"
              :class="takeState.position === 'back' && 'text-blue-5'"
            >底部</span>
            取出
            <input v-model="takeState.num" type="number" min="1" :max="item.data.cards.length - 1" class="w-10 text-center mx-1">
            张
            <br/>
            放置于
            <span
              @click="takeState.target = 'hand'"
              class="cursor-pointer"
              :class="takeState.target === 'hand' && 'text-blue-5'"
            >手牌</span>
            /
            <span
              @click="takeState.target = 'side'"
              class="cursor-pointer"
              :class="takeState.target === 'side' && 'text-blue-5'"
            >旁边</span>
          </p>
          <p class="space-x-1 border-t-2 pt-1">
            <span @click="take" class="cursor-pointer hover:text-blue-5">确认</span>
            <span @click="takeState.visible = false" class="cursor-pointer hover:text-rose-5">取消</span>
          </p>
        </div>
      </Transition>
      <Btn
        @click="takeState.visible = !takeState.visible"
        :class="takeState.visible && 'bg-white !text-dark'"
      >取出</Btn>
    </div>
    <Btn v-if="item.data.cards.length > 1" @click="shuffle">洗牌</Btn>
    <Btn @click="flip">翻面</Btn>
    <Btn @click="rotate">旋转</Btn>
    <Btn>丢弃</Btn>
    <Btn v-if="item.data.cards.length > 1">检索</Btn>
  </div>
  <!-- 卡牌 -->
  <div class="m-2">
    <!-- 放入提示 -->
    <Transition name="fade">
      <div
        v-if="item.data.placeState.show"
        class="
          absolute z-1 flex flex-col w-[calc(100%-0.5rem)] h-[calc(100%-0.5rem)] -m-1
          text-white bg-dark/80 font-bold rounded overflow-hidden
        "
      >
        <div
          @mouseover="item.data.placeState.pos = 'front'"
          class="flex-1 flex justify-center items-center rounded transition-colors hover:(bg-white text-dark)"
        >
          放入顶部
        </div>
        <div
          @mouseover="item.data.placeState.pos = 'back'"
          class="flex-1 flex justify-center items-center rounded transition-colors hover:(bg-white text-dark)"
        >
          放入底部
        </div>
      </div>
    </Transition>
    <!-- 洗牌动画 -->
    <div ref="shuffleDom">
      <!-- 卡牌卡堆 -->
      <div
        class="transition-filter"
        :class="calcRotate(item.data.rotate) === 90 || calcRotate(item.data.rotate) === 270 ? 'w-90 h-60' : 'w-60 h-90'"
        :style="item.data.cards.length > 1 && 'filter: drop-shadow(2px 2px #fff); transform: translate(-1px, -1px);'"
      >
        <!-- 卡牌旋转 -->
        <div
          class="h-full pointer-events-none"
          :class="item.selected && 'transition-transform'"
          :style="{ transform: `rotate(${calcRotate(item.data.rotate)}deg)` }"
        >
          <div
            class="card h-full flex justify-center items-center transition-transform duration-600"
            :class="item.data.isFlipped && 'rotate-y-180'"
          >
            <img class="card-front absolute m-auto" :src="`/img/cards/${item.data.cards[0].front}`" alt="">
            <img class="card-back absolute rotate-y-180 m-auto" :src="`/img/cards/${item.data.cards[0].back}`" alt="">
          </div>
        </div>
        <!-- 卡牌翻面 -->
      </div>
    </div>

  </div>
  <!-- 区域信息 -->
  <p v-if="(item.data.name || item.data.cards.length !== 1) && state.board.rotate === 0" class="absolute flex justify-between w-full px-2 mt-1 text-white/60">
    <span>{{ item.data.name }}</span>
    <span v-if="item.data.cards.length > 1">剩余 {{ item.data.cards.length }} 张</span>
  </p>
</template>

<style>
@keyframes shuffle {
  0% { transform: translate(0, 0); }
  25% { transform: translate(-5px, 5px); }
  50% { transform: translate(5px, -5px); }
  75% { transform: translate(-5px, 5px); }
  100% { transform: translate(0, 0); }
}
.card {
  transform-style: preserve-3d;
}
.card-front, .card-back {
  backface-visibility: hidden;
}
</style>