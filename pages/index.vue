<script lang="ts" setup>
// import type { IHomePage } from '~/types'
import { PageTypes } from '~/types'
// import { useAsyncData, useFetch } from '#app'
// import SharedBannerBar from '~/components/Shared/BannerBar.vue'
// import HomePageRepresentCategory from '~/components/HomePage/RepresentCategory.vue'
// import HomePageNewStory from '~/components/HomePage/NewStory.vue'
import {RepresentCategory} from "#components";
import {useAsyncData} from "#app";

// const { data: homepages } = await useAsyncData('homepage', () => $fetch('/api/homepage'))
// console.log("homepages", homepages.value)
</script>

<template>
  <!--  <div v-if="pending" class="bg-white"> -->
  <!--    <PulseHomeLoading /> -->
  <!--  </div> -->
  <main class="h-[auto] bg-white">
    <h1>
      Hello nuxt
    </h1>
<!--    <div v-for="record in homepages" :key="record._id">-->
<!--      &lt;!&ndash;      <LazyHomePageSpotlight &ndash;&gt;-->
<!--      &lt;!&ndash;        v-if="record.type === HomePageTypes._banner" &ndash;&gt;-->
<!--      &lt;!&ndash;        :banner="record" &ndash;&gt;-->
<!--      &lt;!&ndash;      /> &ndash;&gt;-->
<!--      &lt;!&ndash;          <SharedBannerBar v-if="record.type === HomePageTypes._menu" /> &ndash;&gt;-->
<!--      &lt;!&ndash;      <LazyHomePageTrending v-if="record.type === HomePageTypes._trend" :record="record" /> &ndash;&gt;-->
<!--      <RepresentCategory v-if="record.type === PageTypes._representCategory" :record="record" />-->
<!--      &lt;!&ndash;          <HomePageNewStory &ndash;&gt;-->
<!--      &lt;!&ndash;            v-if="record.type === HomePageTypes._newest || record.type === HomePageTypes._recommendation" &ndash;&gt;-->
<!--      &lt;!&ndash;            :record="record" &ndash;&gt;-->
<!--      &lt;!&ndash;          /> &ndash;&gt;-->
<!--    </div>-->
  </main>
</template>
