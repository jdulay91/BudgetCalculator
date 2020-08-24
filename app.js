//MODULE PATTERN IMMEDIATELY INVOKED FUNCTION EXPRESSION
//ANON FUNCTION WRAPPED IN PARENTHESES
//Creates a new scope that is not visibile to the outside scope and will return an object that contains a method that will be accessible to the outside scope
//Separation of Concerns means each part of the application does things independently

/////////////////////BUDGET CONTROLLER////////////////////////////////
////////////////////Does mathematical operations on the Data/////////

const budgetController = (() => {
	const Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function (totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	const Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	const data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	const calculateTotal = (type) => {
		let sum = 0;
		data.allItems[type].forEach((d) => {
			sum += d.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem: function (type, desc, val) {
			//variable declarations
			let newItem, ID;

			//creates new ID for the object
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			//creates an item based on the type (if it is expense or income)
			if (type === 'exp') {
				newItem = new Expense(ID, desc, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, desc, val);
			}

			//Pushes new item on the corect array in our data structure
			data.allItems[type].push(newItem);

			//returns new elements
			return newItem;
		},
		deleteItem: function (type, id) {
			let ids, index;

			ids = data.allItems[type].map((item) => {
				return item.id;
			});

			index = ids.indexOf(id);
			console.log(ids, id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function () {
			calculateTotal('exp');
			calculateTotal('inc');

			data.budget = data.totals.inc - data.totals.exp;
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		getBudget: function () {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		calculatePercentage: function () {
			data.allItems.exp.forEach((item) => {
				item.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function () {
			const allPercentages = data.allItems.exp.map((item) => {
				return item.getPercentage();
			});
			return allPercentages;
		},

		testing: function () {
			console.log(data);
		}
	};
})();

////////////////// User Interface CONTROLLER////////////////////////////////////////
//////////////////Controls what reflects on the DOM what the USER can see///////////
const UIController = (() => {
	const DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercentageLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	const formatNumber = function (num, type) {
		let numSplit, int, dec;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');
		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
		}
		dec = numSplit[1];

		return (type === 'exp' ? (sign = '-') : (sign = '+')) + ' ' + int + '.' + dec;
	};

	return {
		getinput: function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function (obj, type) {
			let html, newHtml, element;

			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
				html =
					'<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				html =
					'<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function (selectorID) {
			let element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},

		resetField: function () {
			let fieldsArray = Array.from(document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue));

			fieldsArray.forEach((element) => {
				element.value = '';
			});

			fieldsArray[0].focus();
		},

		displayBudget: function (obj) {
			let type;
			obj.budget > 0 ? (type = 'inc') : (type = 'exp');

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function (percentages) {
			const fields = Array.from(document.querySelectorAll(DOMstrings.expensesPercentageLabel));
			fields.forEach((field, i) => {
				if (percentages[i] > 0) {
					field.textContent = percentages[i] + '%';
				} else {
					field.textContent = '---';
				}
			});
		},

		displayDate: function () {
			let now, year, month, months;

			now = new Date();
			year = now.getFullYear();
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},
		changedType: function () {
			let fields = Array.from(
				document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue)
			);

			fields.forEach((field) => {
				field.classList.toggle('red-focus');
			});

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstrings: () => {
			return DOMstrings;
		}
	};
})();

/////////////////// GLOBAL APPLICATION CONTROLLER///////////////////////
//////////////////Links both UI AND BUDGET controllers ////////////////
const AppControler = ((budgetCtrl, UICtrl) => {
	const DOMstrings = UICtrl.getDOMstrings();

	const setEventListeners = () => {
		///Click Event
		document.querySelector(DOMstrings.inputBtn).addEventListener('click', addItem);

		// Key Event
		document.addEventListener('keypress', (e) => {
			if (e.keyCode === 13 || e.which === 13) {
				addItem();
			}
		});

		//Delete event
		document.querySelector(DOMstrings.container).addEventListener('click', deleteItem);

		//Change event
		document.querySelector(DOMstrings.inputType).addEventListener('change', UICtrl.changedType);
	};

	const updatePercentage = () => {
		//Does calculations on Data
		budgetCtrl.calculatePercentage();
		let percentages = budgetCtrl.getPercentages();

		//Does changes on UI/DOM manipulation
		UICtrl.displayPercentages(percentages);
	};

	const updateBudget = () => {
		budgetCtrl.calculateBudget();
		const budget = budgetCtrl.getBudget();
		UICtrl.displayBudget(budget);
	};

	const addItem = () => {
		//gets input data
		const input = UICtrl.getinput();

		if (input.description.trim() !== '' && input.value !== NaN && input.value > 0) {
			//adds items to the budget controller
			const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			//passes new item created to DOM
			UICtrl.addListItem(newItem, input.type);

			//reset field to empty
			UICtrl.resetField();

			//calculates and updates budget
			updateBudget();

			//Updates Percentages
			updatePercentage();
		}
	};

	const deleteItem = (e) => {
		let itemID, splitID, type, ID;

		itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {
			//(gets TYPE and ID) Type Income or Expense, then ID of the element to delete the correct element
			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			//deletes item from data
			budgetCtrl.deleteItem(type, ID);

			//deletes item from DOM
			UICtrl.deleteListItem(itemID);

			//Updates budget
			updateBudget();

			//Updates percentage
			updatePercentage();
		}
	};

	return {
		init: () => {
			console.log('app started');
			setEventListeners();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: 0
			});
			UICtrl.displayDate();
		}
	};
})(budgetController, UIController);

AppControler.init();
