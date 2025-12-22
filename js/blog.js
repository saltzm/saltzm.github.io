// List of blog posts in order
const posts = [
    { 
        id: 'post1', 
        title: 'On Managing Cravings', 
        file: 'posts/post1.md',
        date: 'October 29, 2025'
    },
    {
        id: 'post3',
        title: "You don't have to answer the question",
        file: 'posts/post3.md',
        date: 'December 21, 2025'
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
    blogContent.innerHTML = '';
    
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

// Scroll to a specific post and center its title
function scrollToPost(postId) {
    // First scroll to the post
    const element = document.getElementById(postId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        
        // Center the title in the titles bar (after a slight delay to ensure scrolling has completed)
        setTimeout(() => {
            centerActiveTitle(postId);
        }, 500);
    }
}

// Center the active title in the title bar
function centerActiveTitle(postId) {
    if (window.innerWidth <= 768) { // Only on mobile
        const titlesContainer = document.getElementById('blog-titles');
        const postIndex = posts.findIndex(post => post.id === postId);
        
        if (postIndex !== -1 && titlesContainer) {
            const titleElements = document.querySelectorAll('.blog-title');
            const activeTitle = titleElements[postIndex];
            
            if (activeTitle) {
                // Calculate the scroll position to center the title
                const containerWidth = titlesContainer.offsetWidth;
                const titleOffsetLeft = activeTitle.offsetLeft;
                const titleWidth = activeTitle.offsetWidth;
                
                // Center the title in the container with a slight left offset to ensure full visibility
                // This helps prevent the right side from being cut off
                const scrollPosition = titleOffsetLeft - (containerWidth / 2) + (titleWidth / 2) - 10;
                
                // Ensure we don't scroll too far right (past the end)
                const maxScroll = titlesContainer.scrollWidth - containerWidth;
                const finalPosition = Math.min(scrollPosition, maxScroll);
                
                // Ensure we don't scroll too far left (before the beginning)
                const safePosition = Math.max(0, finalPosition);
                
                // Smooth scroll the titles container
                titlesContainer.scrollTo({
                    left: safePosition,
                    behavior: 'smooth'
                });
            }
        }
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
                    
                    // Center the active title
                    centerActiveTitle(postId);
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
