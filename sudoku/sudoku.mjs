function* range(start, end, step) {
    if (!step) {
        step = (end - start > 0) ? 1 : -1;
    }
    for (let i = start; (step > 0) ? i < end : i > end; i += step) {
        yield i;
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

export default class SudokuGame extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({
			mode: 'open'
		});

		this.current_number = 1;
		this.current_mode = 0; // 0 = insert, 1 = note, 2 = Erase

		this.stats = [0, 0, 0, 0, 0, 0, 0, 0, 0]; // How many of each number have been filled in.
	}
	connectedCallback() {
		const contents = `
			<link rel="stylesheet" href="./sudoku.css"></style>
			<header>
				<h1>Sudoku</h1>
			</header>
			<table>
				<tbody>
					${`<tr>
						${`<td tabindex="-1"></td>`.repeat(9)}
					</tr>`.repeat(9)}
				</tbody>
			</table>
			<span class="num-container">
				${Array.from(range(1, 10)).map(i => 
					`<button data-count="0" ${i == this.current_number ? 'class="active-number"' : ''}>${i}</button>`
				).join('')}
			</span>
		`;
		this.shadowRoot.innerHTML = contents;
		// Placing numbers
		const table = this.shadowRoot.querySelector('table');
		table.addEventListener('click', ({target}) => {
			if (target.matches('td:not(.original)')) {
				const current_value = (target.innerText == '') ? false : Number(target.innerText);
				if (this.current_mode == 0) {
					// Edit Mode:
					if (this.current_number == current_value) {
						target.innerText = '';
						this.update_stats(this.current_number, -1);
					} else {
						target.innerText = this.current_number;
						this.update_stats(this.current_number, +1);
					}
					target.classList.remove('note');
				} else {
					// Note Mode:
					const existing = target.innerText.split(' ').filter(x => x != '').map(x => Number(x));
					const old_index = existing.indexOf(this.current_number);
					if (old_index == -1) {
						existing.push(this.current_number);
						existing.sort((a, b) => a - b);
					} else {
						existing.splice(old_index, 1);
					}
					target.innerText = existing.join(' ');
					target.classList.add('note');
				}
			}
		});
		// Changing active number
		const num_container = this.shadowRoot.querySelector('.num-container');
		this.num_container = num_container;
		num_container.addEventListener('click', ({target}) => {
			if (target.matches('button')) {
				const mode_names = ['edit', 'note'];
				const value = Number(target.innerText);
				if (this.current_number == value) {
					// Change mode instead of changing number:
					target.classList.remove(mode_names[this.current_mode]);
					this.current_mode = (this.current_mode + 1) % mode_names.length;
					target.classList.add(mode_names[this.current_mode]);
				} else {
					this.current_number = value
					const mode = mode_names[this.current_mode];
					const previous = num_container.querySelector('.active-number');
					previous.classList.remove('active-number', mode);
					target.classList.add('active-number', mode);
				}
			}
		});
	}
	update_stats(number, amount) {
		this.stats[number - 1] += amount;
		this.num_container.children[number - 1].dataset['count'] = this.stats[number - 1];
	}
	load_puzzle(arr) {
		const table = this.shadowRoot.querySelector('table');
		for (let i of range(0, (9*9))) {
			const [r, c] = i2rc(i);
			const item = arr[i];
			const el = table.rows[r].cells[c];
			if (item) {
				this.update_stats(item, +1);
				el.innerText = item;
				// Mark the original numbers so that they can't be erased later on:
				el.classList.add('original');
			}
		}
	}

	disconnectedCallback() {
		
	}

	// attributeChangedCallback(name, oldValue, newValue) {
		
	// }
}
customElements.define('sudoku-game', SudokuGame);