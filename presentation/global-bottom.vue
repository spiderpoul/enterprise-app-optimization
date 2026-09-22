<template>
  <footer class="slide-footer" aria-hidden="true">
    <span class="slide-page">{{ $slidev.nav.currentPage }}</span>
    <span class="slide-progress-track">
      <span
        class="slide-progress-bar"
        :style="{ width: `${($slidev.nav.currentPage / $slidev.nav.total) * 100}%` }"
      />
    </span>
  </footer>
</template>
