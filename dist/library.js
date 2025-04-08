document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const enterButton = document.querySelector('.enter');
  const pageContent = document.querySelector('.page');
  const addForm = document.getElementById('add-record-form');
  const categoryFilter = document.getElementById('data-category');
  const archiveGrid = document.getElementById('archive-grid');

  // Initial Books Data
  const initialBooks = [
    {
      id: Date.now(),
      title: "Beyond Good and Evil",
      category: "Philosophy",
      author: "Friedrich Nietzsche",
      publisher: "",
      isbn: "",
      year: "1886"
    },
    {
      id: Date.now() + 1,
      title: "Thus Spoke Zarathustra",
      category: "Philosophy",
      author: "Friedrich Nietzsche",
      publisher: "",
      isbn: "",
      year: ""
    },
    {
      id: Date.now() + 2,
      title: "Michel Kohlhaas",
      category: "Fiction",
      author: "Heinrich von Kleist",
      publisher: "",
      isbn: "",
      year: ""
    },
    {
      id: Date.now() + 3,
      title: "Before the Law",
      category: "Fiction",
      author: "Franz Kafka",
      publisher: "",
      isbn: "",
      year: ""
    }
  ];

  // Initialize the app
  function init() {
    setupWelcomeButton();
    loadBooks();
    setupEventListeners();
  }

  // Welcome Button Functionality
  function setupWelcomeButton() {
    if (!enterButton || !pageContent) {
      console.error('Critical elements not found!');
      return;
    }

    enterButton.addEventListener('click', function(event) {
      event.preventDefault();
      enterButton.style.display = 'none';
      pageContent.style.display = 'block';
      setTimeout(() => {
        pageContent.style.opacity = '1';
      }, 50);
    });
  }

  // Book Data Management
  function loadBooks() {
    try {
      let savedBooks = localStorage.getItem('libraryBooks');
      if (!savedBooks) {
        localStorage.setItem('libraryBooks', JSON.stringify(initialBooks));
        savedBooks = localStorage.getItem('libraryBooks');
      }
      renderBooks(JSON.parse(savedBooks));
    } catch (error) {
      console.error('Error loading books:', error);
      renderBooks(initialBooks);
    }
  }

  function saveBooks() {
    try {
      const books = Array.from(document.querySelectorAll('.archive-record')).map(record => ({
        id: record.dataset.id,
        title: record.querySelector('.book-title').textContent,
        category: record.querySelector('.category-select').value,
        author: record.querySelector('.author-input').value,
        publisher: record.querySelector('.publisher-input').value,
        isbn: record.querySelector('.isbn-input').value,
        year: record.querySelector('.year-input').value
      }));
      localStorage.setItem('libraryBooks', JSON.stringify(books));
    } catch (error) {
      console.error('Error saving books:', error);
    }
  }

document.addEventListener('DOMContentLoaded', () => {
  const archiveRecords = document.querySelectorAll('.archive-record');

  archiveRecords.forEach(record => {
    record.addEventListener('click', (event) => {
      if (
        event.target.matches('[contenteditable="true"]') ||
        event.target.matches('input') ||
        event.target.matches('select')
      ) {
        return;
      }

      // Toggle the 'active' class on the clicked record
      record.classList.toggle('active');
    });
  });
});


  // Book Rendering
  function renderBooks(books) {
    if (!archiveGrid) return;

    archiveGrid.innerHTML = books.length ? '' : 
      '<p class="empty-message">Your library is empty. Add some books!</p>';

    books.forEach(book => {
      archiveGrid.appendChild(createBookElement(book));
    });
  }

  function createBookElement(book) {
    const bookElement = document.createElement('div');
    bookElement.className = 'archive-record';
    bookElement.dataset.category = book.category;
    bookElement.dataset.id = book.id;
    
    bookElement.innerHTML = `
      <div class="book-main">
        <span class="book-title" contenteditable="true">${book.title}</span>
        <button class="delete-btn" aria-label="Delete book">×</button>
      </div>
      <div class="book-details">
        ${createDetailRow('Category:', createCategorySelect(book.category))}
        ${createDetailRow('Author:', `<input type="text" value="${book.author || ''}" class="author-input">`)}
        ${createDetailRow('Publisher:', `<input type="text" value="${book.publisher || ''}" class="publisher-input">`)}
        ${createDetailRow('ISBN:', `<input type="text" value="${book.isbn || ''}" class="isbn-input" pattern="[0-9\-]+">`)}
        ${createDetailRow('Year:', `<input type="text" value="${book.year || ''}" class="year-input" pattern="[0-9]{4}">`)}
      </div>
    `;
    
    return bookElement;
  }

  function createCategorySelect(selectedCategory) {
    const categories = ['Fiction', 'Theory', 'Art', 'Philosophy', 'Poetry', 'Other'];
    return `
      <select class="category-select">
        ${categories.map(opt => 
          `<option value="${opt}" ${selectedCategory === opt ? 'selected' : ''}>${opt}</option>`
        ).join('')}
      </select>
    `;
  }

  function createDetailRow(label, input) {
    return `
      <div class="detail-row">
        <label>${label}</label>
        ${input}
      </div>
    `;
  }

  // Event Handlers
  function setupEventListeners() {
    if (addForm) addForm.addEventListener('submit', handleAddBook);
    if (categoryFilter) categoryFilter.addEventListener('change', filterBooks);
    
    if (archiveGrid) {
      archiveGrid.addEventListener('click', handleArchiveGridClick);
      archiveGrid.addEventListener('blur', handleArchiveGridBlur, true);
    }
  }

  function handleArchiveGridClick(e) {
    // Prevent toggling if the click is on an editable element
    if (
      e.target.matches('[contenteditable="true"]') ||
      e.target.matches('input') ||
      e.target.matches('select')
    ) {
      return; // Exit the function if the click is on an editable element
    }
  
    // Handle delete button click
    if (e.target.classList.contains('delete-btn')) {
      handleDeleteBook(e.target.closest('.archive-record'));
      return;
    }
  
    // Toggle the 'active' class for the clicked record
    const clickedRecord = e.target.closest('.archive-record');
    if (clickedRecord) {
      document.querySelectorAll('.archive-record').forEach(record => {
        record.classList.toggle('active', record === clickedRecord && !record.classList.contains('active'));
      });
    }
  }

  function handleArchiveGridBlur(e) {
    if (e.target.matches('[contenteditable="true"], input, select')) {
      saveBooks();
    }
  }

  function handleAddBook(e) {
    e.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const category = document.getElementById('book-category').value;

    if (!title) {
      alert('Please enter a book title');
      return;
    }

    try {
      const currentBooks = JSON.parse(localStorage.getItem('libraryBooks')) || [];
      const newBook = {
        id: Date.now(),
        title,
        category,
        author: '',
        publisher: '',
        isbn: '',
        year: ''
      };
      
      currentBooks.push(newBook);
      localStorage.setItem('libraryBooks', JSON.stringify(currentBooks));
      renderBooks(currentBooks);
      addForm.reset();
    } catch (error) {
      console.error('Error adding book:', error);
      alert('Failed to add book. Please try again.');
    }
  }

  function handleDeleteBook(bookElement) {
    if (!confirm('Are you sure you want to delete this book?')) return;
    
    try {
      const bookId = bookElement.dataset.id;
      const currentBooks = JSON.parse(localStorage.getItem('libraryBooks'))
        .filter(book => book.id.toString() !== bookId);
      
      localStorage.setItem('libraryBooks', JSON.stringify(currentBooks));
      renderBooks(currentBooks);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  }

  function filterBooks() {
    const category = this.value;
    document.querySelectorAll('.archive-record').forEach(record => {
      record.style.display = (category === 'All' || record.dataset.category === category) 
        ? '' 
        : 'none';
    });
  }

  // Start the app
  init();
});