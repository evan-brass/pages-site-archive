function* range(start, end, step) {
    if (!step) {
        step = (end - start > 0) ? 1 : -1;
    }
    for (let i = start; (step > 0) ? i < end : i > end; i += step) {
        yield i;
    }
}

const _ = 0;
const puzzle = [
	5, 3, _,  _, 7, _,  _, _, _,
	6, _, _,  1, 9, 5,  _, _, _,
	_, 9, 8,  _, _, _,  _, 6, _,

	8, _, _,  _, 6, _,  _, _, 3,
	4, _, _,  8, _, 3,  _, _, 1,
	7, _, _,  _, 2, _,  _, _, 6,
	
	_, 6, _,  _, _, _,  2, 8, _,
	_, _, _,  4, 1, 9,  _, _, 5,
	_, _, _,  _, 8, _,  _, 7, 9
];

// This just calls the function with the item and the index
function iter_cell(board, func) {
	for (let i = 0; i < (9*9); ++i) {
		func(board[i], i);
	}
}

// Move between index and row / column coordinates
function i2rc(index) {
	return [
		Math.floor(index / 9),
		index % 9
	];
}
function rc2i(row, column) {
	return 9 * row + column;
}

// Build a table with the right number of rows and columns.  No need to store references because I can index into the table using dom apis.
function build_table() {
	const table = document.createElement('table');
	const body = document.createElement('tbody');
	table.appendChild(body);
	for (let _ of range(0, 9)) {
		const row = document.createElement('tr');
		for (let _ of range(0, 9)) {
			const cell = document.createElement('td');
			cell.setAttribute('tabindex', '-1');
			row.appendChild(cell);
		}
		body.appendChild(row);
	}
	return table;
}

// Initialize the sudoku game:
// Initialize the solver's view of the sudoku puzzle:
const board = Array.from(puzzle);

// Initialize the player's view of the sudoku puzzle:
const table = build_table();

// Initialize 
for (let i of range(0, (9*9))) {
	const [r, c] = i2rc(i);
	const item = board[i];
	const el = table.rows[r].cells[c];
	if (item) {
		el.innerText = item;
		// Mark the original numbers so that they can't be erased later on:
		el.classList.add('original');
	}
}

// Editing state:
let current_number = 1;

// Buttons for selecting which number to enter:
const buttons_container = document.createElement('div');
buttons_container.classList.add('num-container');
const num_select_buttons = Array.from(range(1, 10)).map(num => {
	const button = document.createElement('button');
	if (num == current_number) {
		button.classList.add('active-number');
	}
	button.innerText = num;
	button.addEventListener('click', _ => {
		num_select_buttons[current_number - 1].classList.remove('active-number');
		button.classList.add('active-number');
		current_number = num;
	});
	buttons_container.appendChild(button);
	return button;
});

// Actually placing numbers into the table:
table.addEventListener('click', ({target}) => {
	if (target.matches('td:not(.original)')) {
		target.innerText = current_number;
	}
});

// Output + styles:
document.body.appendChild(table);
document.body.appendChild(buttons_container);