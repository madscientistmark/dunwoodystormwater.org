<script setup>
import CtaButton from '../components/CtaButton.vue'
import SignatureCount from '../components/SignatureCount.vue'
</script>

<template>
  <section class="hero">
    <div class="container">
      <h1>We All Live Downstream</h1>
      <p class="tagline">Because when the rain falls, we all live downstream.</p>
      <SignatureCount variant="hero" />
      <div class="cta-row">
        <CtaButton to="/petition">Sign the Petition</CtaButton>
        <CtaButton to="/share-your-story" variant="secondary">Share Your Story</CtaButton>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container prose">
      <h2>Welcome</h2>
      <p class="lead">If you are visiting this website, you have probably just read
        "We All Live Downstream" in the Dunwoody Crier.</p>
      <p>Thank you for taking the next step.</p>
      <p>Stormwater affects every neighborhood in Dunwoody. Whether your concern is flooding,
        erosion, ponds, lakes, streams, culverts, drainage channels, or stormwater infrastructure,
        we all depend upon the same interconnected system.</p>
      <p>The Dunwoody Stormwater Stewardship Initiative is a citizen-led effort dedicated to
        promoting transparent, consistent, and responsible stormwater management throughout our city.</p>
      <p><strong>This initiative is not about one neighborhood. It is about one city.</strong></p>
    </div>
  </section>

  <section class="section section--alt">
    <div class="container prose">
      <h2>Our Mission</h2>
      <p>We believe Dunwoody can become a model for stormwater stewardship. Our mission is to encourage:</p>
      <ul>
        <li>Transparent government</li>
        <li>Consistent application of stormwater policies</li>
        <li>Responsible stewardship</li>
        <li>Sound engineering</li>
        <li>Meaningful citizen involvement</li>
        <li>Equal treatment for every neighborhood</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="container prose">
      <h2>Why We Need Your Help</h2>
      <p>One signature will not solve this problem. Thousands of signatures can change the conversation.</p>
      <p>Stormwater touches every neighborhood. Every homeowner pays a stormwater utility fee.
        Every neighborhood deserves to be heard.</p>
      <p>Today we are asking you to take one simple step. Sign the Citizens' Petition for
        Transparent and Consistent Stormwater Management.</p>
      <div class="cta-row" style="justify-content:flex-start;">
        <CtaButton to="/petition">Sign the Petition</CtaButton>
      </div>
    </div>
  </section>
</template>
