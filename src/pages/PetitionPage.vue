<script setup>
import PetitionForm from '../components/PetitionForm.vue'
import SignatureCount from '../components/SignatureCount.vue'
import { AFFIRMATION_POINTS } from '../lib/petitionFields.js'
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Citizens' Petition for Transparent and Consistent Stormwater Management</h1>
      <SignatureCount />
      <p>By signing this petition, I affirm that:</p>
      <ul>
        <li v-for="point in AFFIRMATION_POINTS" :key="point">{{ point }}</li>
      </ul>
      <PetitionForm />
    </div>
  </section>
</template>
