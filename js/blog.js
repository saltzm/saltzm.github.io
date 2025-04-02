// List of blog posts in order
const posts = [
    { 
        id: 'post1', 
        title: 'Building a Minimalist Blog', 
        file: 'posts/post1.md',
        content: `# Building a Minimalist Blog

When I set out to create this blog, I wanted something that would be both functional and aesthetically pleasing. The key principles I followed were:

1. **Simplicity**: Keep the design clean and focused on content
2. **Performance**: Load content dynamically to maintain fast initial page load
3. **Accessibility**: Ensure the content is readable and navigable

## Technical Implementation

The blog is built using vanilla JavaScript and CSS, with no heavy frameworks. Here's a snippet of the core functionality:

\`\`\`javascript
async function loadPost(file) {
    const response = await fetch(file);
    const markdown = await response.text();
    return marked.parse(markdown);
}
\`\`\`

This approach allows for:
- Fast initial page load
- Easy content updates
- Clean separation of concerns

## Future Enhancements

I'm considering adding:
- RSS feed support
- Dark/light mode toggle
- Reading time estimates

Stay tuned for updates!`
    },
    { 
        id: 'post2', 
        title: 'The Intersection of Technology and Research', 
        file: 'posts/post2.md',
        content: `# The Intersection of Technology and Research

As someone who works at the intersection of technology and research, I often find myself thinking about how these fields influence each other. This post explores some key observations from my experience.

## Research in the Digital Age

The landscape of academic research has changed dramatically with the advent of modern technology. Key developments include:

- **Open Access**: Making research freely available to everyone
- **Reproducibility**: Tools and platforms for sharing code and data
- **Collaboration**: Global networks of researchers working together

## Challenges and Opportunities

While technology has opened new doors, it also presents challenges:

1. **Data Management**: Handling increasingly large datasets
2. **Version Control**: Managing multiple iterations of research
3. **Publication**: Navigating the digital publishing landscape

## Looking Forward

The future of research technology holds exciting possibilities:
- AI-assisted literature review
- Automated experiment replication
- Enhanced peer review systems

What are your thoughts on the future of research technology?`
    },
    { 
        id: 'post3', 
        title: 'Music and Code: A Creative Connection', 
        file: 'posts/post3.md',
        content: `# Music and Code: A Creative Connection

There's an interesting parallel between programming and music composition. Both involve creating something from nothing, following patterns, and sometimes breaking them.

## The Rhythm of Code

Just as music has rhythm and structure, so does code:

\`\`\`python
def create_melody(notes):
    # Each note is a function call
    # The rhythm is in the timing
    play(note1)
    wait(beat)
    play(note2)
    wait(beat)
\`\`\`

## Patterns in Both Worlds

Common patterns I've noticed:

1. **Repetition**: Both use loops and patterns
2. **Harmony**: Code components working together
3. **Improvisation**: Creative problem-solving

## The Creative Process

Whether I'm writing code or composing music, the process often follows similar steps:

1. Start with a basic structure
2. Iterate and refine
3. Test and adjust
4. Share with others

## Conclusion

The connection between music and programming goes deeper than we might think. Both are forms of creative expression that require both technical skill and artistic vision.

*What connections do you see between your creative and technical pursuits?*`
    }
];

// Initialize the blog section
async function initBlog() {
    // Configure marked to use Prism for syntax highlighting
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            }
            return code;
        }
    });

    // Create blog titles in sidebar
    const blogTitles = document.getElementById('blog-titles');
    posts.forEach((post, index) => {
        const titleElement = document.createElement('div');
        titleElement.className = 'blog-title';
        titleElement.textContent = post.title;
        titleElement.onclick = () => scrollToPost(post.id);
        blogTitles.appendChild(titleElement);
    });

    // Load and render all posts
    const blogContent = document.getElementById('blog-content');
    for (const post of posts) {
        try {
            const html = marked.parse(post.content);
            const postElement = document.createElement('article');
            postElement.id = post.id;
            postElement.className = 'blog-post';
            postElement.innerHTML = html;
            blogContent.appendChild(postElement);
        } catch (error) {
            console.error(`Error rendering ${post.title}:`, error);
            const errorElement = document.createElement('article');
            errorElement.id = post.id;
            errorElement.className = 'blog-post';
            errorElement.innerHTML = `<h1>${post.title}</h1><p>Error rendering post: ${error.message}</p>`;
            blogContent.appendChild(errorElement);
        }
    }

    // Set up scroll observer for highlighting
    setupScrollObserver();

    // Trigger Prism to highlight any code blocks
    Prism.highlightAll();
}

// Scroll to a specific post
function scrollToPost(postId) {
    const element = document.getElementById(postId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

// Set up intersection observer for scroll-based highlighting
function setupScrollObserver() {
    const options = {
        root: null,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Remove active class from all titles
                document.querySelectorAll('.blog-title').forEach(title => {
                    title.classList.remove('active');
                });
                
                // Add active class to corresponding title
                const postId = entry.target.id;
                const postIndex = posts.findIndex(post => post.id === postId);
                if (postIndex !== -1) {
                    document.querySelectorAll('.blog-title')[postIndex].classList.add('active');
                }
            }
        });
    }, options);

    // Observe all blog posts
    posts.forEach(post => {
        const element = document.getElementById(post.id);
        if (element) {
            observer.observe(element);
        }
    });
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initBlog);
