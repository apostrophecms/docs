---
title: "Adding a Background Video to a Widget in ApostropheCMS"
detailHeading: "Tutorial"
url: "/tutorials/adding-a-background-video-to-a-widget.html"
content: "Learn how to let editors upload their own MP4 files and use them as looping, full-bleed background videos behind a widget. This recipe covers teaching the attachment module a new file type, managing videos as a reusable piece type, and the CSS that makes a video cover its container without letterboxing."
tags:
  topic: "Core Concepts"
  type: tutorial
  effort: intermediate
---
# Adding a Background Video to a Widget in ApostropheCMS

## Why This Matters

The core `@apostrophecms/video-widget` is built for *embedded* videos — YouTube, Vimeo, and other oEmbed providers — and for most content that is exactly what you want. Embedding offloads hosting and bandwidth to the provider at no cost to you, lets viewers like and share the clip on its native platform, and gives the video its own search-engine presence that can send traffic back to your site.

A background video is a different job. A short, silent, looping clip that sits *behind* a widget is a design element, not shareable content, and it has to be muted, auto-played, cropped, and stripped of player chrome — things an embedded provider won't let you do reliably. For that, you might decide to host the video file yourself.

To do that you need three things working together:

1. The attachment module has to accept the upload in the first place — by default it only allows images and office documents, not `.mp4`.
2. Editors need a comfortable place to upload and reuse those clips, the same way they manage images.
3. The markup and CSS have to make the video *cover* the widget and crop the overflow, never letterboxing it.

This recipe wires all three together. We'll use a hero widget as the example — its full source is linked in Step 3 — but the pattern applies to any widget or page template.

## Trade-offs and alternatives

Self-hosting means you take on everything the embed providers were handling for you. Before you build this, make sure you and your editors are ready for it:

- **You pay for hosting.** The file lives in your project's storage — local disk, or whatever `uploadfs` backend you've configured — and counts against that budget.
- **You pay for bandwidth.** Every page view streams the file from your origin or CDN. A multi-megabyte clip on a high-traffic page can dominate your egress costs.
- **Your reverse proxy must allow large uploads.** Video files dwarf images, so an upload can exceed the default body-size limit of nginx (`client_max_body_size`), Apache, or a cloud load balancer. If editors hit a `413 Payload Too Large` error, that limit is why.
- **Your editors own the encoding.** Nothing transcodes or compresses the upload for you — `image: false` (Step 1) means the file is stored exactly as received. Editors are responsible for delivering a web-appropriate clip: reasonable dimensions, a tuned bitrate, and a small enough file that it doesn't stall the page.

If those tradeoffs aren't right for you, consider building a similar feature around [Vimeo's background video option](https://help.vimeo.com/hc/en-us/articles/12426285089681-About-embedding-background-and-Chromeless-videos), which requires a paid Vimeo plan.

A third option is to use a plain `url` field and require the editor to provide their own URL pointing to an indendently hosted video file.

## What You'll Build

- A **`video` file group** that whitelists `.mp4` uploads.
- A **`Local Video` piece type** that stores an uploaded clip, managed like an image.
- A **relationship field** on the widget so editors can pick a clip.
- A **template and stylesheet** that render the clip as a cover-cropped background.

## Step 1: Teach the Attachment Module to Accept MP4 Uploads

ApostropheCMS validates every upload against a set of *file groups*. Out of the box there are two — `images` and `office` — and an extension that belongs to neither is rejected before it is ever stored. We add a third group for video using the attachment module's `addFileGroups` option.

<AposCodeBlock>

```javascript
export default {
  options: {
    // Add a "video" file group that accepts mp4 uploads. uploadfs stores the
    // file as-is (image: false), so no scaled renditions are generated.
    addFileGroups: [
      {
        name: 'video',
        label: 'Video',
        extensions: [ 'mp4' ],
        extensionMaps: {},
        image: false
      }
    ]
  }
};
```
  <template v-slot:caption>
    modules/@apostrophecms/attachment/index.js
  </template>
</AposCodeBlock>

A few things worth calling out:

- **`image: false`** tells `uploadfs` to store the file exactly as uploaded. The image pipeline (which generates the `one-sixth`, `full`, `max`, etc. renditions) only runs for image groups, so this keeps Apostrophe from trying to resize a video.
- **`extensions`** is a list, so you can accept more formats by adding to it, e.g. `[ 'mp4', 'webm' ]`.
- **`addFileGroups`** *merges* with the built-in groups rather than replacing them, so images and documents keep working.

> [!NOTE]
> Because `@apostrophecms/attachment` is a core module, you do **not** register it in `app.js`. Any project-level code in `modules/@apostrophecms/attachment/` is merged into the core module automatically at startup.

## Step 2: Create a "Local Video" Piece Type

You *could* put an attachment field directly on the widget, but a dedicated piece type is usually the better choice: editors get a familiar manager to upload and organize clips, and the same video can be reused across many widgets and pages. This mirrors how `@apostrophecms/image` works.

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Local Video',
    pluralLabel: 'Local Videos',
    // Treat uploaded videos like images and files: publish immediately,
    // with no separate draft workflow.
    autopublish: true
  },
  fields: {
    add: {
      video: {
        type: 'attachment',
        label: 'Video',
        // Only accept files from the "video" group defined in Step 1.
        fileGroup: 'video',
        required: true
      }
    },
    group: {
      basics: {
        label: 'Basics',
        fields: [ 'title', 'video' ]
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/local-video/index.js
  </template>
</AposCodeBlock>

The `fileGroup: 'video'` option is what connects this field to Step 1 — the upload UI will only offer `.mp4` files, and the server rejects anything else. Setting `autopublish: true` gives the piece the same publish-on-save behavior as the built-in image and file managers.

Unlike the attachment override, this is a brand-new module, so it must be turned on in `app.js`:

<AposCodeBlock>

```javascript
import apostrophe from 'apostrophe';

apostrophe({
  // ...
  modules: {
    // ... your other modules
    'local-video': {}
  }
});
```
  <template v-slot:caption>
    app.js
  </template>
</AposCodeBlock>

> [!TIP]
> This recipe uses plain string labels (`'Local Video'`, `'Video'`) to stay focused. In a production project, use namespaced translation strings instead — see [localizing schema field labels](/guide/localization/static.html#localizing-schema-field-labels).

## Step 3: Add a Background Video Field to Your Widget

Now give the widget a relationship to the new piece type so editors can choose a clip. We cap it at one with `max: 1`.

> [!NOTE]
> This recipe uses a hero widget as its example. If you don't already have one, crib from the hero widget in the ApostropheCMS public demo: [`apostrophecms/public-demo/modules/hero-widget`](https://github.com/apostrophecms/public-demo/tree/main/modules/hero-widget). Its `index.js` and `views/widget.html` are the starting point that the snippets below extend.

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/widget-type',
  // ...
  fields: {
    add: {
      // ... your existing fields
      _backgroundVideo: {
        label: 'Background Video',
        help: 'Optional looping video shown behind the widget. It always covers the widget and is cropped to fit — never letterboxed.',
        type: 'relationship',
        withType: 'local-video',
        max: 1
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/hero-widget/index.js
  </template>
</AposCodeBlock>

Relationship field names are prefixed with an underscore (`_backgroundVideo`) by convention, and their value is **always an array** even when `max: 1`. That is why the template in the next step reads `[0]`. Because Apostrophe loads the full related document by default, the chosen piece's `video` attachment comes along with it — no extra projection needed.

> [!TIP]
> If a clip never needs to be reused, you can skip the piece type entirely and put `video: { type: 'attachment', fileGroup: 'video' }` directly on the widget. You still need Step 1, but you lose the shared media manager and the ability to reference one video from many places.

## Step 4: Render the Video in Your Template

Pull the related piece out of the array, and render a `<video>` element only when one is selected. The attachment module's `url` helper turns the stored attachment into a servable URL.

<AposCodeBlock>

```nunjucks
{% set backgroundVideo = widget._backgroundVideo[0] %}

<div class="widget hero-widget">
  {% if backgroundVideo and backgroundVideo.video %}
    <video
      class="hero-widget__video"
      autoplay
      muted
      loop
      playsinline
      preload="auto"
      src="{{ apos.attachment.url(backgroundVideo.video) }}"
    ></video>
  {% endif %}
  <div class="hero-widget__content">
    {% area widget, 'content' %}
  </div>
</div>
```
  <template v-slot:caption>
    modules/hero-widget/views/widget.html
  </template>
</AposCodeBlock>

The attribute combination is what makes a background video behave:

- **`muted`** is mandatory — browsers block `autoplay` for videos that have sound.
- **`playsinline`** keeps the clip inline on iOS instead of hijacking the screen into a fullscreen player.
- **`loop`** restarts it seamlessly, and **`preload="auto"`** lets the browser start buffering early.

Guarding with `{% if backgroundVideo and backgroundVideo.video %}` means the markup simply isn't emitted when no clip is chosen, so the widget falls back to its normal appearance.

## Step 5: Make the Video Cover the Widget

The final piece is the styling. Make the widget a positioning context, stretch the video across it, and let `object-fit: cover` do the cropping.

<AposCodeBlock>

```scss
.hero-widget {
  position: relative;
  margin: 0 auto;
}

.hero-widget__video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  // object-fit: cover scales the footage to fill this box and crops the
  // overflow — covering the widget and never letterboxing it.
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
}

// Keep the widget content above the video.
.hero-widget__content {
  position: relative;
  z-index: 1;
}
```
  <template v-slot:caption>
    modules/asset/ui/src/_hero.scss
  </template>
</AposCodeBlock>

`object-fit: cover` is the whole trick: it preserves the video's aspect ratio while filling its box, cropping whatever spills over. (Its opposite, `contain`, is what produces letterboxing — so we never want that here.) The video element is absolutely positioned with `inset: 0` so it is exactly the size of the widget, and `pointer-events: none` keeps it from intercepting clicks meant for the content above it.

> [!IMPORTANT]
> It is tempting to add `overflow: hidden` to `.hero-widget` as a "belt and suspenders" crop. Don't. `object-fit: cover` already crops the footage to the video element's box, so it is unnecessary — and worse, `overflow: hidden` will clip the editor's own dropdowns and context menus that legitimately extend past the widget while editing. That breakage happens even when no video has been selected.

## Bonus: Preview Clips in the Manager

Since these pieces *are* videos, it's nice to see them in the piece manager rather than just a title. You can add a custom column whose cell renders a small, paused `<video>` that plays on hover — much like the thumbnails the core media library shows for images.

This relies on ApostropheCMS's custom admin UI layer. Rather than reproduce it here, see [Adding custom columns to the piece type manager](/guide/custom-ui.html#adding-custom-columns-to-the-apostrophecms-piece-type-manager) in the [Customizing the User Interface](/guide/custom-ui.html) guide for the full mechanism. In short, it takes two parts: a column definition on the server and a Vue cell component in the browser.

First, register the column. Naming it `video` is the key detail — the manager adds each column's name to its database projection, so the `video` attachment travels to the browser with every row.

<AposCodeBlock>

```javascript
export default {
  extend: '@apostrophecms/piece-type',
  options: {
    label: 'Local Video',
    pluralLabel: 'Local Videos',
    autopublish: true,
    // Each manager row mounts a <video> that fetches metadata and a first
    // frame, so show fewer per page than the default of 50.
    perPage: 20
  },
  fields: {
    // ... the `video` attachment field from Step 2 ...
  },
  columns: {
    add: {
      video: {
        name: 'video',
        label: 'Preview',
        component: 'AposCellVideoPreview'
      }
    }
  }
};
```
  <template v-slot:caption>
    modules/local-video/index.js
  </template>
</AposCodeBlock>

Then add the cell component. ApostropheCMS automatically registers any Vue component in a module's `ui/apos/components/` directory, so `component: 'AposCellVideoPreview'` resolves to this file:

<AposCodeBlock>

```vue
<template>
  <video
    v-if="src"
    :src="src"
    class="apos-video-preview"
    muted
    playsinline
    preload="metadata"
    @mouseenter="play"
    @mouseleave="pause"
  />
  <span v-else>—</span>
</template>

<script>
import AposCellMixin from 'Modules/@apostrophecms/ui/mixins/AposCellMixin';

export default {
  name: 'AposCellVideoPreview',
  mixins: [ AposCellMixin ],
  computed: {
    src() {
      const attachment = this.get(this.header.name);
      if (!attachment || !attachment._id) {
        return null;
      }
      // "#t=0.1" nudges the browser to paint the first frame as a still.
      return `${apos.util.attachmentUrl(attachment)}#t=0.1`;
    }
  },
  methods: {
    play(event) {
      const promise = event.target.play();
      // play() rejects if the pointer leaves before playback starts; ignore.
      if (promise) {
        promise.catch(() => {});
      }
    },
    pause(event) {
      event.target.pause();
      event.target.currentTime = 0;
    }
  }
};
</script>

<style scoped>
.apos-video-preview {
  display: block;
  height: 48px;
  width: auto;
  max-width: 120px;
  border-radius: 4px;
}
</style>
```
  <template v-slot:caption>
    modules/local-video/ui/apos/components/AposCellVideoPreview.vue
  </template>
</AposCodeBlock>

The mechanics of cell components live in the guide linked above; what this particular file does is short:

- **`AposCellMixin`** hands the component its row data plus a `get()` helper, so `this.get('video')` returns the attachment object the projection delivered.
- **`apos.util.attachmentUrl(attachment)`** resolves that attachment to a URL. It's the supported admin-UI helper, so you never hand-assemble the uploadfs path.
- **`preload="metadata"` with no `autoplay`** loads just enough to show the first frame and stays paused; `#t=0.1` coaxes browsers into painting that frame, and the hover handlers play it and rewind.

> [!IMPORTANT]
> Adding a `ui/` directory to a module changes the admin bundle, so **restart the dev server** (not just reload the page) for the new component to appear. See [Rebuilding the custom admin UI](/guide/custom-ui.html#rebuilding-the-custom-admin-ui-when-we-make-changes).

> [!TIP]
> Every preview row fetches video metadata and a first frame — real bandwidth, the same trade-off from earlier, which is why we dropped `perPage` from 50 to 20. For a heavily used library, generate a still image at upload time and show that instead; it removes the per-row video entirely.

## Conclusion

By teaching the attachment module a new file group, storing clips in a reusable piece type, and leaning on `object-fit: cover`, you give editors a self-hosted background video they can manage as easily as an image — with none of the letterboxing or clipped-menu pitfalls. The same file-group technique extends to any upload type you need (audio, additional video formats, design files), and the relationship-plus-attachment pattern works anywhere on the site, not just in a hero.

---

**Related Resources:**
- [Creating Pieces](/tutorials/pieces.html)
- [Creating Widgets](/tutorials/widgets.html)
- [Customizing the User Interface](/guide/custom-ui.html)
- [`object-fit` (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit)
- [The `<video>` element (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video)
