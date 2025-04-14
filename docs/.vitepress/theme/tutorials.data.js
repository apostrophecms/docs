import { createContentLoader } from 'vitepress'

export default createContentLoader('tutorials/**/*.md', {
  excerpt: false,
  transform(rawData) {
    // Filter out index pages and pages marked as excludeFromFilters
    const tutorials = rawData.filter(page =>
      !page.url.endsWith('/index.html') &&
      page.frontmatter.excludeFromFilters !== true
    )
      .map(page => {
        // Determine the tutorial type based on the file path
        let defaultType = 'tutorial';
        if (page.url.includes('/astro/')) defaultType = 'astro'
        else if (page.url.includes('-series') || page.url.includes('series-')) defaultType = 'series';
        else if (page.url.includes('/pro/') || page.url.includes('pro-')) defaultType = 'pro';

        // Determine topic based on url
        let defaultTopic = 'general';
        if (page.url.includes('api')) defaultTopic = 'api'
        else if (page.url.includes('routing')) defaultTopic = 'routing';
        else if (page.url.includes('extension')) defaultTopic = 'extensions';

        // Process the page data
        return {
          title: page.frontmatter.title || page.title,
          path: page.url,
          frontmatter: {
            detailHeading: page.frontmatter.detailHeading || (defaultType === 'series' ? 'Series' : 'Tutorial'),
            content: page.frontmatter.content || '',
            url: page.frontmatter.url || page.url,
            order: page.frontmatter.order !== undefined ? page.frontmatter.order : 999,
            tags: page.frontmatter.tags || {
              type: defaultType,
              topic: defaultTopic,
              effort: 'medium' // Default effort level
            }
          }
        };
      });

    // Sort tutorials based on order property
    tutorials.sort((a, b) => a.frontmatter.order - b.frontmatter.order);

    return { tutorials };
  }
});
