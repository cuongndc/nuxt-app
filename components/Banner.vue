<script setup>
import { DANH_MUC } from '~/contants/path'
</script>

<template>
  <div class="py-2 mt-6">
    <div class="grid grid-cols-4">
      <div class="grid grid-cols-1">
        <div class="flex items-center justify-center">
          <NuxtLink to="/" class="rounded-[100%] bg-yellow-200">
            <div class="icon w-16 h-16 rounded-[100%] flex items-center justify-center">
              <img
                  alt="ranking"
                  class="w-9 h-9 mb-2"
                  src="/images/ranking.png"
              >
            </div>
          </NuxtLink>
        </div>
        <p class="text-center font-semibold text-xl mt-2">
          Bảng xếp hạng
        </p>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex items-center justify-center">
          <NuxtLink :to="`${DANH_MUC}/all`" class="rounded-[100%] bg-blue-200">
            <div class="icon w-16 h-16 flex items-center justify-center rounded-[100%]">
              <img
                  alt="category"
                  class="w-9 h-9"
                  src="/images/category.png"
              >
            </div>
          </NuxtLink>
        </div>
        <p class="text-center font-semibold text-xl mt-2">
          Thể loại
        </p>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex items-center justify-center">
          <NuxtLink to="/" class="rounded-[100%] bg-amber-200">
            <div class="icon w-16 h-16 rounded-[100%] flex items-center justify-center">
              <!--              <HeartIcon class="w-10 h-10" />-->
            </div>
          </NuxtLink>
        </div>
        <p class="text-center font-semibold text-xl mt-2">
          Theo dõi
        </p>
      </div>
      <div class="grid grid-cols-1">
        <div class="flex items-center justify-center">
          <NuxtLink class="rounded-[100%] bg-green-200">
            <div class="icon w-16 h-16 rounded-[100%] flex items-center justify-center text-3xl">
              📚
            </div>
          </NuxtLink>
        </div>
        <p class="text-center font-semibold text-xl mt-2">
          Lịch sử
        </p>
      </div>
    </div>
  </div>
</template>
