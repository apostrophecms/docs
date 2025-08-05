# Permissions and Workflow

The permission system available through the core `@apostrophecms/permission` module manages content workflows, user access, and site administration. It allows you to:

- **Create safe content workflows** where drafts can be reviewed before going live
- **Delegate content creation** without worrying about accidental changes to critical pages
- **Control file uploads** to maintain site security and organization
- **Manage user access** to sensitive or premium content
- **Scale your editorial team** with clear roles and responsibilities

## The Four User Roles

Apostrophe provides four user roles that cover most organizational needs:

*Screenshot of permissions grid*

### Guest
Guest users can log in to view content marked as "Login required" but cannot make any changes to the website. Use this role for:
- Newsletter subscribers who get early access to articles
- Community members viewing member-only resources
- External stakeholders who need to review content without editing rights

### Contributor
Contributors can create and edit content but cannot publish it live or upload files. This role is ideal for:
- Freelance writers submitting articles for review
- Team members creating draft content

### Editors
Editors have all contributor permissions plus the ability to publish content and upload files. Perfect for:
- Senior editorial staff who review and approve content
- Content managers overseeing publication schedules
- Marketing teams managing campaigns and assets

### Administrators
Admins can do everything, including user management. Essential for:
- Website administrators
- IT staff managing user accounts
- Senior managers with full oversight needs

## Content Workflow

Let's walk through a typical content workflow to see how permissions create a smooth editorial process.

### Step 1: Contributor Creates Content

A freelance writer with the **Contributor** role logs into the website and creates a new blog post.

*Screenshot of ....?*

As a contributor, the writer can:
- Write and format the article
- Add internal links to other pages
- Save work as a draft
- Edit content multiple times

However, contributors **cannot**:
- Publish the article (it remains in draft status)
- Upload images or files
- Delete the article once submitted

### Step 2: Editor Reviews and Enhances

The content editor with the **Editor** role receives a notification about the new draft article.

*Screenshot showing the draft with a "Draft" status indicator and maybe inbox indicator*

The editor opens the article and reviews it. Editors can:
- Edit the content for style and accuracy
- Upload and add images to enhance the article
- Preview how the article will look when published
- Either publish immediately or request changes

### Step 3: Publication

After reviewing the work and adding appropriate images, the Editor publishes the article.

The article is now live on the website. If changes are needed later:
- The original Contributor can continue to edit the published article (but changes remain as drafts until an editor publishes them)
- The Editor can make immediate changes and publish them

## Advanced Permission Control

While the four standard roles handle most situations, some organizations need more granular control. For complex permission requirements, consider:

### Content Visibility Settings

Every piece of content in Apostrophe has a **"Who can view this?"** setting that works independently of user roles:

- **Public**: Anyone can view (the default)
- **Login required**: Only logged-in users can view
- **Admin only**: Only administrators can view

*[Screenshot would show: The permissions tab of a page editor with the "Who can view this?" dropdown menu open]*

This allows you to create member-only sections, internal company pages, or staged content that's hidden from the public.

### Advanced Permissions Extension

For organizations with complex hierarchies, departmental workflows, or custom permission needs, Apostrophe offers an Advanced Permissions extension that provides:

- **Custom user groups** with specific permission sets
- **Content-based permissions** (e.g., "can only edit blog posts")
- **Hierarchical permissions** for multi-department organizations
- **Advanced workflow states** beyond draft/published

The Advanced Permissions extension also enables per-document permissions, allowing you to grant specific users or groups access to individual pieces of content rather than all content of that type. This enables more targeted workflows - for example, a freelance writer could be given permission to edit only their assigned articles, or a department editor could manage only content in their section.

The Advanced Permissions extension integrates seamlessly with Apostrophe's core permission system while adding enterprise-level control. For detailed implementation guidance, see the [Advanced Permissions documentation](link-to-extension-readme).
