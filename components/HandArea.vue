<template>
  <div
    class="
      fixed bottom-0 w-full bg-dark/60 border-t-2 border-dark-2
      flex justify-center items-center z-1 px-10 transform-translate-y-[50%]
    "
    :style="{ height: '360px', paddingRight: `calc(2.5rem + ${padding}px)` }"
  >
    <div
      v-for="(item, index) in state.hand"
      :id="item.id"
      style="width: 240px; height: 360px"
      class="hand-item relative bottom-0 group hover:(bottom-[50%])"
      :class="[

        selected === index && 'opacity-50 z-1 pointer-events-none',
        (item.transition && transition) && 'transition-all',
        (relatedIndex !== null && targetIndex !== null && index > relatedIndex && index <= targetIndex) && 'translate-x-[-100%]',
        (relatedIndex !== null && targetIndex !== null && index < relatedIndex && index >= targetIndex) && 'translate-x-[100%]'
      ]"

      :data-index="index"
    >
      <img
        class="fixed pointer-events-none group-hover:z-1"
        style="min-width: 240px; height: 360px"
        :src="`/img/cards/${item.front}`" alt=""
      >
    </div>
    <Transition name="fade">
      <div v-if="selected !== null" ref="shadowCardRef" class="fixed left-0">
        <img
          v-if="shadowCard?.front"
          style="width: 240px; height: 360px"
          :src="`/img/cards/${shadowCard.front}`" alt=""
        >
      </div>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
import interact from 'interactjs'
import type { State, HandCard } from '~/interface'
const state = useState<State>('state')
const selected = ref<number | null>(null)
const relatedIndex = ref<number | null>(null)
const targetIndex = ref<number | null>(null)
const transition = ref<boolean>(true)
const shadowCardRef = ref<HTMLElement>()
const shadowCard = ref<HandCard>()
const padding = ref<number>(0)
state.value.hand = [
  // { "id": "1", "name": "黄色0", "front": "uno/card1.svg", "back": "uno/back.svg", layer: 1, transition: true },
  // { "id": "2", "name": "蓝色0", "front": "uno/card2.svg", "back": "uno/back.svg", layer: 2, transition: true },
  // { "id": "3", "name": "绿色0", "front": "uno/card3.svg", "back": "uno/back.svg", layer: 3, transition: true },
  // { "id": "4", "name": "红色0", "front": "uno/card4.svg", "back": "uno/back.svg", layer: 4, transition: true },
  // { "id": "5", "name": "蓝色1", "front": "uno/card5.svg", "back": "uno/back.svg", layer: 5, transition: true },
  // { "id": "6", "name": "蓝色1", "front": "uno/card6.svg", "back": "uno/back.svg", layer: 6, transition: true },
  // { "id": "7", "name": "绿色1", "front": "uno/card7.svg", "back": "uno/back.svg", layer: 7, transition: true },
  // { "id": "8", "name": "绿色1", "front": "uno/card8.svg", "back": "uno/back.svg", layer: 8, transition: true }
]
onMounted(() => {
  // 获取最后一张牌的实际宽度
  const lastCard = document.querySelector('.hand-item:last-child') as HTMLElement
  if (lastCard) {
    const lastCardRect = lastCard.getBoundingClientRect()
    padding.value = 240 - lastCardRect.width
  }
})
interact('.hand-item')
.draggable({
  listeners: {
    start(event) {
      const targetIndex = Number(event.target.getAttribute('data-index'))
      const targetCard = state.value.hand[targetIndex]
      const targetRect = event.target.getBoundingClientRect()
      selected.value = targetIndex
      shadowCard.value = targetCard
      nextTick(() => {
        if (shadowCardRef.value) {
        shadowCardRef.value.style.transform = `translate(${targetRect.left}px, ${ -360 / 2 }px)`
        shadowCardRef.value.setAttribute('data-x', targetRect.left.toString())
        shadowCardRef.value.setAttribute('data-y', (-360 / 2).toString())
      }
      })
    },
    move(event) {
      if (shadowCardRef.value) {
        const x = (parseFloat((shadowCardRef.value as any).getAttribute('data-x')) || 0) + event.dx
        const y = (parseFloat((shadowCardRef.value as any).getAttribute('data-y')) || 0) + event.dy
        shadowCardRef.value.style.transform = `translate(${x}px, ${y}px)`
        shadowCardRef.value.setAttribute('data-x', x)
        shadowCardRef.value.setAttribute('data-y', y)
      }
    },
    end(event) {
      selected.value = null
    }
  }
})
.dropzone({
  accept: '.hand-item',
  ondragenter: (event) => {
    relatedIndex.value = +event.relatedTarget.getAttribute('data-index')
    targetIndex.value = +event.target.getAttribute('data-index')
    if (relatedIndex.value > targetIndex.value) {
      event.relatedTarget.style.transform = `translateX(${-100 * (relatedIndex.value - targetIndex.value)}%)`
    } else if (relatedIndex.value < targetIndex.value) {
      event.relatedTarget.style.transform = `translateX(${100 * (targetIndex.value - relatedIndex.value)}%)`
    }
  },
  ondragleave: (event) => {
    if (targetIndex.value === +event.target.getAttribute('data-index')) {
      targetIndex.value = null
      event.relatedTarget.style.transform = ''
    }
  },
  ondrop: (event) => {
    if (relatedIndex.value === null || targetIndex.value === null) {
      return
    }
    transition.value = false
    const related = state.value.hand.splice(relatedIndex.value as number, 1)
    state.value.hand.splice(targetIndex.value as number, 0, related[0])

    relatedIndex.value = null
    targetIndex.value = null
    event.relatedTarget.style.transform = ''
    setTimeout(() => {
      transition.value = true
    }, 150)
  }
})
</script>

<style>

</style>