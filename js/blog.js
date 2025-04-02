// List of blog posts in order
const posts = [
    { 
        id: 'post1', 
        title: 'Building a Minimalist Blog', 
        file: 'posts/post1.md',
        date: 'April 2, 2024'
    },
    { 
        id: 'post2', 
        title: 'The Intersection of Technology and Research', 
        file: 'posts/post2.md',
        date: 'April 2, 2024'
    },
    { 
        id: 'post3', 
        title: 'Music and Code: A Creative Connection', 
        file: 'posts/post3.md',
        date: 'April 2, 2024'
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

    // Add desktop subscribe button
    const subscribeContainer = document.createElement('div');
    subscribeContainer.className = 'subscribe-container';
    
    const subscribeButton = document.createElement('button');
    subscribeButton.className = 'subscribe-button';
    subscribeButton.textContent = 'Subscribe';
    subscribeButton.onclick = showSubscribeForm;
    
    subscribeContainer.appendChild(subscribeButton);
    document.getElementById('blog-sidebar').appendChild(subscribeContainer);

    // Load and render all posts
    const blogContent = document.getElementById('blog-content');
    blogContent.innerHTML = ''; // Clear existing content
    
    for (let i = 0; i < posts.length; i++) {
        try {
            const response = await fetch(posts[i].file);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const markdown = await response.text();
            const html = marked.parse(markdown);
            
            const postElement = document.createElement('article');
            postElement.id = posts[i].id;
            postElement.className = 'blog-post';
            
            // Create date element
            const dateElement = document.createElement('div');
            dateElement.className = 'post-date';
            dateElement.textContent = posts[i].date;
            
            // Add content and date
            postElement.innerHTML = html;
            const firstH1 = postElement.querySelector('h1');
            if (firstH1) {
                firstH1.insertAdjacentElement('afterend', dateElement);
            }
            
            blogContent.appendChild(postElement);

            // Add subscribe button after each post except the last one
            if (i < posts.length - 1) {
                const mobileSubscribe = document.createElement('div');
                mobileSubscribe.className = 'mobile-subscribe-container';
                mobileSubscribe.innerHTML = `
                    <button class="subscribe-button" onclick="showSubscribeForm()">Subscribe to get updates</button>
                `;
                postElement.appendChild(mobileSubscribe);
            }

            // Trigger Prism highlighting for this post
            Prism.highlightAllUnder(postElement);
        } catch (error) {
            console.error(`Error loading ${posts[i].file}:`, error);
            const errorElement = document.createElement('article');
            errorElement.id = posts[i].id;
            errorElement.className = 'blog-post';
            errorElement.innerHTML = `<h1>${posts[i].title}</h1><p>Error loading post: ${error.message}</p>`;
            blogContent.appendChild(errorElement);
        }
    }

    // Set up scroll observer for highlighting
    setupScrollObserver();
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

// Handle subscribe button click
function showSubscribeForm() {
    const modal = document.createElement('div');
    modal.className = 'subscribe-modal';
    
    const form = document.createElement('form');
    form.className = 'subscribe-form embeddable-buttondown-form';
    form.action = 'https://buttondown.com/api/emails/embed-subscribe/matthew-saltz-blog';
    form.method = 'post';
    form.target = 'popupwindow';
    form.onsubmit = () => window.open('https://buttondown.com/matthew-saltz-blog', 'popupwindow');
    
    const label = document.createElement('label');
    label.htmlFor = 'bd-email';
    label.textContent = 'Enter your email';
    
    const emailInput = document.createElement('input');
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.id = 'bd-email';
    emailInput.required = true;
    
    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Subscribe';
    
    const attribution = document.createElement('p');
    const attributionLink = document.createElement('a');
    attributionLink.href = 'https://buttondown.com/refer/matthew-saltz-blog';
    attributionLink.target = '_blank';
    attributionLink.textContent = 'Powered by Buttondown.';
    attribution.appendChild(attributionLink);
    
    const closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.className = 'close-button';
    closeButton.textContent = '×';
    closeButton.onclick = () => document.body.removeChild(modal);
    
    form.appendChild(label);
    form.appendChild(emailInput);
    form.appendChild(submitButton);
    form.appendChild(attribution);
    modal.appendChild(closeButton);
    modal.appendChild(form);
    document.body.appendChild(modal);
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', initBlog);

function createSubscribeButton() {
    const container = document.createElement('div');
    container.className = 'mobile-subscribe-container';
    container.innerHTML = `
        <button class="subscribe-button" onclick="openSubscribeModal()">Subscribe</button>
    `;
    return container;
}

async function renderPost(post, index, total) {
    const postElement = document.createElement('div');
    postElement.className = 'blog-post';
    
    const content = await fetchAndRenderMarkdown(post);
    postElement.innerHTML = content;
    
    // Add date
    const dateElement = document.createElement('div');
    dateElement.className = 'post-date';
    dateElement.textContent = formatDate(post.date);
    postElement.insertBefore(dateElement, postElement.children[1]);
    
    // Add subscribe button after each post except the last one on mobile
    if (window.innerWidth <= 768 && index < total - 1) {
        postElement.appendChild(createSubscribeButton());
    }
    
    return postElement;
}

// Update the loadPosts function to pass total count
async function loadPosts() {
    const posts = [
        { file: 'posts/post3.md', date: '2024-04-02' },
        { file: 'posts/post2.md', date: '2024-04-01' },
        { file: 'posts/post1.md', date: '2024-03-31' }
    ];

    const blogContent = document.getElementById('blog-content');
    blogContent.innerHTML = '';
    
    const blogTitles = document.getElementById('blog-titles');
    blogTitles.innerHTML = '';

    for (let i = 0; i < posts.length; i++) {
        const post = posts[i];
        const postElement = await renderPost(post, i, posts.length);
        blogContent.appendChild(postElement);
        
        // Create title link
        const titleLink = document.createElement('a');
        titleLink.className = 'blog-title';
        titleLink.textContent = postElement.querySelector('h1').textContent;
        titleLink.href = '#' + i;
        titleLink.onclick = (e) => {
            e.preventDefault();
            scrollToPost(i);
            updateActiveTitle(i);
        };
        blogTitles.appendChild(titleLink);
    }

    // Set first post as active
    updateActiveTitle(0);
    setupScrollListener();
}
