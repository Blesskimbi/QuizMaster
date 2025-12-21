document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-list a');
    
  mobileMenuBtn.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    const isExpanded = navMenu.classList.contains('active');
    mobileMenuBtn.setAttribute('aria-expanded', isExpanded);
    mobileMenuBtn.innerHTML = isExpanded ? 
    '<i class="fas fa-times"></i>' : 
    '<i class="fas fa-bars"></i>';
  });
  
  // Close mobile menu when clicking a link
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
  
  // Animated counter for students
  const counter = document.querySelector('.counter');
  if (counter) {
    const target = parseInt(counter.getAttribute('data-count'));
    let count = 0;
    const increment = target / 200;
    
    function updateCounter() {
      if (count < target) {
        count += increment;
        counter.textContent = Math.floor(count);
        setTimeout(updateCounter, 10);
      } else {
        counter.textContent = target;
      }
    }
      
    // Start counter when element is in viewport
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          updateCounter();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    observer.observe(counter);
  }






  
  // Search button functionality not yet functional
  const searchBtn = document.querySelector('.search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', function() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search quizzes...';
    searchInput.style.cssText = `
      padding: 0.8rem;
      border-radius: 999px;
      border: 1px solid #2a2a3a;
      font-size: 1rem;
      width: 200px;
      margin-right: 10px;
      font-family: 'Inter', sans-serif;
      background: var(--bg-card);
      color: var(--text-primary);
    `;
      
    // Replace button with input field
    const parent = searchBtn.parentElement;
    parent.insertBefore(searchInput, searchBtn);
    searchInput.focus();
    searchBtn.style.display = 'none';
    
    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        alert(`Searching for: "${searchInput.value}"`);
      }
    });
      
    searchInput.addEventListener('blur', function() {
      if (searchInput.value.trim() === '') {
        parent.removeChild(searchInput);
        searchBtn.style.display = 'inline-block';
      }
    });
  }







    
  // Request button functionality
  const requestBtn = document.querySelector('.request-btn');
  if (requestBtn) {
    requestBtn.addEventListener('click', function() {
      alert('Request feature: This would open a request form in a real implementation.');
    });
  }






  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 70,
          behavior: 'smooth'
        });
      }
    });
  });







    
  // Add hover effect to category and feature cards
  const cards = document.querySelectorAll('.category-card, .feature-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
    });
  });
    








  // Print functionality
  window.addEventListener('beforeprint', function() {
    console.log('Printing page...');
  });
  



  // not yet functional
  // Account type selection for signup page
  const accountTypeButtons = document.querySelectorAll('.account-type-btn');
  accountTypeButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remove active class from all buttons
      accountTypeButtons.forEach(btn => btn.classList.remove('active'));
      // Add active class to clicked button
      this.classList.add('active');
    });
  });
  







  // Form submission handlers not yet functional
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      // Here you would normally send the data to a server
      alert('Login functionality would be implemented here!');
    });
  }
  
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const activeType = document.querySelector('.account-type-btn.active');
      const accountType = activeType ? activeType.getAttribute('data-type') : 'student';
      alert(`Signup functionality would be implemented here! Account type: ${accountType}`);
    });
  }
});