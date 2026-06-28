<script setup>
const faqs = [
  { q: 'Is this only about Kingsley Lake?', a: 'No. Kingsley simply reminds us that stormwater affects every neighborhood in Dunwoody.' },
  { q: 'Is this an organization opposing the City?', a: 'No. We support responsible stewardship, transparency, and constructive dialogue.' },
  { q: 'Why should I sign?', a: 'Your signature demonstrates that residents throughout Dunwoody believe stormwater deserves greater attention and consistent management.' },
  { q: 'What happens after I sign?', a: 'You will receive periodic updates about the Initiative, opportunities to participate, and information regarding future meetings and progress.' },
]
</script>

<template>
  <section class="section">
    <div class="container prose">
      <h1 class="page-title">Frequently Asked Questions</h1>
      <div v-for="item in faqs" :key="item.q" class="faq__item">
        <p class="faq__q">{{ item.q }}</p>
        <p>{{ item.a }}</p>
      </div>
    </div>
  </section>
</template>
