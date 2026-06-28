<script setup>
import StoryForm from '../components/StoryForm.vue'
import { ISSUE_TYPES } from '../lib/storyFields.js'
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Share Your Story</h1>
      <p class="lead">Every neighborhood has a stormwater story.</p>
      <p>Has your neighborhood experienced:</p>
      <ul>
        <li v-for="issue in ISSUE_TYPES" :key="issue">{{ issue }}</li>
      </ul>
      <p>We would like to hear your story. Your experience may help improve stormwater
        management throughout Dunwoody.</p>
      <StoryForm />
    </div>
  </section>
</template>
