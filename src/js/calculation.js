// Get DOM elements
const inputField = document.getElementById("input");
const convertButton = document.getElementById("convert");
const resultElement = document.getElementById("result");

convertButton.addEventListener("click", () => {
	const inputText = inputField.value;
	const conversionResult = evaluateResultForInput(inputText);
	resultElement.textContent = `Result: ${conversionResult}`;
});

function evaluateResultForInput(inputText) {
	// Regular expression to match and parse input in the following format:
	// e.g., "10 kg and 200 g to lbs" or "5 kg to lbs"
	const regex = /(\d+\.?\d*)\s*(\w+)\s*(?:\band\b)?\s*(\d*\.?\d*)?\s*(\w+)\s*(?:\bto\b)?\s*(\w+)/;
	const match = inputText.match(regex);

	// Check if there is no match, and return an error message immediately
	if (!match) {
		return "Invalid input or unsupported unit conversion";
	}

	// Check if there are two units in the match array and handle accordingly
	if (isTwoUnitsInMatchArray(match)) {
		return convertFromTwoUnits(match);
	} else {
		return convertFromOneUnit(match);
	}
}

// Function to check if there are two units in the match array
function isTwoUnitsInMatchArray(match) {
	// Check if index 3 and 4 are defined (for "100 kg and 1g to lbs")
	return match[3] !== undefined && match[4] !== undefined;
}

// Function to perform unit conversion when there's only one unit in the match array
function convertFromOneUnit(match) {
	const [, value1, unit1, , toUnit] = match;
	// Conversion logic for single unit case
	const conversions = {
		kg: {
			lbs: 2.20462,
			kgs: 2.20462 // Handle "kgs" as well
		},
		feet: {
			inches: 12
		}
		// Add more unit conversions as needed
	};

	if (conversions[unit1] && conversions[unit1][toUnit]) {
		const result1 = parseFloat(value1) * conversions[unit1][toUnit];
		return `${value1} ${unit1} is approximately ${result1.toFixed(2)} ${toUnit}`;
	}

	return "Invalid unit conversion";
}

// Function to perform unit conversion when there are two units in the match array
function convertFromTwoUnits(match) {
	const [, value1, unit1, value2, unit2, , toUnit] = match;
	// Conversion logic for two units case
	const conversions = {
		kg: {
			lbs: 2.20462,
			kgs: 2.20462 // Handle "kgs" as well
		},
		feet: {
			inches: 12
		}
		// Add more unit conversions as needed
	};

	if (
		conversions[unit1] &&
		conversions[unit1][toUnit] &&
		conversions[unit2] &&
		conversions[unit2][toUnit]
	) {
		const result1 = parseFloat(value1) * conversions[unit1][toUnit];
		const result2 = parseFloat(value2) * conversions[unit2][toUnit];
		const totalResult = result1 + result2;
		return `${value1} ${unit1} and ${value2} ${unit2} is approximately ${totalResult.toFixed(
			2
		)} ${toUnit}`;
	}

	return "Invalid unit conversion";
}
