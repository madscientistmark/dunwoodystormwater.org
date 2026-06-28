<script setup>
defineProps({ message: { type: String, default: null } })
</script>

<template>
  <p v-if="message" class="field-error" role="alert">{{ message }}</p>
</template>

<style scoped>
.field-error { color: #b42318; font-size: 0.9rem; margin: 0.25rem 0 0; }
</style>
