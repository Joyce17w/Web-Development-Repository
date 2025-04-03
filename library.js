document.addEventListener('DOMContentLoaded', function() {
  const archiveGrid = document.getElementById('archive-grid');
  const addForm = document.getElementById('add-record-form');
  const categoryFilter = document.getElementById('data-category');

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

  document.querySelector('.welcome-button').addEventListener('click', function() {
    document.body.classList.add('revealed');
    setTimeout(() => {
      this.style.display = 'none';
    }, 1000);
  });


  function loadBooks() {
    let savedBooks = localStorage.getItem('libraryBooks');
    if (!savedBooks) {
      localStorage.setItem('libraryBooks', JSON.stringify(initialBooks));
      savedBooks = localStorage.getItem('libraryBooks');
    }
    renderBooks(JSON.parse(savedBooks));
  }

  function renderBooks(books) {
    archiveGrid.innerHTML = '';
    books.forEach(book => {
      const bookElement = document.createElement('div');
      bookElement.className = 'archive-record';
      bookElement.dataset.category = book.category;
      bookElement.dataset.id = book.id;
      
      bookElement.innerHTML = `
        <div class="book-main">
          <span class="book-title" contenteditable="true">${book.title}</span>
          <button class="delete-btn">×</button>
        </div>
        <div class="book-details">
          <div class="detail-row">
            <label>Category:</label>
            <select class="category-select">
              <option value="Fiction" ${book.category === 'Fiction' ? 'selected' : ''}>Fiction</option>
              <option value="Theory" ${book.category === 'Theory' ? 'selected' : ''}>Theory</option>
              <option value="Art" ${book.category === 'Art' ? 'selected' : ''}>Art Books</option>
              <option value="Philosophy" ${book.category === 'Philosophy' ? 'selected' : ''}>Philosophy</option>
              <option value="Poetry" ${book.category === 'Poetry' ? 'selected' : ''}>Poetry</option>
            </select>
          </div>
          <div class="detail-row">
            <label>Author:</label>
            <input type="text" value="${book.author || ''}" class="author-input">
          </div>
          <div class="detail-row">
            <label>Publisher:</label>
            <input type="text" value="${book.publisher || ''}" class="publisher-input">
          </div>
          <div class="detail-row">
            <label>ISBN:</label>
            <input type="text" value="${book.isbn || ''}" class="isbn-input">
          </div>
          <div class="detail-row">
            <label>Year:</label>
            <input type="text" value="${book.year || ''}" class="year-input">
          </div>
        </div>
      `;

      const deleteBtn = bookElement.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', function() {
        if (confirm('Delete this book?')) {
          bookElement.remove();
          saveBooks();
        }
      });

      const editableElements = bookElement.querySelectorAll('[contenteditable="true"], input, select');
      editableElements.forEach(el => {
        el.addEventListener('blur', function() {
          // Update category data attribute when changed
          if (el.classList.contains('category-select')) {
            bookElement.dataset.category = el.value;
          }
          saveBooks();
        });
      });

      const titleElement = bookElement.querySelector('.book-title');
      titleElement.addEventListener('click', function(e) {
        if (e.target.contentEditable !== 'true') {
          bookElement.classList.toggle('editing');
        }
      });

      archiveGrid.appendChild(bookElement);
    });
  }

  function saveBooks() {
    const books = [];
    document.querySelectorAll('.archive-record').forEach(record => {
      books.push({
        id: record.dataset.id,
        title: record.querySelector('.book-title').textContent,
        category: record.querySelector('.category-select').value,
        author: record.querySelector('.author-input').value,
        publisher: record.querySelector('.publisher-input').value,
        isbn: record.querySelector('.isbn-input').value,
        year: record.querySelector('.year-input').value
      });
    });
    localStorage.setItem('libraryBooks', JSON.stringify(books));
  }

  addForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('book-title').value.trim();
    const category = document.getElementById('book-category').value;
    
    if (!title) {
      alert('Please enter a book title');
      return;
    }
    
    const newBook = {
      id: Date.now(),
      title,
      category,
      author: '',
      publisher: '',
      isbn: '',
      year: ''
    };
    
    const currentBooks = JSON.parse(localStorage.getItem('libraryBooks'));
    currentBooks.push(newBook);
    localStorage.setItem('libraryBooks', JSON.stringify(currentBooks));
    renderBooks(currentBooks);
    addForm.reset();
  });

  categoryFilter.addEventListener('change', function() {
    const category = this.value;
    document.querySelectorAll('.archive-record').forEach(record => {
      record.style.display = (category === 'All' || record.dataset.category === category) ? '' : 'none';
    });
  });

  loadBooks();
});