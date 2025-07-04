<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  content: {
    type: String,
    required: true
  }
});

const renderedContent = computed(() => {
  if (!props.content) return '';
  return marked(props.content);
});
</script>

<template>
  <div class="markdown-renderer" v-html="renderedContent"></div>
</template>

<style scoped>
.markdown-renderer {
  line-height: 1.75;
  color: #374151;
  font-size: 0.875rem;
}

/* Reset untuk memastikan list style tidak di-override */
.markdown-renderer :deep(ul),
.markdown-renderer :deep(ol) {
  list-style: revert;
  margin: revert;
  padding: revert;
}

.markdown-renderer :deep(h1),
.markdown-renderer :deep(h2),
.markdown-renderer :deep(h3),
.markdown-renderer :deep(h4),
.markdown-renderer :deep(h5),
.markdown-renderer :deep(h6) {
  font-weight: 600;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  color: #111827;
}

.markdown-renderer :deep(h1) { font-size: 1.875rem; }
.markdown-renderer :deep(h2) { font-size: 1.5rem; }
.markdown-renderer :deep(h3) { font-size: 1.25rem; }
.markdown-renderer :deep(h4) { font-size: 1.125rem; }

.markdown-renderer :deep(p) {
  margin-bottom: 1rem;
}

.markdown-renderer :deep(ul) {
  margin-bottom: 1rem;
  padding-left: 1.5rem;
  list-style-type: disc !important;
  list-style-position: outside !important;
}

.markdown-renderer :deep(ol) {
  padding-left: 1.5rem;
  list-style-type: decimal !important;
  list-style-position: outside !important;
}

.markdown-renderer :deep(li) {
  margin-bottom: 0.125rem;
  display: list-item !important;
}

.markdown-renderer :deep(ul ul) {
  list-style-type: circle !important;
  margin-top: 0.5rem;
}

.markdown-renderer :deep(ul ul ul) {
  list-style-type: square !important;
}

.markdown-renderer :deep(strong) {
  font-weight: 600;
  color: #111827;
}

.markdown-renderer :deep(em) {
  font-style: italic;
}

.markdown-renderer :deep(hr) {
  border: none;
  height: 1px;
  background-color: #e5e7eb;
  margin: 1.5rem 0;
}

.markdown-renderer :deep(blockquote) {
  border-left: 4px solid #3b82f6;
  padding-left: 1rem;
  margin: 1rem 0;
  font-style: italic;
  color: #6b7280;
}

.markdown-renderer :deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
}

.markdown-renderer :deep(pre) {
  background-color: #f3f4f6;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin: 1rem 0;
}

.markdown-renderer :deep(pre code) {
  background-color: transparent;
  padding: 0;
}
</style>