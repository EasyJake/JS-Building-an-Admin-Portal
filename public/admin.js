async function main() {
    // Fetch list of books from the server
    let response = await fetch('http://localhost:3001/listBooks');
    let books = await response.json();

    // For each book, we'll render a form
    books.forEach(renderBookForm);
}

function renderBookForm(book) {
    let bookForm = document.querySelector('.container');

    // Create list item for each book title
    let bookLi = document.createElement("li");
    bookLi.textContent = book.title;

    // Create input for book quantity
    let bookQuantity = document.createElement("input");
    bookQuantity.value = book.quantity;

    // Add quantity input to the list item
    bookLi.append(bookQuantity);

    // Create save button
    let saveButton = document.createElement('button');
    saveButton.textContent = 'SAVE';

    // When save is clicked, update quantity on the server
    saveButton.addEventListener('click', () => {
        fetch('http://localhost:3001/updateBook', {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                id: book.id, 
                quantity: bookQuantity.value // Updated quantity
            })
        });
    });

    // Add save button to list item
    bookLi.append(saveButton);

    // Add list item to the main form container
    bookForm.append(bookLi);
}

// Start the application
main();
