<script setup>
import { ref } from 'vue'
import PetitionForm from '../components/PetitionForm.vue'
import SignatureCount from '../components/SignatureCount.vue'
import { AFFIRMATION_POINTS } from '../lib/petitionFields.js'

const countRef = ref(null)

function onSubmitted() {
  // Give the append a moment to commit, then re-fetch so the number ticks up.
  setTimeout(() => countRef.value && countRef.value.refresh(), 600)
}
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Citizens' Petition for Transparent and Consistent Stormwater Management</h1>
      <SignatureCount ref="countRef" />
      <p>By signing this petition, I affirm that:</p>
      <ul>
        <li v-for="point in AFFIRMATION_POINTS" :key="point">{{ point }}</li>
      </ul>
      <PetitionForm @submitted="onSubmitted" />
    </div>
  </section>
</template>
