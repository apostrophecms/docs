<template>
  <div class="tutorial-filter">
    <div class="filter-container">
      <div class="filter-group">
        <label for="type-filter">Type:</label>
        <select id="type-filter" v-model="selectedType" @change="applyFilters">
          <option value="">All Types</option>
          <option v-for="type in types" :key="type" :value="type">{{ formatTitle(type) }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="topic-filter">Topic:</label>
        <select id="topic-filter" v-model="selectedTopic" @change="applyFilters">
          <option value="">All Topics</option>
          <option v-for="topic in topics" :key="topic" :value="topic">{{ formatTitle(topic) }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label for="effort-filter">Effort:</label>
        <select id="effort-filter" v-model="selectedEffort" @change="applyFilters">
          <option value="">Any Effort</option>
          <option v-for="effort in efforts" :key="effort" :value="effort">{{ formatTitle(effort) }}</option>
        </select>
      </div>
    </div>

    <div v-if="Object.values(groupedTutorials).flat().length === 0" class="no-results">
      No tutorials match your selected filters.
    </div>

    <!-- Render tutorials grouped by type -->
    <template v-for="(groupTutorials, groupType) in groupedTutorials" :key="groupType">
      <!-- Only show group if it has tutorials -->
      <template v-if="groupTutorials.length > 0">
        <!-- Group header -->
        <h2>{{ formatGroupTitle(groupType) }}</h2>

        <!-- Render tutorial pairs within this group using AposTwoColumns -->
        <AposTwoColumns v-for="(pair, index) in getPairs(groupTutorials)" :key="`${groupType}-${index}`">
          <template #leftColumn>
            <AposCtaButton
              v-if="pair[0]"
              :detail-heading="pair[0].detailHeading"
              :title="pair[0].title"
              :content="pair[0].content"
              :url="pair[0].url"
            />
          </template>
          <template #rightColumn>
            <AposCtaButton
              v-if="pair[1]"
              :detail-heading="pair[1].detailHeading"
              :title="pair[1].title"
              :content="pair[1].content"
              :url="pair[1].url"
            />
          </template>
        </AposTwoColumns>
      </template>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { data as tutorialData } from '../theme/tutorials.data.js'

// Filter options
const types = ref([])
const topics = ref([])
const efforts = ref([])

// Selected filter values
const selectedType = ref('')
const selectedTopic = ref('')
const selectedEffort = ref('')

// All tutorials (will be loaded from site data)
const tutorials = ref([])

// Format titles for display
const formatTitle = (str) => {
  if (!str) return '';
  return str.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
}

// Format group titles for display
const formatGroupTitle = (groupType) => {
  if (groupType === 'other') return 'Other Tutorials';

  const formattedType = formatTitle(groupType);

  // Handle plural forms
  if (groupType === 'series') return `${formattedType}`;
  return `${formattedType} Topics`;
}

// Create computed property for filtered tutorials
const filteredTutorials = computed(() => {
  return tutorials.value.filter(tutorial => {
    const matchesType = !selectedType.value || tutorial.tags?.type === selectedType.value;
    const matchesTopic = !selectedTopic.value || tutorial.tags?.topic === selectedTopic.value;
    const matchesEffort = !selectedEffort.value || tutorial.tags?.effort === selectedEffort.value;
    return matchesType && matchesTopic && matchesEffort;
  });
});

// Group tutorials by type
const groupedTutorials = computed(() => {
  const grouped = {};

  // Initialize with empty arrays for common groups to ensure predictable order
  const commonGroups = ['series', 'tutorial', 'astro', 'pro'];
  commonGroups.forEach(group => {
    grouped[group] = [];
  });

  // Add tutorials to their respective groups
  filteredTutorials.value.forEach(tutorial => {
    const group = tutorial.tags?.type || 'other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(tutorial);
  });

  // Sort tutorials within each group by order property
  Object.keys(grouped).forEach(group => {
    grouped[group].sort((a, b) => {
      // Use the order property if available
      const orderA = a.order !== undefined ? a.order : 999;
      const orderB = b.order !== undefined ? b.order : 999;
      return orderA - orderB;
    });
  });

  // Remove empty groups for cleaner display
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key];
    }
  });

  return grouped;
});

// Helper to pair tutorials for the two-column layout
const getPairs = (tutorialsList) => {
  const pairs = [];
  for (let i = 0; i < tutorialsList.length; i += 2) {
    pairs.push([
      tutorialsList[i],
      tutorialsList[i + 1] || null // Handle odd number of tutorials
    ]);
  }
  return pairs;
};

// Method to apply filters
const applyFilters = () => {
  // You could add additional logic here if needed
  // For example, updating URL parameters
};

// Load tutorials and extract filter options
onMounted(() => {
  // Use the data loaded by the content loader
  tutorials.value = tutorialData.tutorials.map(page => ({
    title: page.title,
    detailHeading: page.frontmatter.detailHeading,
    content: page.frontmatter.content || '',
    url: page.frontmatter.url,
    order: page.frontmatter.order,
    tags: page.frontmatter.tags
  }));

  // Extract unique filter options
  const typeSet = new Set();
  const topicSet = new Set();
  const effortSet = new Set();

  tutorials.value.forEach(tutorial => {
    if (tutorial.tags?.type) typeSet.add(tutorial.tags.type);
    if (tutorial.tags?.topic) topicSet.add(tutorial.tags.topic);
    if (tutorial.tags?.effort) effortSet.add(tutorial.tags.effort);
  });

  types.value = Array.from(typeSet).sort();
  topics.value = Array.from(topicSet).sort();
  efforts.value = Array.from(effortSet).sort();
});
</script>

<style scoped>
.tutorial-filter {
  margin: 2rem 0;
}

.filter-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

label {
  margin-bottom: 0.5rem;
  font-weight: 500;
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: var(--vp-c-text-2);
}
</style>