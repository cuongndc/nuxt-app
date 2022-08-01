
<script lang="ts" setup>
// import type { IHomePage } from '~/types'
// import { HomePageTypes } from '~/types'
import { useAsyncData, useFetch } from '#app'
import SharedBannerBar from '~/components/Shared/BannerBar.vue'
import HomePageRepresentCategory from '~/components/HomePage/RepresentCategory.vue'
import HomePageNewStory from '~/components/HomePage/NewStory.vue'

// const { data: homepages } = useFetch<IHomePage>('/api/homepage')
</script>

<template>
  <!--  <div v-if="pending" class="bg-white"> -->
  <!--    <PulseHomeLoading /> -->
  <!--  </div> -->
  <main class="h-[auto] bg-white">
    <h1>
      Hello nuxt
    </h1>
    <!--    <div v-for="record in homepages" :key="record._id" v-memo="homepages"> -->
    <!--      &lt;!&ndash;      <LazyHomePageSpotlight &ndash;&gt; -->
    <!--      &lt;!&ndash;        v-if="record.type === HomePageTypes._banner" &ndash;&gt; -->
    <!--      &lt;!&ndash;        :banner="record" &ndash;&gt; -->
    <!--      &lt;!&ndash;      /> &ndash;&gt; -->
    <!--      <SharedBannerBar v-if="record.type === HomePageTypes._menu" /> -->
    <!--      &lt;!&ndash;      <LazyHomePageTrending v-if="record.type === HomePageTypes._trend" :record="record" /> &ndash;&gt; -->
    <!--      <HomePageRepresentCategory v-if="record.type === HomePageTypes._representCategory" :record="record" /> -->
    <!--      <HomePageNewStory -->
    <!--        v-if="record.type === HomePageTypes._newest || record.type === HomePageTypes._recommendation" -->
    <!--        :record="record" -->
    <!--      /> -->
    <!--    </div> -->
  </main>
</template>
