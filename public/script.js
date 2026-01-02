// Mobile Menu Toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
}

// Close mobile menu when clicking on a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        if (mobileToggle) mobileToggle.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Dropdown Menu Functionality for Mobile
const dropdowns = document.querySelectorAll('.dropdown');

dropdowns.forEach(dropdown => {
    const dropdownLink = dropdown.querySelector('a');
    
    if (dropdownLink) {
        dropdownLink.addEventListener('click', (e) => {
            // Always allow dropdown toggle on mobile, prevent navigation
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            }
        });
    }
});

// Close dropdown when clicking outside on mobile
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768) {
        dropdowns.forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
});

// Talent Roster Filtering
const talentFilters = document.querySelectorAll('.talent-filters .filter-btn');
const talentProfiles = document.querySelectorAll('.talent-profile');

if (talentFilters.length > 0) {
    talentFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            talentFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');
            
            const sport = filter.getAttribute('data-sport');
            
            // Filter talent profiles
            talentProfiles.forEach(profile => {
                if (sport === 'all' || profile.getAttribute('data-sport') === sport) {
                    profile.classList.remove('hidden');
                } else {
                    profile.classList.add('hidden');
                }
            });
        });
    });
}

// Work/Case Studies Filtering
const workFilters = document.querySelectorAll('.work-filters .filter-btn');
const caseStudies = document.querySelectorAll('.case-study');

if (workFilters.length > 0) {
    workFilters.forEach(filter => {
        filter.addEventListener('click', () => {
            // Remove active class from all filters
            workFilters.forEach(f => f.classList.remove('active'));
            // Add active class to clicked filter
            filter.classList.add('active');
            
            const workType = filter.getAttribute('data-work');
            
            // Filter case studies
            caseStudies.forEach(caseStudy => {
                if (workType === 'all' || caseStudy.getAttribute('data-work') === workType) {
                    caseStudy.classList.remove('hidden');
                } else {
                    caseStudy.classList.add('hidden');
                }
            });
        });
    });
}

// Contact Form Tabs
const contactTabs = document.querySelectorAll('.contact-tab');
const contactForms = document.querySelectorAll('.contact-form');

if (contactTabs.length > 0) {
    contactTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and forms
            contactTabs.forEach(t => t.classList.remove('active'));
            contactForms.forEach(f => f.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding form
            const formType = tab.getAttribute('data-form');
            const targetForm = document.querySelector(`.contact-form[data-form-type="${formType}"]`);
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });
}

// Scroll Animation for Sections
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar Background on Scroll
const navbar = document.querySelector('.navbar');

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized scroll handler
const handleScroll = debounce(() => {
    const currentScroll = window.pageYOffset;
    
    if (navbar) {
        if (currentScroll > 100) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
        }
    }
}, 10);

// Add debounced scroll listener for navbar
window.addEventListener('scroll', handleScroll, { passive: true });

// Contact Form Handling
const contactFormBrands = document.getElementById('contactFormBrands');
const contactFormAthletes = document.getElementById('contactFormAthletes');
const contactFormMedia = document.getElementById('contactFormMedia');
const contactFormCareers = document.getElementById('contactFormCareers');

function handleFormSubmit(form, formType) {
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            data.formType = formType;
            
            // Get submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn ? submitBtn.textContent : 'Submit';
            
            // Disable button and show loading
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
            }
            
            try {
                const response = await fetch('/api/contact/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Show success message
                    alert(result.message || `Thank you for your ${formType} inquiry! We'll get back to you soon.`);
                    // Reset form
                    form.reset();
                } else {
                    // Show error message
                    alert(result.message || 'Failed to send message. Please try again or contact us directly.');
                }
            } catch (error) {
                console.error('Error submitting form:', error);
                alert('Network error. Please try again or contact us directly at the email addresses provided.');
            } finally {
                // Re-enable button
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    }
}

handleFormSubmit(contactFormBrands, 'brands');
handleFormSubmit(contactFormAthletes, 'athletes');
handleFormSubmit(contactFormMedia, 'media');
handleFormSubmit(contactFormCareers, 'careers');

// Hero Carousel Autoslide
let currentSlide = 0;
let carouselInterval = null;

// Make function globally accessible
window.initHeroCarousel = function() {
    const heroSlides = document.querySelectorAll('.hero-slide');
    const heroIndicators = document.querySelectorAll('.hero-carousel-indicators .indicator');
    const slideInterval = 5000; // 5 seconds

    if (heroSlides.length === 0) return;

    function showSlide(index) {
        // Remove active class from all slides and indicators
        heroSlides.forEach(slide => slide.classList.remove('active'));
        heroIndicators.forEach(indicator => indicator.classList.remove('active'));
        
        // Add active class to current slide and indicator
        if (heroSlides[index]) {
            heroSlides[index].classList.add('active');
            const video = heroSlides[index].querySelector('.hero-video');
            if (video) {
                // Pause all other videos
                heroSlides.forEach((slide, i) => {
                    if (i !== index) {
                        const otherVideo = slide.querySelector('.hero-video');
                        if (otherVideo) {
                            otherVideo.pause();
                        }
                    }
                });
                // Play current video
                video.currentTime = 0;
                video.load();
                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            console.log('Video playing');
                        })
                        .catch(error => {
                            console.log('Video autoplay prevented:', error);
                        });
                }
            }
        }
        if (heroIndicators[index]) {
            heroIndicators[index].classList.add('active');
        }
    }

    function nextSlide() {
        currentSlide = (currentSlide + 1) % heroSlides.length;
        showSlide(currentSlide);
    }

    // Ensure all videos are set up correctly
    heroSlides.forEach((slide, index) => {
        const video = slide.querySelector('.hero-video');
        if (video) {
            video.setAttribute('playsinline', '');
            video.setAttribute('muted', '');
            video.setAttribute('loop', '');
            video.setAttribute('autoplay', '');
            video.muted = true;
            video.loop = true;
            video.playsInline = true;
            
            // Load video
            video.load();
            
            // Only play the first video initially
            if (index === 0) {
                // Try to play after video is loaded
                const tryPlay = () => {
                    const playPromise = video.play();
                    if (playPromise !== undefined) {
                        playPromise
                            .then(() => {
                                console.log('Video playing successfully');
                            })
                            .catch(error => {
                                console.log('Video autoplay prevented:', error);
                                // Try again after user interaction
                                document.addEventListener('click', () => {
                                    video.play().catch(e => console.log('Still cannot play:', e));
                                }, { once: true });
                            });
                    }
                };
                
                if (video.readyState >= 2) {
                    tryPlay();
                } else {
                    video.addEventListener('loadeddata', tryPlay, { once: true });
                }
            } else {
                video.pause();
            }
        }
    });

    // Show first slide
    showSlide(0);
    
    // Set up autoslide
    if (carouselInterval) {
        clearInterval(carouselInterval);
    }
    carouselInterval = setInterval(nextSlide, slideInterval);
    
    console.log('Hero carousel initialized with', heroSlides.length, 'slides');
    
    // Pause on hover
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mouseenter', () => {
            if (carouselInterval) {
                clearInterval(carouselInterval);
            }
        });
        
        hero.addEventListener('mouseleave', () => {
            carouselInterval = setInterval(nextSlide, slideInterval);
        });
    }
    
    // Indicator click handlers
    heroIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentSlide = index;
            showSlide(currentSlide);
            // Reset interval
            if (carouselInterval) {
                clearInterval(carouselInterval);
            }
            carouselInterval = setInterval(nextSlide, slideInterval);
        });
    });
}

// Initialize carousel when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initHeroCarousel();
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        initHeroCarousel();
    }, 100);
}

// Parallax Effect for Hero Section (disabled for carousel)
// window.addEventListener('scroll', () => {
//     const scrolled = window.pageYOffset;
//     const hero = document.querySelector('.hero');
//     
//     if (hero) {
//         const heroContent = hero.querySelector('.hero-content');
//         if (heroContent && scrolled < window.innerHeight) {
//             heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
//             heroContent.style.opacity = Math.max(0, 1 - scrolled / 600);
//         }
//     }
// }, { passive: true });

// Close Dropdown When Clicking Outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        dropdowns.forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    }
});

// Active Navigation Link Highlighting
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}, { passive: true });

// Initialize animations on page load
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
    
    // Trigger initial scroll animations
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '1';
    }
    
    // Ensure carousel is initialized
    if (carouselInterval === null) {
        initHeroCarousel();
    }
    
    // Initialize talent filter - show all by default
    const talentProfiles = document.querySelectorAll('.talent-profile');
    if (talentProfiles.length > 0) {
        talentProfiles.forEach(profile => {
            profile.classList.remove('hidden');
        });
    }
    
    // Initialize case studies - show all by default
    const caseStudies = document.querySelectorAll('.case-study');
    if (caseStudies.length > 0) {
        caseStudies.forEach(caseStudy => {
            caseStudy.classList.remove('hidden');
        });
    }
});

// Lazy Loading for Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            }
        });
    });
    
    document.querySelectorAll('img.lazy').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add loading animation
document.addEventListener('DOMContentLoaded', () => {
    // Remove any loading overlay if present
    const loader = document.querySelector('.loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
});

// Image error handling - fallback to placeholder
document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
        this.style.display = 'none';
        const placeholder = document.createElement('div');
        placeholder.style.cssText = 'width: 100%; height: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;';
        placeholder.textContent = 'Image';
        this.parentNode.appendChild(placeholder);
    });
});