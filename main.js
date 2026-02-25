const transformMatrix = [
	[1, 0, 0],
	[0, 1, 0],
	[0, 0, 1]
];

let showingNumbers = false;

class ColorVector {
	constructor(hexString="#ff00ff") {
		this.hex = hexString;
	}
	get hex() { return this._hex; }
	set hex(hexString) {
		this._hex = hexString;
		this._red = Number(`0x${redByteInHex(hexString)}`);
		this._green = Number(`0x${greenByteInHex(hexString)}`);
		this._blue = Number(`0x${blueByteInHex(hexString)}`);
	}
	// TODO: check types passed to setters.
	get red() { return this._red; }
	set red(value) {
		this._red = Math.min(value, 255);
		this.updateHex();
	}
	get green() { return this._green; }
	set green(value) {
		this._green = Math.min(value, 255);
		this.updateHex();
	}
	get blue() { return this._blue; }
	set blue(value) {
		this._blue = Math.min(value, 255);
		this.updateHex();
	}

	getComponent(index) {
		switch (index) {
		case (0):
			return this.red;
		case (1):
			return this.green;
		case (2):
			return this.blue;
		default:
			throw new Error("Invalid color index passed to ColorVector.component getter.");
		}
	}
	setComponent(index, value) {
		switch (index) {
		case (0):
			this.red = value;
			break;
		case (1):
			this.green = value;
			break;
		case (2):
			this.blue = value;
			break;
		default:
			throw new Error("Invalid color index passed to ColorVector.component setter.");
		}
		this.updateHex();
	}
	updateHex() {
		this._hex = "#" +
			Math.round(this._red).toString(16).padStart(2, "0") +
			Math.round(this._green).toString(16).padStart(2, "0") +
			Math.round(this._blue).toString(16).padStart(2, "0");
	}
}

// transformColor(color: ColorVector, matrix: Array[3, 3])
function transformColor(color, matrix) {
	// TODO: check sizes.
	let ret = new ColorVector()
	for (let row = 0; row < matrix.length; row++) {
		let value = 0;
		for (let column = 0; column < matrix[row].length; column++) {
			value += matrix[row][column]*color.getComponent(column);
		}
		ret.setComponent(row, value);
	}
	return ret;
}
// redByteInHex(hex: string);
function redByteInHex(hex) {
	const topNibbleIndex = 1;
	const bottomNibbleIndex = 2;
	return hex.at(topNibbleIndex) + hex.at(bottomNibbleIndex);
}
function greenByteInHex(hex) {
	const topNibbleIndex = 3;
	const bottomNibbleIndex = 4;
	return hex.at(topNibbleIndex) + hex.at(bottomNibbleIndex);
}
function blueByteInHex(hex) {
	const topNibbleIndex = 5;
	const bottomNibbleIndex = 6;
	return hex.at(topNibbleIndex) + hex.at(bottomNibbleIndex);
}

function updateMatrixNumbers() {
	const numbers = document.querySelectorAll("#matrixTable mn.number");
	if (numbers.length != 9)
		throw new Error("Failed to get all the matrix number elements.");
	for (let row = 0; row < 3; row++) {
		for (let column = 0; column < 3; column++) {
			numbers[row*3 + column].textContent = transformMatrix[row][column];
		}
	}
}

// Takes document.getElementById(#inputRow | #outputRow) color: string)
function updateVectorColors(vectorMRow, color) {
	vectorMRow.style.setProperty("color", color);
	const components = vectorMRow.querySelectorAll("mtd");
	const red = components[0];
	red.style.setProperty("color", `#${redByteInHex(color)}0000`);
	const green = components[1];
	green.style.setProperty("color", `#00${greenByteInHex(color)}00`);
	const blue = components[2];
	blue.style.setProperty("color", `#0000${blueByteInHex(color)}`);
}

// Accepts a hex color string from colorPicker.value
function updateInputVectorColors() {
	const picker = document.getElementById("colorPicker");
	updateVectorColors(document.getElementById("inputRow"), picker.value);
}

function updateInputVectorNumbers() {
	const picker = document.getElementById("colorPicker");
	const inputNumbers = document.querySelectorAll("#inputTable mn.number");
	const colorVec = new ColorVector(picker.value);
	let i = 0;
	for (let number of inputNumbers)
		number.textContent = colorVec.getComponent(i++);
}

function updateOutputVectorColors() {
	const picker = document.getElementById("colorPicker");
	const colorVec = new ColorVector(picker.value);
	const transformedVec = transformColor(colorVec, transformMatrix);
	updateVectorColors(document.getElementById("outputRow"), transformedVec.hex);
}

function updateOutputVectorNumbers() {
	const picker = document.getElementById("colorPicker");
	const colorVec = new ColorVector(picker.value);
	const transformedVec = transformColor(colorVec, transformMatrix);
	const outputNumbers = document.querySelectorAll("#outputTable mn.number");
	if (outputNumbers.length != 3)
		throw new Error("Failed to get output numbers.");
	let i = 0;
	for (let number of outputNumbers)
		number.textContent = Math.round(transformedVec.getComponent(i++));
}

function updateSwatchColors() {
	const inputSwatch = document.getElementById("inputSwatch");
	const picker = document.getElementById("colorPicker");
	inputSwatch.style.setProperty("fill", picker.value);
	const inputVector = new ColorVector(picker.value);
	const outputSwatch = document.getElementById("outputSwatch");
	const transformedVec = transformColor(inputVector, transformMatrix);
	console.log("updateing output swatch");
	console.log(inputVector);
	console.log(transformMatrix);
	console.log(transformedVec);
	outputSwatch.style.setProperty("fill", transformedVec.hex);
}
function animateExplainer() {
	console.log("stub");
}

function openInputPage() {
	// TODO: Animate.
	// document.getElementById("inputPage")
	// 	.style.setProperty("visibility", "visible");
	document.getElementById("inputPage")
		.style.setProperty("opacity", 1);
	document.getElementById("inputPage")
		.style.setProperty("pointer-events", "all");
}

function closeInputPage() {
	document.getElementById("inputPage")
		.style.setProperty("opacity", 0);
	document.getElementById("inputPage")
		.style.setProperty("pointer-events", "none");
	readTransformInputs();
}

function readTransformInputs() {
	for (let row = 0; row < 3; row++) {
		for (let column = 0; column < 3; column++) {
			transformMatrix[row][column] = readInput(row, column);
		}
	}
	updateMatrixNumbers();
}

function readInput(row, column) {
	if ((row < 0 || row > 2))
		throw new Error("row passed to readInput() out of range.");
	if ((column < 0) || (column > 2))
		throw new Error("column passed to readInput() out of range.");
	const inputPage = document.getElementById("inputPage");
	const inputs = inputPage.querySelectorAll("input")
	return Number(inputs[column+3*row].value);
}

function connectInputsToUpdates() {
	const inputs = document.querySelectorAll("#inputPage input");
	const picker = document.getElementById("colorPicker")
	for (const input of inputs) {
		input.addEventListener("change", () => {
			// TODO: Optimize by reading just the input that changed.
			readTransformInputs();
			updateOutputVectorColors();
			updateOutputVectorNumbers();
			updateSwatchColors();
		});
	}
}


let matrixTable = document.getElementById("matrixTable");
let cover = document.getElementById("cover");
let keyFrames = [
	{}
]

function connectColorPicker() {
	const picker = document.getElementById("colorPicker");
	document.getElementById("inputRow").addEventListener("click", () => {
		
		picker.showPicker();
	});
	picker.addEventListener("input", () => {
		console.log("picked")
		updateInputVectorColors();
		updateInputVectorNumbers();
		updateOutputVectorColors();
		updateOutputVectorNumbers();
		updateSwatchColors();
	});
}


function connectInputPageOpenClose() {
	document.getElementById("matrixRow")
		.addEventListener("click", openInputPage);
	document.getElementById("closeInputPageButton")
		.addEventListener("click", closeInputPage);
	// TODO: connect esc and back button to close.
}

function connectToggleView() {
	document.getElementById("toggleView").addEventListener("click", () => {
		if (showingNumbers) {
			variableView();
		}
		else {
			numericView();
		}
		showingNumbers =  !showingNumbers;
	});
}

function numericView() {
	const variables = document.querySelectorAll(".variable");
	for (const variable of variables)
		variable.style.setProperty("display", "none");
	const numbers = document.querySelectorAll(".number");
	for (const number of numbers)
		number.style.setProperty("display", "inline");
}

function variableView() {
	const variables = document.querySelectorAll(".variable");
	for (const variable of variables)
		variable.style.setProperty("display", "inline");
	const numbers = document.querySelectorAll(".number");
	for (const number of numbers)
		number.style.setProperty("display", "none");
}

function logicInit() {
	variableView();
	readTransformInputs();
	updateInputVectorColors();
	updateInputVectorNumbers();
	updateOutputVectorColors();
	updateOutputVectorNumbers();
	updateSwatchColors();
	connectColorPicker();
	connectInputPageOpenClose();
	connectToggleView();
	connectInputsToUpdates();
}
logicInit();
