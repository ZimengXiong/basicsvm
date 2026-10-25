<script setup>
const questionnaireUrl = import.meta.env.VITE_QUESTIONNAIRE_URL
</script>

<template>
  <div class="questionnaire-launch">
    <a
      v-if="questionnaireUrl"
      class="questionnaire-button"
      :href="questionnaireUrl"
      rel="noreferrer"
    >
      Start the questionnaire
    </a>
    <p v-else class="questionnaire-closed">
      The questionnaire is not open yet.
    </p>
  </div>
</template>
