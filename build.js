const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const POSTS_DIR = './posts';
const BLOG_DIR = './blog';

function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

function parseFrontmatter(content) {
    const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!match) return { frontmatter: {}, body: content };

    const frontmatter = {};
    match[1].split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            frontmatter[key.trim()] = valueParts.join(':').trim();
        }
    });
    return { frontmatter, body: match[2] };
}

function parseDate(dateStr) {
    return new Date(dateStr);
}

function injectDateAfterTitle(html, date) {
    // Insert date div after the first </h1>
    return html.replace('</h1>', `</h1>\n<div class="post-date">${date}</div>`);
}

function readPosts() {
    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    const posts = files.map(file => {
        const content = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
        const { frontmatter, body } = parseFrontmatter(content);
        let html = marked(body);
        html = injectDateAfterTitle(html, frontmatter.date);
        return {
            file,
            title: frontmatter.title,
            date: frontmatter.date,
            slug: slugify(frontmatter.title),
            html
        };
    });
    // Sort by date descending (newest first)
    posts.sort((a, b) => parseDate(b.date) - parseDate(a.date));
    return posts;
}

function postTemplate(post, allPosts) {
    const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
    const prevPost = allPosts[currentIndex + 1];
    const nextPost = allPosts[currentIndex - 1];

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>${post.title} - Matthew Saltz</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${post.title}">
    <link rel="stylesheet" href="../../css/styles.css">
    <link rel="stylesheet" href="../../css/blog.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Space+Grotesk:wght@300;400&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
</head>
<body>
    <div id="blog-section">
        <div id="blog-sidebar">
            <div id="blog-header">
                <a href="../../index.html">
                    <h1>MS</h1>
                </a>
                <a href="../" class="blog-label">Blog</a>
            </div>
            <div id="blog-titles">
${allPosts.map(p => `                <a href="../${p.slug}/" class="blog-title${p.slug === post.slug ? ' active' : ''}">${p.title}</a>`).join('\n')}
            </div>
        </div>
        <div id="blog-content">
            <article class="blog-post">
                ${post.html}
            </article>
            <nav class="post-nav">
                ${prevPost ? `<a href="../${prevPost.slug}/" class="prev-post">&larr; ${prevPost.title}</a>` : '<span></span>'}
                ${nextPost ? `<a href="../${nextPost.slug}/" class="next-post">${nextPost.title} &rarr;</a>` : '<span></span>'}
            </nav>
        </div>
    </div>
    <script>Prism.highlightAll();</script>
</body>
</html>`;
}

function indexTemplate(posts) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <title>Matthew Saltz - Blog</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Matthew Saltz's Blog">
    <link rel="stylesheet" href="../css/styles.css">
    <link rel="stylesheet" href="../css/blog.css">
    <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&family=Space+Grotesk:wght@300;400&display=swap" rel="stylesheet">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css" rel="stylesheet">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
</head>
<body>
    <div id="blog-section">
        <div id="blog-sidebar">
            <div id="blog-header">
                <a href="../index.html">
                    <h1>MS</h1>
                </a>
                <div class="blog-label">Blog</div>
            </div>
            <div id="blog-titles">
${posts.map(p => `                <a href="${p.slug}/" class="blog-title">${p.title}</a>`).join('\n')}
            </div>
        </div>
        <div id="blog-content">
${posts.map(p => `            <article class="blog-post">
                ${p.html}
            </article>`).join('\n')}
        </div>
    </div>
    <script>Prism.highlightAll();</script>
</body>
</html>`;
}

function build() {
    const posts = readPosts();

    // Create blog directory
    if (!fs.existsSync(BLOG_DIR)) {
        fs.mkdirSync(BLOG_DIR, { recursive: true });
    }

    // Generate index page
    fs.writeFileSync(path.join(BLOG_DIR, 'index.html'), indexTemplate(posts));
    console.log('Generated: blog/index.html');

    // Generate individual post pages
    posts.forEach(post => {
        const postDir = path.join(BLOG_DIR, post.slug);
        if (!fs.existsSync(postDir)) {
            fs.mkdirSync(postDir, { recursive: true });
        }
        fs.writeFileSync(path.join(postDir, 'index.html'), postTemplate(post, posts));
        console.log(`Generated: blog/${post.slug}/index.html`);
    });

    console.log(`\nBuilt ${posts.length} posts`);
}

build();
