// Review Submission Form
document.addEventListener('DOMContentLoaded', function() {
    // Star Rating
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('rating');
    
    if (stars && ratingInput) {
      stars.forEach(star => {
        star.addEventListener('click', function() {
          const value = this.getAttribute('data-value');
          ratingInput.value = value;
          
          stars.forEach(s => {
            s.classList.remove('active');
            if (s.getAttribute('data-value') <= value) {
              s.classList.add('active');
            }
          });
        });
      });
    }
    
    // Review Form Submission
    const reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
      reviewForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        try {
          const response = await fetch('/api/reviews', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            alert('Thank you for your review!');
            window.location.href = '/archive';
          } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
          }
        } catch (err) {
          alert('An error occurred. Please try again.');
          console.error(err);
        }
      });
    }
    
    // Recommendation Quiz
    const quizForm = document.getElementById('recommendForm');
    if (quizForm) {
      const steps = document.querySelectorAll('.quiz-step');
      let currentStep = 0;
      
      // Show first step
      steps[currentStep].classList.add('active');
      
      // Next button
      document.querySelectorAll('.next-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const currentStepEl = steps[currentStep];
          const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
          let isValid = true;
          
          inputs.forEach(input => {
            if (!input.value) {
              isValid = false;
              input.classList.add('error');
            } else {
              input.classList.remove('error');
            }
          });
          
          if (isValid) {
            currentStepEl.classList.remove('active');
            currentStep++;
            steps[currentStep].classList.add('active');
          }
        });
      });
      
      // Previous button
      document.querySelectorAll('.prev-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          steps[currentStep].classList.remove('active');
          currentStep--;
          steps[currentStep].classList.add('active');
        });
      });
      
      // Form submission
      quizForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        try {
          const response = await fetch('/api/recommend', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            const recommendations = await response.json();
            displayRecommendations(recommendations);
          } else {
            const error = await response.json();
            alert(`Error: ${error.error}`);
          }
        } catch (err) {
          alert('An error occurred. Please try again.');
          console.error(err);
        }
      });
    }
    
    // Archive Filtering
    const searchInput = document.getElementById('searchInput');
    const genreFilter = document.getElementById('genreFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    
    if (searchInput || genreFilter || ratingFilter) {
      function filterBooks() {
        const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
        const genreValue = genreFilter ? genreFilter.value : '';
        const ratingValue = ratingFilter ? ratingFilter.value : '';
        
        document.querySelectorAll('.book-card').forEach(card => {
          const title = card.querySelector('h3').textContent.toLowerCase();
          const author = card.querySelector('.author').textContent.toLowerCase();
          const genre = card.getAttribute('data-genre');
          const rating = card.getAttribute('data-rating');
          
          const matchesSearch = searchTerm === '' || 
            title.includes(searchTerm) || 
            author.includes(searchTerm);
          
          const matchesGenre = genreValue === '' || genre === genreValue;
          const matchesRating = ratingValue === '' || 
            (ratingValue === '5' && rating === '5') ||
            (ratingValue === '4' && rating === '4') ||
            (ratingValue === '3' && rating === '3') ||
            (ratingValue === '2' && rating === '2') ||
            (ratingValue === '1' && rating === '1');
          
          if (matchesSearch && matchesGenre && matchesRating) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      }
      
      if (searchInput) searchInput.addEventListener('input', filterBooks);
      if (genreFilter) genreFilter.addEventListener('change', filterBooks);
      if (ratingFilter) ratingFilter.addEventListener('change', filterBooks);
    }
  });
  
  function displayRecommendations(recommendations) {
    const container = document.getElementById('recommendations');
    const grid = document.getElementById('recommendationsGrid');
    
    if (!container || !grid) return;
    
    // Clear previous recommendations
    grid.innerHTML = '';
    
    if (recommendations.length === 0) {
      grid.innerHTML = '<p>No recommendations found. Try adjusting your preferences.</p>';
    } else {
      recommendations.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        
        card.innerHTML = `
          <div class="book-cover">
            <div class="book-spine"></div>
            <h3>${book.title}</h3>
            <p class="author">by ${book.author}</p>
            <div class="rating">
              ${'★'.repeat(book.rating)}${'☆'.repeat(5 - book.rating)}
            </div>
          </div>
          <div class="book-info">
            <p class="genre">${book.genre}</p>
            <a href="/book/${book._id}" class="btn">Read Review</a>
          </div>
        `;
        
        grid.appendChild(card);
      });
    }
    
    // Hide form and show recommendations
    document.getElementById('recommendForm').style.display = 'none';
    container.style.display = 'block';
  }