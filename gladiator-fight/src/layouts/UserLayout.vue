<template>
    <div class="min-h-screen bg-gradient-to-br from-[#e3eafc] via-[#f7fafd] to-[#c9e4ff] relative genshin-bg">
        <!-- Compact Genshin-style Fixed Top Bar Heade -->
        <header class="fixed top-0 left-0 w-full z-30">
            
        </header>
        <!-- Main content with mobile padding and header offset -->
        <main class="px-2 sm:px-4 py-2 sm:py-4 z-10 relative font-genshin pt-16 sm:pt-20">
            <slot></slot>
        </main>
    </div>
</template>

<style scoped>

.font-genshin {
  font-family: 'Spectral', 'Kanit', 'Montserrat', 'Prompt', Arial, sans-serif;
  letter-spacing: 0.04em;
}
.genshin-logo {
  text-shadow: 0 2px 8px #b2c7e1, 0 1px 0 #fff8;
  color: #5b7bb2;
}
.genshin-bg {
  /* fallback for bg-gradient */
  background: linear-gradient(135deg, #e3eafc 60%, #f7fafd 100%);
}

/* Hide dropdown by default, show on focus-within or hover */
.group:focus-within ul,
.group:hover ul {
  display: block !important;
}
</style>