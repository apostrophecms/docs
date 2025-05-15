---
next: false
prev: false
excludeFromFilters: true

# This is a fallback in case the data loader doesn't work
# It demonstrates how to structure the tutorial data
exampleTutorials:
  - title: "Building Websites with ApostropheCMS and Astro"
    frontmatter:
      detailHeading: "Astro" 
      content: "An introduction to Apollo"
      url: "/tutorials/astro/apostrophecms-and-astro.html"
      tags:
        topic: "basics"
        type: "astro"
        effort: "beginner"
  - title: "Getting Started with ApostropheCMS"
    frontmatter:
      detailHeading: "Tutorial" 
      content: "Learn the basics of ApostropheCMS"
      url: "/tutorials/getting-started.html"
      tags:
        topic: "basics"
        type: "tutorial" 
        effort: "beginner"
  - title: "Advanced API Techniques"
    frontmatter:
      detailHeading: "Pro" 
      content: "Master the ApostropheCMS API"
      url: "/tutorials/pro/advanced-api.html"
      tags:
        topic: "api"
        type: "pro"
        effort: "advanced"
---
# Tutorials

Step-by-step tutorials that go beyond the technical explanations in our Guide or Reference sections. Explore real-world implementations, from full project builds to focused how-tos, designed to help you get hands-on with ApostropheCMS.

<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
    detail-heading="Series"
    title="Intro to ApostropheCMS"
    content="Dive into ApostropheCMS with a hands-on tutorial series. We'll guide you step-by-step through crafting your first website, exploring fundamental concepts and practical implementations."
    url="/tutorials/introduction.html"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="Series"
      title="ApostropheCMS & Astro"
      content="ApostropheCMS and Astro work seamlessly together through the `apostrophe-astro` extension. Learn who this integration is for and what makes it a powerful choice for building modern websites."
      url="/tutorials/astro/introducing-apollo.html"
    />
  </template>
</AposTwoColumns>
<AposTwoColumns>
  <template #leftColumn>
    <AposCtaButton
      detail-heading="Collection"
      title="Recipes"
      content="Practical, standalone tutorials for solving specific challenges in ApostropheCMS. These recipes range from simple tips to advanced patterns and can be filtered by topic to match your needs."
      url="/tutorials/recipes.html"
    />
  </template>
  <template #rightColumn>
    <AposCtaButton
      detail-heading="Collection"
      title="Pro Topics"
      content="In-depth tutorials for teams using ApostropheCMS’s commercial modules and advanced capabilities. These guides support complex implementations, from multisite setups to enterprise-grade integrations and workflows."
      url="/tutorials/pro.html"
    />
  </template>
</AposTwoColumns>