<script lang="ts" setup>
// import { Swiper, SwiperSlide } from 'swiper/vue'
import { DANH_MUC, TAG } from '~/contants/path'
import { COMIC_STATUS } from '~/contants/comic'

defineProps({
  record: Object,
})
</script>

<template>
  <div v-for="content in record.content" :key="content._id" class="px-4">
    <div class="h-[70px] mb-4 flex justify-between">
      <h2 class="text-3xl font-bold flex justify-start items-center text-black">
        {{ content.name || content.categoryVietName }}
      </h2>
      <NuxtLink :to="content.type !== 'category' ? `${TAG}/${content.slug}` : `${DANH_MUC}/${content.slug}`" class="text-xl font-semibold flex items-center text-primary mr-1">
        Thêm
      </NuxtLink>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-14 mb-10">
      <div
          v-for="comic in content.comicsReviewNewest"
          :key="comic._id"
          class="col-span-1 rounded-[8px] p-13 max-w-[384px] w-full h-[138px] bg-white relative shadow-[0_3px_20px_rgba(0,0,0,10%)]"
      >
        <div class="absolute bottom-[13px] left-[13px]">
          <NuxtLink :to="useNavigatorComicPreview(comic.slug, comic._id)">
            <div class=" max-w-full w-[105px]">
              <div class="relative">
                <div class="absolute top-0">
                  <span
                      v-if="!comic.adultContent"
                      class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"
                  >
                    {{ COMIC_STATUS[comic.status] }}
                  </span>
                  <span v-else class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1">
                    17+
                  </span>
                </div>
                <SharedMeeToonImg
                    class="rounded-2xl visible h-full left-0 relative top-0 w-full"
                    :src="comic.verticalLogo"
                    :width="105"
                    :height="138"
                />
              </div>
            </div>
          </NuxtLink>
        </div>
        <div class="ml-[118px] p-4">
          <h3 class="text-xl font-medium">
            <a>{{ comic.comicName }}</a>
          </h3>
          <div>
            <div class="rating flex items-center">
              <img v-for="i of 5" :key="i" src="/icons/comicPage/icon-star.svg" alt="rating">
              <p class="text-xl">
                {{ comic.avgRate.toFixed(1) }}
                <span class="text-xl font-semibold text-gray-500"> (369)</span>
              </p>
            </div>
            <a>
              <i class="w-full text-base line-clamp-3">
                "{{ comic.contentReview }}"
              </i>
            </a>
            <div class="mt-3">
              <a class="mt-3">
                <p class="flex items-center justify-start w-full text-gray-500">
                  <img src="/icons/comicPage/icon-comment-count.svg" class="mr-2" alt="comment">
                  <span class="name text-base font-semibold">{{ comic.userComment.name }}</span>
                </p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--    <Swiper -->
    <!--      :breakpoints="{ -->
    <!--        320: { -->
    <!--          slidesPerView: 3.4, -->
    <!--          spaceBetween: 10, -->
    <!--        }, -->
    <!--        480: { -->
    <!--          slidesPerView: 4.4, -->
    <!--          spaceBetween: 10, -->
    <!--        }, -->
    <!--        640: { -->
    <!--          slidesPerView: 5.4, -->
    <!--          spaceBetween: 20, -->
    <!--        }, -->
    <!--      }" -->
    <!--    > -->
    <!--      <SwiperSlide v-for="comic in content.comics" :key="comic.slug"> -->
    <div v-for="comic in content.comics" :key="comic.slug" class="w-[75px]">
      <NuxtLink :to="useNavigatorComicPreview(comic.slug, comic._id)">
        <div class="absolute top-0">
          <span
              v-if="!comic.adultContent"
              class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"
          >
            {{ COMIC_STATUS[comic.status] }}
          </span>
          <span v-else class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1">
            17+
          </span>
        </div>
        <SharedMeeToonImg
            loading="lazy"
            class="rounded-xl w-full"
            :src="comic.verticalLogo"
            :width="105"
            :height="138"
        />
      </NuxtLink>
      <div class="h-[40px] flex flex-wrap">
        <h2 class="text-xl line-clamp-1 mt-1 text-black font-semibold">
          {{ comic.comicName }}
        </h2>
      </div>
    </div>
    <!--      </SwiperSlide> -->
    <!--    </Swiper> -->
  </div>
</template>
